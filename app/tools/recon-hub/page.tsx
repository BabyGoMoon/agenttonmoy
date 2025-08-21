"use client"

import { useState } from "react"
import { Terminal } from "lucide-react"
import ToolDashboard from "@/components/ToolDashboard"
import SafetyGuards from "@/components/SafetyGuards"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ReconHubPage() {
  const [showSafetyGuards, setShowSafetyGuards] = useState(true)

  const reconTools = [
    {
      name: "Subdomain Finder",
      description: "Discover subdomains using passive techniques",
      href: "/tools/subdomain",
      category: "Discovery",
    },
    {
      name: "DNS Scanner",
      description: "Comprehensive DNS record enumeration",
      href: "/tools/dns-scanner",
      category: "Discovery",
    },
    {
      name: "WHOIS Lookup",
      description: "Domain registration information",
      href: "/tools/whois",
      category: "Information",
    },
    {
      name: "HTTP Headers",
      description: "Security headers analysis",
      href: "/tools/http-headers",
      category: "Analysis",
    },
    {
      name: "XSS Scanner",
      description: "Cross-site scripting detection",
      href: "/tools/xss-scanner",
      category: "Vulnerability",
    },
    {
      name: "SQLi Tester",
      description: "SQL injection vulnerability testing",
      href: "/tools/custom-sqli",
      category: "Vulnerability",
    },
    {
      name: "Open Redirect",
      description: "Redirect vulnerability testing",
      href: "/tools/open-redirect",
      category: "Vulnerability",
    },
    {
      name: "LFI Checker",
      description: "Local file inclusion testing",
      href: "/tools/lfi-checker",
      category: "Vulnerability",
    },
  ]

  const handleSafetyConfirm = () => {
    setShowSafetyGuards(false)
  }

  const categories = ["Discovery", "Information", "Analysis", "Vulnerability"]

  return (
    <ToolDashboard
      title="Recon Hub"
      description="Central hub for reconnaissance and security testing tools"
      icon={<Terminal className="w-6 h-6 text-green-400" />}
    >
      {showSafetyGuards ? (
        <SafetyGuards onConfirm={handleSafetyConfirm} toolName="Recon Hub" />
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <h3 className="text-xl font-bold text-green-400 font-heading">{category} Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reconTools
                  .filter((tool) => tool.category === category)
                  .map((tool) => (
                    <Card
                      key={tool.name}
                      className="tool-card bg-gray-800/50 border-green-600/30 hover:border-green-500 p-4"
                    >
                      <div className="space-y-3">
                        <h4 className="text-lg font-bold text-green-400 font-heading">{tool.name}</h4>
                        <p className="text-sm text-gray-400 font-body">{tool.description}</p>
                        <Link href={tool.href}>
                          <Button
                            className="w-full bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/30 font-body"
                            variant="outline"
                          >
                            Launch Tool
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolDashboard>
  )
}
