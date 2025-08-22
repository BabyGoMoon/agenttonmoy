"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import ToolDashboard from "@/components/ToolDashboard"
import SafetyGuards from "@/components/SafetyGuards"
import ToolForm from "@/components/ToolForm"
import ResultsDisplay from "@/components/ResultsDisplay"
import { exportResults, generateResultId } from "@/lib/exportUtils"
import { rateLimiter } from "@/lib/rateLimiter"
import { toast } from "react-hot-toast"

interface SubdomainResult {
  id: string
  value: string
  type: "success"
  metadata: {
    source: string
    ip?: string
    status?: number
  }
}

export default function SubdomainFinderPage() {
  const [showSafetyGuards, setShowSafetyGuards] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SubdomainResult[]>([])
  const [stats, setStats] = useState({
    total: 0,
    unique: 0,
    sources: 0,
    lastScan: "",
  })

  const formFields = [
    {
      name: "domain",
      label: "Target Domain",
      type: "text" as const,
      placeholder: "example.com",
      required: true,
      description: "Enter the root domain to scan for subdomains (without http/https)",
    },
    {
      name: "sources",
      label: "Data Sources",
      type: "select" as const,
      required: true,
      options: [
        { value: "all", label: "All Sources (Recommended)" },
        { value: "passive", label: "Passive Sources Only" },
        { value: "dns", label: "DNS Records Only" },
        { value: "crt", label: "Certificate Transparency" },
      ],
      description: "Choose which data sources to use for subdomain discovery",
    },
    {
      name: "timeout",
      label: "Timeout (seconds)",
      type: "number" as const,
      placeholder: "30",
      description: "Maximum time to wait for results from each source",
    },
  ]

  const handleSafetyConfirm = () => {
    setShowSafetyGuards(false)
  }

  const handleSubmit = async (data: Record<string, any>) => {
    const clientId = "subdomain-" + Date.now()

    if (!rateLimiter.isAllowed(clientId)) {
      toast.error("Rate limit exceeded. Please wait before making another request.")
      return
    }

    setIsLoading(true)
    setResults([])

    try {
      const response = await fetch("/api/tools/subdomain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to scan subdomains")

      const scanResults = await response.json()

      const formattedResults: SubdomainResult[] = scanResults.subdomains.map((subdomain: any) => ({
        id: generateResultId(),
        value: subdomain.domain,
        type: "success" as const,
        metadata: {
          source: subdomain.source || "unknown",
          ip: subdomain.ip,
          status: subdomain.status,
        },
      }))

      setResults(formattedResults)
      setStats({
        total: formattedResults.length,
        unique: new Set(formattedResults.map((r) => r.value)).size,
        sources: new Set(formattedResults.map((r) => r.metadata.source)).size,
        lastScan: new Date().toLocaleString(),
      })

      toast.success(`Found ${formattedResults.length} subdomains`)
    } catch (error) {
      toast.error("Failed to scan subdomains. Please try again.")
      console.error("Subdomain scan error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: "txt" | "json" | "csv") => {
    const exportData = results.map((r) => ({
      subdomain: r.value,
      source: r.metadata.source,
      ip: r.metadata.ip || "",
      status: r.metadata.status || "",
    }))

    exportResults(exportData, `subdomains-${new Date().toISOString().split("T")[0]}`, format)
    toast.success(`Exported ${results.length} results as ${format.toUpperCase()}`)
  }

  const dashboardStats = [
    { label: "Total Found", value: stats.total, color: "green" as const },
    { label: "Unique", value: stats.unique, color: "blue" as const },
    { label: "Sources", value: stats.sources, color: "yellow" as const },
    { label: "Last Scan", value: stats.lastScan || "Never", color: "green" as const },
  ]

  return (
    <ToolDashboard
      title="Subdomain Finder"
      description="Discover subdomains using passive reconnaissance techniques"
      icon={<Globe className="w-6 h-6 text-green-400" />}
      stats={dashboardStats}
    >
      {showSafetyGuards ? (
        <SafetyGuards onConfirm={handleSafetyConfirm} isLoading={isLoading} toolName="Subdomain Finder" />
      ) : (
        <div className="space-y-6">
          <ToolForm
            title="Subdomain Discovery Configuration"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
          <ResultsDisplay
            results={results}
            title="Discovered Subdomains"
            isLoading={isLoading}
            onExport={handleExport}
          />
        </div>
      )}
    </ToolDashboard>
  )
}
