"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import ToolDashboard from "@/components/ToolDashboard"
import SafetyGuards from "@/components/SafetyGuards"
import ToolForm from "@/components/ToolForm"
import ResultsDisplay from "@/components/ResultsDisplay"
import { exportResults, generateResultId } from "@/lib/exportUtils"
import { rateLimiter } from "@/lib/rateLimiter"
import { toast } from "react-hot-toast"

interface RedirectResult {
  id: string
  value: string
  type: "success" | "warning" | "error"
  metadata: {
    parameter: string
    payload: string
    redirect_url: string
    method: string
    status_code: number
    severity: string
    bypass_technique: string
  }
}

export default function OpenRedirectPage() {
  const [showSafetyGuards, setShowSafetyGuards] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<RedirectResult[]>([])
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
      placeholder: "https://example.com/login?redirect=dashboard",
      required: true,
      description: "Enter the URL with redirect parameters to test",
    },
    {
      name: "parameters",
      label: "Redirect Parameters",
      type: "textarea" as const,
      placeholder: "redirect, url, next, return_to, goto, destination",
      description: "Comma-separated list of parameters to test (leave empty to auto-detect common ones)",
    },
    {
      name: "redirectTarget",
      label: "Redirect Target",
      type: "text" as const,
      placeholder: "https://evil.com",
      required: true,
      description: "The malicious URL to redirect to (use a domain you control for testing)",
    },
    {
      name: "testType",
      label: "Test Type",
      type: "select" as const,
      required: true,
      options: [
        { value: "all", label: "All Techniques" },
        { value: "basic", label: "Basic Redirects" },
        { value: "bypass", label: "Filter Bypasses" },
        { value: "protocol", label: "Protocol Manipulation" },
        { value: "encoding", label: "Encoding Techniques" },
      ],
      description: "Choose the type of redirect testing to perform",
    },
    {
      name: "followRedirects",
      label: "Follow Redirects",
      type: "select" as const,
      required: true,
      options: [
        { value: "true", label: "Yes (Recommended)" },
        { value: "false", label: "No" },
      ],
      description: "Whether to follow HTTP redirects to verify the vulnerability",
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
    const clientId = "redirect-" + Date.now()

    if (!rateLimiter.isAllowed(clientId)) {
      toast.error("Rate limit exceeded. Please wait before making another request.")
      return
    }

    setIsLoading(true)
    setResults([])

    try {
      const response = await fetch("/api/tools/open-redirect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to test for open redirect vulnerabilities")
      }

      const scanResults = await response.json()

      const formattedResults: RedirectResult[] = scanResults.vulnerabilities.map((vuln: any) => ({
        id: generateResultId(),
        value: `${vuln.parameter}: ${vuln.bypass_technique}`,
        type: vuln.severity === "High" ? "error" : vuln.severity === "Medium" ? "warning" : "success",
        metadata: {
          parameter: vuln.parameter,
          payload: vuln.payload,
          redirect_url: vuln.redirect_url,
          method: vuln.method,
          status_code: vuln.status_code,
          severity: vuln.severity,
          bypass_technique: vuln.bypass_technique,
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
        toast.success(`Found ${formattedResults.length} potential open redirect vulnerabilities`)
      } else {
        toast.success("No open redirect vulnerabilities detected")
      }
    } catch (error) {
      toast.error("Failed to test for open redirects. Please try again.")
      console.error("Open redirect scan error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: "txt" | "json" | "csv") => {
    const exportData = results.map((r) => ({
      parameter: r.metadata.parameter,
      payload: r.metadata.payload,
      redirect_url: r.metadata.redirect_url,
      method: r.metadata.method,
      status_code: r.metadata.status_code,
      severity: r.metadata.severity,
      bypass_technique: r.metadata.bypass_technique,
    }))

    exportResults(exportData, `open-redirect-${new Date().toISOString().split("T")[0]}`, format)
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
      title="Open Redirect Tester"
      description="Test for open redirect vulnerabilities with advanced bypass techniques"
      icon={<ExternalLink className="w-6 h-6 text-green-400" />}
      stats={dashboardStats}
    >
      {showSafetyGuards ? (
        <SafetyGuards onConfirm={handleSafetyConfirm} isLoading={isLoading} toolName="Open Redirect Tester" />
      ) : (
        <div className="space-y-6">
          <ToolForm
            title="Open Redirect Vulnerability Scanner"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <ResultsDisplay
            results={results}
            title="Open Redirect Vulnerabilities Found"
            isLoading={isLoading}
            onExport={handleExport}
          />
        </div>
      )}
    </ToolDashboard>
  )
}
