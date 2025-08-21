"use client"

import { useState } from "react"
import { Zap } from "lucide-react"
import ToolDashboard from "@/components/ToolDashboard"
import SafetyGuards from "@/components/SafetyGuards"
import ToolForm from "@/components/ToolForm"
import ResultsDisplay from "@/components/ResultsDisplay"
import { exportResults, generateResultId } from "@/lib/exportUtils"
import { rateLimiter } from "@/lib/rateLimiter"
import { toast } from "react-hot-toast"

interface XSSResult {
  id: string
  value: string
  type: "success" | "warning" | "error"
  metadata: {
    payload: string
    parameter: string
    method: string
    vulnerability_type: string
    severity: string
    context: string
  }
}

export default function XSSScannerPage() {
  const [showSafetyGuards, setShowSafetyGuards] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<XSSResult[]>([])
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
      placeholder: "https://example.com/search?q=test",
      required: true,
      description: "Enter the URL with parameters to test for XSS vulnerabilities",
    },
    {
      name: "parameters",
      label: "Parameters to Test",
      type: "textarea" as const,
      placeholder: "q, search, input, name, comment",
      description: "Comma-separated list of parameters to test (leave empty to auto-detect)",
    },
    {
      name: "payloadType",
      label: "Payload Type",
      type: "select" as const,
      required: true,
      options: [
        { value: "all", label: "All Payload Types" },
        { value: "reflected", label: "Reflected XSS" },
        { value: "stored", label: "Stored XSS" },
        { value: "dom", label: "DOM-based XSS" },
        { value: "blind", label: "Blind XSS" },
      ],
      description: "Choose the type of XSS payloads to test",
    },
    {
      name: "intensity",
      label: "Scan Intensity",
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
    const clientId = "xss-" + Date.now()

    if (!rateLimiter.isAllowed(clientId)) {
      toast.error("Rate limit exceeded. Please wait before making another request.")
      return
    }

    setIsLoading(true)
    setResults([])

    try {
      const response = await fetch("/api/tools/xss-scanner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to scan for XSS vulnerabilities")
      }

      const scanResults = await response.json()

      const formattedResults: XSSResult[] = scanResults.vulnerabilities.map((vuln: any) => ({
        id: generateResultId(),
        value: `${vuln.parameter}: ${vuln.vulnerability_type}`,
        type: vuln.severity === "High" ? "error" : vuln.severity === "Medium" ? "warning" : "success",
        metadata: {
          payload: vuln.payload,
          parameter: vuln.parameter,
          method: vuln.method,
          vulnerability_type: vuln.vulnerability_type,
          severity: vuln.severity,
          context: vuln.context,
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
        toast.success(`Found ${formattedResults.length} potential XSS vulnerabilities`)
      } else {
        toast.success("No XSS vulnerabilities detected")
      }
    } catch (error) {
      toast.error("Failed to scan for XSS. Please try again.")
      console.error("XSS scan error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: "txt" | "json" | "csv") => {
    const exportData = results.map((r) => ({
      parameter: r.metadata.parameter,
      vulnerability_type: r.metadata.vulnerability_type,
      severity: r.metadata.severity,
      payload: r.metadata.payload,
      method: r.metadata.method,
      context: r.metadata.context,
    }))

    exportResults(exportData, `xss-scan-${new Date().toISOString().split("T")[0]}`, format)
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
      title="XSS Scanner"
      description="Advanced Cross-Site Scripting vulnerability detection and payload testing"
      icon={<Zap className="w-6 h-6 text-green-400" />}
      stats={dashboardStats}
    >
      {showSafetyGuards ? (
        <SafetyGuards onConfirm={handleSafetyConfirm} isLoading={isLoading} toolName="XSS Scanner" />
      ) : (
        <div className="space-y-6">
          <ToolForm
            title="XSS Vulnerability Scanner Configuration"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <ResultsDisplay
            results={results}
            title="XSS Vulnerabilities Found"
            isLoading={isLoading}
            onExport={handleExport}
          />
        </div>
      )}
    </ToolDashboard>
  )
}
