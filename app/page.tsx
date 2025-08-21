"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlowCard } from "@/components/ui/spotlight-card"
import { SearchBar } from "@/components/ui/search-bar"
import MatrixBackground from "@/components/MatrixBackground"

export default function AgentTonmoy() {
  const tools = [
    {
      name: "Subdomain Finder",
      description: "Discover subdomains passively",
      href: "/tools/subdomain",
      icon: "🔍",
    },
    {
      name: "XSS Scanner",
      description: "Safe XSS reflection testing",
      href: "/tools/xss-scanner",
      icon: "⚡",
    },
    {
      name: "Open Redirect",
      description: "Test redirect vulnerabilities",
      href: "/tools/open-redirect",
      icon: "🔄",
    },
    {
      name: "LFI Checker",
      description: "Local file inclusion testing",
      href: "/tools/lfi-checker",
      icon: "📁",
    },
    {
      name: "Custom SQLi",
      description: "SQL injection payload lab",
      href: "/tools/custom-sqli",
      icon: "💉",
    },
    {
      name: "WHOIS Lookup",
      description: "Domain registration info",
      href: "/tools/whois",
      icon: "🌐",
    },
    {
      name: "DNS Scanner",
      description: "Extended DNS record lookup",
      href: "/tools/dns-scanner",
      icon: "🔎",
    },
    {
      name: "HTTP Headers",
      description: "Inspect HTTP headers",
      href: "/tools/http-headers",
      icon: "📋",
    },
    {
      name: "Recon Hub",
      description: "Research tools & helpers",
      href: "/tools/recon-hub",
      icon: "🎯",
    },
  ]

  const scrollToTools = () => {
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSearch = (query: string) => {
    // Find matching tool and navigate to it
    const matchingTool = tools.find((tool) => tool.name.toLowerCase().includes(query.toLowerCase()))
    if (matchingTool) {
      window.location.href = matchingTool.href
    }
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: `linear-gradient(135deg, 
        rgb(97, 207, 90) 0%, 
        rgb(99, 173, 88) 25%, 
        rgb(80, 134, 76) 50%, 
        rgb(62, 106, 61) 75%, 
        rgb(59, 75, 51) 100%)`,
      }}
    >
      <MatrixBackground />

      <div className="relative z-10 p-6">
        {/* Main Container with sleek frame */}
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500 p-1 shadow-2xl">
            {/* Top notch area */}
            <div className="flex justify-between items-center px-8 py-4">
              <div className="w-32"></div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 hover:bg-green-700 text-black font-bold">AGENT</Badge>
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 text-black font-bold">T</div>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex min-h-[700px] bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl mx-2 mb-2">
              {/* Left Sidebar */}
              <div className="w-20 flex flex-col items-center py-6 space-y-4">
                {/* Agent Tonmoy Logo */}
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-black font-bold text-lg">🐛</span>
                </div>

                {/* Navigation Icons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-gray-700/50 hover:bg-green-600/20 border border-green-600/30"
                >
                  <span className="text-green-400">🏠</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-gray-700/50 hover:bg-green-600/20 border border-green-600/30"
                >
                  <span className="text-green-400">🌐</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-gray-700/50 hover:bg-green-600/20 border border-green-600/30"
                >
                  <span className="text-green-400">🛡️</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-gray-700/50 hover:bg-green-600/20 border border-green-600/30"
                >
                  <span className="text-green-400">💾</span>
                </Button>

                {/* Terminal Icon */}
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mt-4 border border-green-600/50">
                  <span className="text-green-400 text-lg">💻</span>
                </div>

                <div className="flex-1"></div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-gray-700/50 hover:bg-green-600/20 border border-green-600/30"
                >
                  <span className="text-green-400">🔍</span>
                </Button>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8 relative overflow-y-auto">
                {/* Hero Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                  {/* Left Column - Text */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h1 className="text-5xl lg:text-6xl font-bold text-green-400 tracking-tight">AGENT TONMOY</h1>
                      <p className="text-xl text-green-300 font-medium">
                        Free powerful bug hunting tools, ethical & authorized only.
                      </p>
                    </div>

                    <div className="mb-6">
                      <SearchBar onSearch={handleSearch} />
                    </div>

                    <Button
                      onClick={scrollToTools}
                      className="bg-green-600 hover:bg-green-700 text-black font-bold px-8 py-3 rounded-full text-lg"
                    >
                      Start Hunting →
                    </Button>
                  </div>

                  <div className="h-80 lg:h-96 rounded-xl p-4 bg-gray-800/30 flex items-center justify-center relative overflow-hidden border border-green-600/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent"></div>
                    <div className="text-center relative z-10">
                      <div className="text-6xl mb-4 animate-pulse">🤖</div>
                      <p className="text-green-400 font-bold text-lg">MATRIX AGENT</p>
                      <p className="text-green-500/70 text-sm mt-2">Ethical Hacking Protocol</p>
                    </div>
                    {/* Matrix-style overlay */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="h-full w-full bg-gradient-to-b from-transparent via-green-600/5 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Tools Section */}
                <div id="tools" className="space-y-8">
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-green-400">Security Arsenal</h2>
                    <p className="text-green-300">Professional bug hunting tools for ethical security research</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool, index) => (
                      <GlowCard
                        key={index}
                        glowColor="green"
                        customSize={true}
                        className="cursor-pointer group bg-gray-800/50 border-green-600/30 hover:border-green-500 transition-all duration-300"
                      >
                        <div className="space-y-4 h-full flex flex-col">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                              <span className="text-green-400 text-lg">{tool.icon}</span>
                            </div>
                            <h3 className="text-lg font-bold text-green-400 group-hover:text-green-300">{tool.name}</h3>
                          </div>
                          <p className="text-sm text-gray-400 flex-1">{tool.description}</p>
                          <Link href={tool.href} className="mt-auto">
                            <Button
                              className="w-full bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/30"
                              variant="outline"
                            >
                              Open Tool
                            </Button>
                          </Link>
                        </div>
                      </GlowCard>
                    ))}
                  </div>
                </div>

                {/* Disclaimer Banner */}
                <div className="mt-12">
                  <Card className="bg-red-900/20 border-red-600/50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 text-xl">🛡️</span>
                      <p className="text-red-300 text-sm font-medium">
                        <strong>Educational / Authorized use only.</strong> Always ensure you have explicit permission
                        before testing any target. Unauthorized testing is illegal and unethical.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
