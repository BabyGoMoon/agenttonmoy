"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import ToolDashboard from "@/components/ToolDashboard"
import SafetyGuards from "@/components/SafetyGuards"
import ToolForm from "@/components/ToolForm"
import ResultsDisplay from "@/components/ResultsDisplay"
import { exportResults, generateResultId } from "@/lib/exportUtils"
import { rateLimiter } from "@/lib/rateLimiter"
import { toast } from "react-hot-toast"

interface WhoisResult {
  id: string
  value: string
  type: "success"
  metadata: {
    field: string
    data: string
  }
}

export default function WhoisPage() {
  const [showSafetyGuards, setShowSafetyGuards] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<WhoisResult[]>([])
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
      description: "Enter the domain name to lookup WHOIS information",
    },
  ]

  const handleSafetyConfirm = () => {
    setShowSafetyGuards(false)
  }

  const handleSubmit = async (data: Record<string, any>) => {
    const clientId = "whois-" + Date.now()

    if (!rateLimiter.isAllowed(clientId)) {
      toast.error("Rate limit exceeded. Please wait before making another request.")
      return
    }

    setIsLoading(true)
    setResults([])

    try {
      // Simulate WHOIS lookup (in real implementation, you would use a WHOIS API)
      const mockWhoisData = [
        { field: "Domain Name", data: data.domain.toUpperCase() },
        { field: "Registry Domain ID", data: "D123456789-LROR" },
        { field: "Registrar WHOIS Server", data: "whois.registrar.com" },
        { field: "Registrar URL", data: "http://www.registrar.com" },
        { field: "Updated Date", data: "2024-01-15T10:30:00Z" },
        { field: "Creation Date", data: "2020-03-10T14:20:00Z" },
        { field: "Registry Expiry Date", data: "2025-03-10T14:20:00Z" },
        { field: "Registrar", data: "Example Registrar Inc." },
        { field: "Registrar IANA ID", data: "123" },
        { field: "Registrar Abuse Contact Email", data: "abuse@registrar.com" },
        { field: "Registrar Abuse Contact Phone", data: "+1.2345678900" },
        { field: "Domain Status", data: "clientTransferProhibited" },
        { field: "Name Server", data: "ns1.example.com" },
        { field: "Name Server", data: "ns2.example.com" },
        { field: "DNSSEC", data: "unsigned" },
      ]

      const formattedResults: WhoisResult[] = mockWhoisData.map((item) => ({
        id: generateResultId(),
        value: `${item.field}: ${item.data}`,
        type: "success" as const,
        metadata: {
          field: item.field,
          data: item.data,
        },
      }))

      setResults(formattedResults)
      setStats({
        total: formattedResults.length,
        lastScan: new Date().toLocaleString(),
      })

      toast.success(`Retrieved WHOIS information for ${data.domain}`)
    } catch (error) {
      toast.error("Failed to lookup WHOIS information. Please try again.")
      console.error("WHOIS lookup error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: "txt" | "json" | "csv") => {
    const exportData = results.map((r) => ({
      field: r.metadata.field,
      data: r.metadata.data,
    }))

    exportResults(exportData, `whois-${new Date().toISOString().split("T")[0]}`, format)
    toast.success(`Exported ${results.length} results as ${format.toUpperCase()}`)
  }

  const dashboardStats = [
    { label: "Fields Found", value: stats.total, color: "green" as const },
    { label: "Last Lookup", value: stats.lastScan || "Never", color: "blue" as const },
  ]

  return (
    <ToolDashboard
      title="WHOIS Lookup"
      description="Retrieve domain registration and ownership information"
      icon={<Eye className="w-6 h-6 text-green-400" />}
      stats={dashboardStats}
    >
      {showSafetyGuards ? (
        <SafetyGuards onConfirm={handleSafetyConfirm} isLoading={isLoading} toolName="WHOIS Lookup" />
      ) : (
        <div className="space-y-6">
          <ToolForm
            title="Domain WHOIS Information Lookup"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <ResultsDisplay results={results} title="WHOIS Information" isLoading={isLoading} onExport={handleExport} />
        </div>
      )}
    </ToolDashboard>
  )
}
