"use client"

import { useState } from "react"
import { Database } from "lucide-react"
import ToolDashboard from "@/components/ToolDashboard"
import SafetyGuards from "@/components/SafetyGuards"
import ToolForm from "@/components/ToolForm"
import ResultsDisplay from "@/components/ResultsDisplay"
import { exportResults, generateResultId } from "@/lib/exportUtils"
import { rateLimiter } from "@/lib/rateLimiter"
import { toast } from "react-hot-toast"

interface SQLiResult {
  id: string
  value: string
  type: "success" | "warning" | "error"
  metadata: {
    parameter: string
    payload: string
    injection_type: string
    database_type: string
    method: string
    severity: string
    technique: string
    evidence: string
  }
}

export default function CustomSQLiPage() {
  const [showSafetyGuards, setShowSafetyGuards] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SQLiResult[]>([])
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    lastScan: "",
  })

  const formFields = [
    {
      name: "url",
      label: "Target URL",
      type: "text" as const,
      placeholder: "https://example.com/product.php?id=1",
      required: true,
      description: "Enter the URL with parameters to test for SQL injection",
    },
    {
      name: "parameters",
      label: "Parameters to Test",
      type: "textarea" as const,
      placeholder: "id, user_id, product_id, search, category",
      description: "Comma-separated list of parameters to test (leave empty to auto-detect)",
    },
    {
      name: "injectionType",
      label: "Injection Type",
      type: "select" as const,
      required: true,
      options: [
        { value: "all", label: "All Injection Types" },
        { value: "union", label: "Union-based SQLi" },
        { value: "boolean", label: "Boolean-based Blind SQLi" },
        { value: "time", label: "Time-based Blind SQLi" },
        { value: "error", label: "Error-based SQLi" },
        { value: "stacked", label: "Stacked Queries" },
      ],
      description: "Choose the type of SQL injection to test",
    },
    {
      name: "databaseType",
      label: "Database Type",
      type: "select" as const,
      required: true,
      options: [
        { value: "auto", label: "Auto-detect" },
        { value: "mysql", label: "MySQL" },
        { value: "postgresql", label: "PostgreSQL" },
        { value: "mssql", label: "Microsoft SQL Server" },
        { value: "oracle", label: "Oracle" },
        { value: "sqlite", label: "SQLite" },
      ],
      description: "Target database type for optimized payloads",
    },
    {
      name: "testMethod",
      label: "HTTP Method",
      type: "select" as const,
      required: true,
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "both", label: "Both GET & POST" },
      ],
      description: "HTTP method to use for testing",
    },
    {
      name: "intensity",
      label: "Test Intensity",
      type: "select" as const,
      required: true,
      options: [
        { value: "low", label: "Low (Basic payloads)" },
        { value: "medium", label: "Medium (Common bypasses)" },
        { value: "high", label: "High (Advanced evasion)" },
      ],
      description: "Higher intensity uses more payloads and evasion techniques",
    },
    {
      name: "timeout",
      label: "Request Timeout (seconds)",
      type: "number" as const,
      placeholder: "10",
      description: "Maximum time to wait for each request",
    },
  ]

  const handleSafetyConfirm = () => {
    setShowSafetyGuards(false)
  }

  const handleSubmit = async (data: Record<string, any>) => {
    const clientId = "sqli-" + Date.now()

    if (!rateLimiter.isAllowed(clientId)) {
      toast.error("Rate limit exceeded. Please wait before making another request.")
      return
    }

    setIsLoading(true)
    setResults([])

    try {
      const response = await fetch("/api/tools/custom-sqli", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to test for SQL injection vulnerabilities")
      }

      const scanResults = await response.json()

      const formattedResults: SQLiResult[] = scanResults.vulnerabilities.map((vuln: any) => ({
        id: generateResultId(),
        value: `${vuln.parameter}: ${vuln.injection_type}`,
        type: vuln.severity === "High" ? "error" : vuln.severity === "Medium" ? "warning" : "success",
        metadata: {
          parameter: vuln.parameter,
          payload: vuln.payload,
          injection_type: vuln.injection_type,
          database_type: vuln.database_type,
          method: vuln.method,
          severity: vuln.severity,
          technique: vuln.technique,
          evidence: vuln.evidence,
        },
      }))

      setResults(formattedResults)

      const severityCounts = formattedResults.reduce(
        (acc, result) => {
          if (result.metadata.severity === "High") acc.high++
          else if (result.metadata.severity === "Medium") acc.medium++
          else acc.low++
          return acc
        },
        { high: 0, medium: 0, low: 0 },
      )

      setStats({
        total: formattedResults.length,
        ...severityCounts,
        lastScan: new Date().toLocaleString(),
      })

      if (formattedResults.length > 0) {
        toast.success(`Found ${formattedResults.length} potential SQL injection vulnerabilities`)
      } else {
        toast.success("No SQL injection vulnerabilities detected")
      }
    } catch (error) {
      toast.error("Failed to test for SQL injection. Please try again.")
      console.error("SQLi scan error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: "txt" | "json" | "csv") => {
    const exportData = results.map((r) => ({
      parameter: r.metadata.parameter,
      payload: r.metadata.payload,
      injection_type: r.metadata.injection_type,
      database_type: r.metadata.database_type,
      method: r.metadata.method,
      severity: r.metadata.severity,
      technique: r.metadata.technique,
      evidence: r.metadata.evidence,
    }))

    exportResults(exportData, `sqli-scan-${new Date().toISOString().split("T")[0]}`, format)
    toast.success(`Exported ${results.length} results as ${format.toUpperCase()}`)
  }

  const dashboardStats = [
    { label: "Total Found", value: stats.total, color: "green" as const },
    { label: "High Risk", value: stats.high, color: "red" as const },
    { label: "Medium Risk", value: stats.medium, color: "yellow" as const },
    { label: "Low Risk", value: stats.low, color: "blue" as const },
  ]

  return (
    <ToolDashboard
      title="Custom SQLi Tester"
      description="Advanced SQL injection vulnerability detection with database-specific payloads"
      icon={<Database className="w-6 h-6 text-green-400" />}
      stats={dashboardStats}
    >
      {showSafetyGuards ? (
        <SafetyGuards onConfirm={handleSafetyConfirm} isLoading={isLoading} toolName="Custom SQLi Tester" />
      ) : (
        <div className="space-y-6">
          <ToolForm
            title="SQL Injection Vulnerability Scanner"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <ResultsDisplay
            results={results}
            title="SQL Injection Vulnerabilities Found"
            isLoading={isLoading}
            onExport={handleExport}
          />
        </div>
      )}
    </ToolDashboard>
  )
}
