"use client"

import { useState } from "react"
import { Wifi } from "lucide-react"
import ToolDashboard from "@/components/ToolDashboard"
import SafetyGuards from "@/components/SafetyGuards"
import ToolForm from "@/components/ToolForm"
import ResultsDisplay from "@/components/ResultsDisplay"
import { exportResults, generateResultId } from "@/lib/exportUtils"
import { rateLimiter } from "@/lib/rateLimiter"
import { toast } from "react-hot-toast"

interface DNSResult {
  id: string
  value: string
  type: "success"
  metadata: {
    record_type: string
    value: string
    ttl?: number
  }
}

export default function DNSScannerPage() {
  const [showSafetyGuards, setShowSafetyGuards] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<DNSResult[]>([])
  const [stats, setStats] = useState({
    total: 0,
    lastScan: "",
  })

  const formFields = [
    {
      name: "domain",
      label: "Domain Name",
      type: "text" as const,
      placeholder: "example.com",
      required: true,
      description: "Enter the domain name to scan DNS records",
    },
    {
      name: "recordTypes",
      label: "Record Types",
      type: "select" as const,
      required: true,
      options: [
        { value: "all", label: "All Record Types" },
        { value: "basic", label: "Basic (A, AAAA, MX, NS)" },
        { value: "security", label: "Security (SPF, DKIM, DMARC)" },
        { value: "custom", label: "Custom Selection" },
      ],
      description: "Choose which DNS record types to query",
    },
  ]

  const handleSafetyConfirm = () => {
    setShowSafetyGuards(false)
  }

  const handleSubmit = async (data: Record<string, any>) => {
    const clientId = "dns-" + Date.now()

    if (!rateLimiter.isAllowed(clientId)) {
      toast.error("Rate limit exceeded. Please wait before making another request.")
      return
    }

    setIsLoading(true)
    setResults([])

    try {
      // Simulate DNS lookup (in real implementation, you would use DNS APIs)
      const mockDNSData = [
        { record_type: "A", value: "93.184.216.34", ttl: 3600 },
        { record_type: "AAAA", value: "2606:2800:220:1:248:1893:25c8:1946", ttl: 3600 },
        { record_type: "MX", value: "10 mail.example.com", ttl: 3600 },
        { record_type: "NS", value: "ns1.example.com", ttl: 86400 },
        { record_type: "NS", value: "ns2.example.com", ttl: 86400 },
        { record_type: "TXT", value: "v=spf1 include:_spf.example.com ~all", ttl: 3600 },
        { record_type: "CNAME", value: "www.example.com", ttl: 3600 },
        {
          record_type: "SOA",
          value: "ns1.example.com admin.example.com 2024011501 7200 3600 604800 86400",
          ttl: 86400,
        },
      ]

      const formattedResults: DNSResult[] = mockDNSData.map((record) => ({
        id: generateResultId(),
        value: `${record.record_type}: ${record.value}`,
        type: "success" as const,
        metadata: {
          record_type: record.record_type,
          value: record.value,
          ttl: record.ttl,
        },
      }))

      setResults(formattedResults)
      setStats({
        total: formattedResults.length,
        lastScan: new Date().toLocaleString(),
      })

      toast.success(`Found ${formattedResults.length} DNS records for ${data.domain}`)
    } catch (error) {
      toast.error("Failed to scan DNS records. Please try again.")
      console.error("DNS scan error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: "txt" | "json" | "csv") => {
    const exportData = results.map((r) => ({
      record_type: r.metadata.record_type,
      value: r.metadata.value,
      ttl: r.metadata.ttl,
    }))

    exportResults(exportData, `dns-scan-${new Date().toISOString().split("T")[0]}`, format)
    toast.success(`Exported ${results.length} results as ${format.toUpperCase()}`)
  }

  const dashboardStats = [
    { label: "Records Found", value: stats.total, color: "green" as const },
    { label: "Last Scan", value: stats.lastScan || "Never", color: "blue" as const },
  ]

  return (
    <ToolDashboard
      title="DNS Scanner"
      description="Comprehensive DNS record enumeration and analysis"
      icon={<Wifi className="w-6 h-6 text-green-400" />}
      stats={dashboardStats}
    >
      {showSafetyGuards ? (
        <SafetyGuards onConfirm={handleSafetyConfirm} isLoading={isLoading} toolName="DNS Scanner" />
      ) : (
        <div className="space-y-6">
          <ToolForm title="DNS Record Scanner" fields={formFields} onSubmit={handleSubmit} isLoading={isLoading} />

          <ResultsDisplay results={results} title="DNS Records Found" isLoading={isLoading} onExport={handleExport} />
        </div>
      )}
    </ToolDashboard>
  )
}
