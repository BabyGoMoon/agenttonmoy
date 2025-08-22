"use client"

import { useMemo, useState } from "react"
import { Globe } from "lucide-react"
import ToolDashboard from "@/components/ToolDashboard"
// import SafetyGuards from "@/components/SafetyGuards" // ⟵ removed (we inline a neon version below)
import ToolForm from "@/components/ToolForm"
import ResultsDisplay from "@/components/ResultsDisplay"
import { exportResults, generateResultId } from "@/lib/exportUtils"
import { rateLimiter } from "@/lib/rateLimiter"
import { toast } from "react-hot-toast"

/* ---------------- Neon Checkbox (self-contained) ---------------- */
function NeonCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="relative inline-flex select-none items-center gap-3">
      {/* Hidden native checkbox for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
        className="peer sr-only"
      />
      {/* Box */}
      <span
        className={[
          "relative h-[22px] w-[22px] rounded-md border",
          "border-white/25 bg-white/5",
          "shadow-[inset_0_0_0_2px_rgba(0,0,0,0.35),0_2px_12px_rgba(0,0,0,0.3)]",
          "transition-all duration-200",
          // glow & color when checked
          "peer-checked:border-emerald-500 peer-checked:bg-emerald-500/15",
          "peer-checked:shadow-[0_0_0_2px_rgba(16,185,129,.25),0_6px_26px_rgba(16,185,129,.35)]",
          // hover border hint
          "peer-hover:border-emerald-400/60",
        ].join(" ")}
      />
      {/* Checkmark */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={[
          "pointer-events-none absolute left-[3px] top-[3px] h-4 w-4",
          "opacity-0 scale-75 transition-all duration-150",
          "drop-shadow-[0_0_6px_rgba(16,185,129,.65)]",
          "peer-checked:opacity-100 peer-checked:scale-100",
        ].join(" ")}
      >
        <path
          d="M5 13l4 4L19 7"
          fill="none"
          stroke="rgb(16,185,129)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="text-[0.95rem] leading-snug text-white/85">{label}</span>
    </label>
  )
}

/* --------------- Inline Safety Gate (neon style) --------------- */
function SafetyGate({
  onConfirm,
  isLoading,
  toolName,
}: {
  onConfirm: () => void
  isLoading?: boolean
  toolName: string
}) {
  const items = [
    "I have explicit written authorization to test the target",
    "This is for educational or authorized security research only",
    "I understand that unauthorized testing is illegal",
    "I will use this tool ethically and responsibly",
  ]
  const [checks, setChecks] = useState<boolean[]>(Array(items.length).fill(false))
  const allChecked = useMemo(() => checks.every(Boolean), [checks])

  return (
    <div className="space-y-4">
      {items.map((label, idx) => (
        <NeonCheckbox
          key={idx}
          label={label}
          checked={checks[idx]}
          onChange={(v) => {
            const next = [...checks]
            next[idx] = v
            setChecks(next)
          }}
        />
      ))}

      <button
        type="button"
        disabled={!allChecked || !!isLoading}
        aria-disabled={!allChecked || !!isLoading}
        onClick={() => allChecked && onConfirm()}
        className={[
          "mt-4 w-full rounded-xl px-4 py-3 text-sm font-medium transition",
          allChecked && !isLoading
            ? "bg-emerald-500 text-black shadow-[0_0_0_1px_rgba(16,185,129,.35),0_8px_28px_rgba(16,185,129,.35)] hover:opacity-95"
            : "cursor-not-allowed bg-white/10 text-white/50",
        ].join(" ")}
      >
        {allChecked ? "I Confirm — Proceed with Tool" : "I Confirm — Proceed with Tool"}
      </button>
      <p className="text-xs text-white/50">
        Safety & Legal Requirements for <span className="text-emerald-400">{toolName}</span>
      </p>
    </div>
  )
}

/* ---------------------- Original page logic --------------------- */
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to scan subdomains")
      }

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
      icon={<Globe className="h-6 w-6 text-green-400" />}
      stats={dashboardStats}
    >
      {showSafetyGuards ? (
        <SafetyGate onConfirm={handleSafetyConfirm} isLoading={isLoading} toolName="Subdomain Finder" />
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
