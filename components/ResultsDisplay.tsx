"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, ExternalLink, CheckCircle } from "lucide-react"
import { toast } from "react-hot-toast"

interface Result {
  id: string
  value: string
  type?: "success" | "warning" | "error" | "info"
  metadata?: Record<string, any>
}

interface ResultsDisplayProps {
  results: Result[]
  title: string
  isLoading?: boolean
  onExport?: (format: "txt" | "json" | "csv") => void
}

export default function ResultsDisplay({ results, title, isLoading, onExport }: ResultsDisplayProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success("Copied to clipboard!")
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  const copyAllResults = async () => {
    const allText = results.map((r) => r.value).join("\n")
    await copyToClipboard(allText, "all")
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "success":
        return "text-green-400 border-green-600/30"
      case "warning":
        return "text-yellow-400 border-yellow-600/30"
      case "error":
        return "text-red-400 border-red-600/30"
      case "info":
        return "text-blue-400 border-blue-600/30"
      default:
        return "text-green-400 border-green-600/30"
    }
  }

  if (isLoading) {
    return (
      <Card className="tool-dashboard p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="ml-3 text-green-400 font-body">Scanning...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="tool-dashboard p-6">
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-green-400 font-heading">{title}</h3>
            <Badge className="bg-green-600/20 text-green-400 border border-green-600/30">{results.length} found</Badge>
          </div>

          {results.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={copyAllResults}
                variant="outline"
                size="sm"
                className="text-green-400 border-green-600/30 hover:bg-green-600/10 font-body bg-transparent"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </Button>
              {onExport && (
                <div className="flex gap-1">
                  <Button
                    onClick={() => onExport("txt")}
                    variant="outline"
                    size="sm"
                    className="text-green-400 border-green-600/30 hover:bg-green-600/10 font-body"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    TXT
                  </Button>
                  <Button
                    onClick={() => onExport("json")}
                    variant="outline"
                    size="sm"
                    className="text-green-400 border-green-600/30 hover:bg-green-600/10 font-body"
                  >
                    JSON
                  </Button>
                  <Button
                    onClick={() => onExport("csv")}
                    variant="outline"
                    size="sm"
                    className="text-green-400 border-green-600/30 hover:bg-green-600/10 font-body"
                  >
                    CSV
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results List */}
        {results.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 font-body">No results found</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.id}
                className={`result-item p-3 rounded-lg flex items-center justify-between ${getTypeColor(result.type)}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm break-all">{result.value}</div>
                  {result.metadata && (
                    <div className="text-xs text-gray-400 mt-1">
                      {Object.entries(result.metadata).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-3">
                  <Button
                    onClick={() => copyToClipboard(result.value, result.id)}
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:bg-green-600/10"
                  >
                    {copiedId === result.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => window.open(`https://${result.value}`, "_blank")}
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:bg-green-600/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
