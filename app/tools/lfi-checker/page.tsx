"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import ToolDashboard from "@/components/ToolDashboard"
import SafetyGuards from "@/components/SafetyGuards"
import ToolForm from "@/components/ToolForm"
import ResultsDisplay from "@/components/ResultsDisplay"
import { exportResults, generateResultId } from "@/lib/exportUtils"
import { rateLimiter } from "@/lib/rateLimiter"
import { toast } from "react-hot-toast"

interface LFIResult {
  id: string
  value: string
  type: "success" | "warning" | "error"
  metadata: {
    parameter: string
    payload: string
    file_path: string
    method: string
    severity: string
    technique: string
    evidence: string
  }
}

export default function LFICheckerPage() {
  const [showSafetyGuards, setShowSafetyGuards] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<LFIResult[]>([])
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
      placeholder: "https://example.com/page.php?file=home.txt",
      required: true,
      description: "Enter the URL with file inclusion parameters to test",
    },
    {
      name: "parameters",
      label: "File Parameters",
      type: "textarea" as const,
      placeholder: "file, page, include, path, doc, document",
      description: "Comma-separated list of parameters to test (leave empty to auto-detect common ones)",
    },
    {
      name: "targetFiles",
      label: "Target Files",
      type: "select" as const,
      required: true,
      options: [
        { value: "all", label: "All Common Files" },
        { value: "linux", label: "Linux System Files" },
        { value: "windows", label: "Windows System Files" },
        { value: "web", label: "Web Application Files" },
        { value: "custom", label: "Custom File List" },
      ],
      description: "Choose which system files to attempt to include",
    },
    {
      name: "customFiles",
      label: "Custom Files (if selected above)",
      type: "textarea" as const,
      placeholder: "/etc/passwd, /etc/hosts, C:\\windows\\system32\\drivers\\etc\\hosts",
      description: "Custom file paths to test (one per line or comma-separated)",
    },
    {
      name: "traversalDepth",
      label: "Directory Traversal Depth",
      type: "select" as const,
      required: true,
      options: [
        { value: "3", label: "3 levels (../../../)" },
        { value: "5", label: "5 levels (../../../../..)" },
        { value: "7", label: "7 levels (../../../../../../..)" },
        { value: "10", label: "10 levels (maximum)" },
      ],
      description: "Maximum directory traversal depth to attempt",
    },
    {
      name: "bypassTechniques",
      label: "Bypass Techniques",
      type: "select" as const,
      required: true,
      options: [
        { value: "all", label: "All Techniques" },
        { value: "basic", label: "Basic Traversal" },
        { value: "encoding", label: "URL Encoding" },
        { value: "nullbyte", label: "Null Byte Injection" },
        { value: "wrappers", label: "PHP Wrappers" },
      ],
      description: "Choose which bypass techniques to use",
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
    const clientId = "lfi-" + Date.now()

    if (!rateLimiter.isAllowed(clientId)) {
      toast.error("Rate limit exceeded. Please wait before making another request.")
      return
    }

    setIsLoading(true)
    setResults([])

    try {
      const response = await fetch("/api/tools/lfi-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to test for LFI vulnerabilities")
      }

      const scanResults = await response.json()

      const formattedResults: LFIResult[] = scanResults.vulnerabilities.map((vuln: any) => ({
        id: generateResultId(),
        value: `${vuln.parameter}: ${vuln.file_path}`,
        type: vuln.severity === "High" ? "error" : vuln.severity === "Medium" ? "warning" : "success",
        metadata: {
          parameter: vuln.parameter,
          payload: vuln.payload,
          file_path: vuln.file_path,
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
        toast.success(`Found ${formattedResults.length} potential LFI vulnerabilities`)
      } else {
        toast.success("No LFI vulnerabilities detected")
      }
    } catch (error) {
      toast.error("Failed to test for LFI vulnerabilities. Please try again.")
      console.error("LFI scan error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: "txt" | "json" | "csv") => {
    const exportData = results.map((r) => ({
      parameter: r.metadata.parameter,
      payload: r.metadata.payload,
      file_path: r.metadata.file_path,
      method: r.metadata.method,
      severity: r.metadata.severity,
      technique: r.metadata.technique,
      evidence: r.metadata.evidence,
    }))

    exportResults(exportData, `lfi-scan-${new Date().toISOString().split("T")[0]}`, format)
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
      title="LFI Checker"
      description="Test for Local File Inclusion vulnerabilities with advanced traversal techniques"
      icon={<FileText className="w-6 h-6 text-green-400" />}
      stats={dashboardStats}
    >
      {showSafetyGuards ? (
        <SafetyGuards onConfirm={handleSafetyConfirm} isLoading={isLoading} toolName="LFI Checker" />
      ) : (
        <div className="space-y-6">
          <ToolForm
            title="Local File Inclusion Vulnerability Scanner"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <ResultsDisplay
            results={results}
            title="LFI Vulnerabilities Found"
            isLoading={isLoading}
            onExport={handleExport}
          />
        </div>
      )}
    </ToolDashboard>
  )
}
