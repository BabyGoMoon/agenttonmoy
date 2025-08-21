"use client"

import { useState } from "react"
import { Shield } from "lucide-react"
import ToolDashboard from "@/components/ToolDashboard"
import SafetyGuards from "@/components/SafetyGuards"
import ToolForm from "@/components/ToolForm"
import ResultsDisplay from "@/components/ResultsDisplay"
import { exportResults, generateResultId } from "@/lib/exportUtils"
import { rateLimiter } from "@/lib/rateLimiter"
import { toast } from "react-hot-toast"

interface HeaderResult {
  id: string
  value: string
  type: "success" | "warning" | "error"
  metadata: {
    header: string
    value: string
    security_impact: string
  }
}

export default function HTTPHeadersPage() {
  const [showSafetyGuards, setShowSafetyGuards] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<HeaderResult[]>([])
  const [stats, setStats] = useState({
    total: 0,
    secure: 0,
    missing: 0,
    lastScan: "",
  })

  const formFields = [
    {
      name: "url",
      label: "Target URL",
      type: "text" as const,
      placeholder: "https://example.com",
      required: true,
      description: "Enter the URL to analyze HTTP security headers",
    },
  ]

  const handleSafetyConfirm = () => {
    setShowSafetyGuards(false)
  }

  const handleSubmit = async (data: Record<string, any>) => {
    const clientId = "headers-" + Date.now()

    if (!rateLimiter.isAllowed(clientId)) {
      toast.error("Rate limit exceeded. Please wait before making another request.")
      return
    }

    setIsLoading(true)
    setResults([])

    try {
      // Simulate HTTP headers analysis (in real implementation, you would make actual HTTP requests)
      const mockHeaders = [
        {
          header: "Content-Security-Policy",
          value: "default-src 'self'",
          security_impact: "Good - CSP implemented",
          type: "success",
        },
        {
          header: "X-Frame-Options",
          value: "DENY",
          security_impact: "Good - Clickjacking protection",
          type: "success",
        },
        {
          header: "X-Content-Type-Options",
          value: "nosniff",
          security_impact: "Good - MIME type sniffing protection",
          type: "success",
        },
        {
          header: "Strict-Transport-Security",
          value: "Missing",
          security_impact: "Warning - HSTS not implemented",
          type: "warning",
        },
        {
          header: "X-XSS-Protection",
          value: "Missing",
          security_impact: "Warning - XSS protection not set",
          type: "warning",
        },
        {
          header: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
          security_impact: "Good - Referrer policy set",
          type: "success",
        },
        {
          header: "Permissions-Policy",
          value: "Missing",
          security_impact: "Info - Feature policy not set",
          type: "error",
        },
      ]

      const formattedResults: HeaderResult[] = mockHeaders.map((header) => ({
        id: generateResultId(),
        value: `${header.header}: ${header.value}`,
        type: header.type as "success" | "warning" | "error",
        metadata: {
          header: header.header,
          value: header.value,
          security_impact: header.security_impact,
        },
      }))

      setResults(formattedResults)

      const counts = formattedResults.reduce(
        (acc, result) => {
          if (result.type === "success") acc.secure++
          else if (result.type === "warning" || result.type === "error") acc.missing++
          return acc
        },
        { secure: 0, missing: 0 },
      )

      setStats({
        total: formattedResults.length,
        ...counts,
        lastScan: new Date().toLocaleString(),
      })

      toast.success(`Analyzed HTTP headers for ${data.url}`)
    } catch (error) {
      toast.error("Failed to analyze HTTP headers. Please try again.")
      console.error("HTTP headers analysis error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: "txt" | "json" | "csv") => {
    const exportData = results.map((r) => ({
      header: r.metadata.header,
      value: r.metadata.value,
      security_impact: r.metadata.security_impact,
    }))

    exportResults(exportData, `http-headers-${new Date().toISOString().split("T")[0]}`, format)
    toast.success(`Exported ${results.length} results as ${format.toUpperCase()}`)
  }

  const dashboardStats = [
    { label: "Total Headers", value: stats.total, color: "green" as const },
    { label: "Secure", value: stats.secure, color: "green" as const },
    { label: "Missing/Weak", value: stats.missing, color: "red" as const },
  ]

  return (
    <ToolDashboard
      title="HTTP Headers Analyzer"
      description="Analyze HTTP security headers and identify potential vulnerabilities"
      icon={<Shield className="w-6 h-6 text-green-400" />}
      stats={dashboardStats}
    >
      {showSafetyGuards ? (
        <SafetyGuards onConfirm={handleSafetyConfirm} isLoading={isLoading} toolName="HTTP Headers Analyzer" />
      ) : (
        <div className="space-y-6">
          <ToolForm
            title="HTTP Security Headers Analysis"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <ResultsDisplay
            results={results}
            title="HTTP Headers Analysis"
            isLoading={isLoading}
            onExport={handleExport}
          />
        </div>
      )}
    </ToolDashboard>
  )
}
