"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// ❌ remove GlowCard import
// import { GlowCard } from "@/components/ui/spotlight-card"
import { SearchBar } from "@/components/ui/search-bar"
import MatrixBackground from "@/components/MatrixBackground"

export default function AgentTonmoy() {
  const tools = [
    { name: "Subdomain Finder", description: "Discover subdomains passively", href: "/tools/subdomain", icon: "🔍" },
    { name: "XSS Scanner", description: "Safe XSS reflection testing", href: "/tools/xss-scanner", icon: "⚡" },
    { name: "Open Redirect", description: "Test redirect vulnerabilities", href: "/tools/open-redirect", icon: "🔄" },
    { name: "LFI Checker", description: "Local file inclusion testing", href: "/tools/lfi-checker", icon: "📁" },
    { name: "Custom SQLi", description: "SQL injection payload lab", href: "/tools/custom-sqli", icon: "💉" },
    { name: "WHOIS Lookup", description: "Domain registration info", href: "/tools/whois", icon: "🌐" },
    { name: "DNS Scanner", description: "Extended DNS record lookup", href: "/tools/dns-scanner", icon: "🔎" },
    { name: "HTTP Headers", description: "Inspect HTTP headers", href: "/tools/http-headers", icon: "📋" },
    { name: "Recon Hub", description: "Research tools & helpers", href: "/tools/recon-hub", icon: "🎯" },
  ]

  const scrollToTools = () => {
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSearch = (query: string) => {
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

      <div className="relative z-10 p-2 sm:p-4 lg:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500 p-0.5 sm:p-1 shadow-2xl">
            <div className="flex justify-between items-center px-4 sm:px-8 py-2 sm:py-4">
              <div className="w-16 sm:w-32"></div>
              <div className="flex items-center gap-2">
                <div className="w-12 sm:w-16 h-4 sm:h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-600 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Badge className="bg-green-600 hover:bg-green-700 text-black font-bold text-xs sm:text-sm px-2 sm:px-3">
                  AGENT
                </Badge>
                <div className="w-5 sm:w-6 h-5 sm:h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <div className="text-black font-bold text-xs sm:text-sm">T</div>
                </div>
              </div>
            </div>

            <div className="flex min-h-[600px] sm:min-h-[700px] bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl sm:rounded-2xl mx-1 sm:mx-2 mb-1 sm:mb-2">
              <div className="hidden sm:flex w-12 lg:w-20 flex-col items-center py-4 lg:py-6 space-y-2 lg:space-y-4">
                <div className="w-8 lg:w-12 h-8 lg:h-12 bg-green-600 rounded-full flex items-center justify-center mb-2 lg:mb-4">
                  <span className="text-black font-bold text-sm lg:text-lg">🐛</span>
                </div>

                <Button variant="ghost" size="icon" className="w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-gray-700/50 hover:bg-green-600/20 border border-green-600/30">
                  <span className="text-green-400">🏠</span>
                </Button>
                <Button variant="ghost" size="icon" className="w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-gray-700/50 hover:bg-green-600/20 border border-green-600/30">
                  <span className="text-green-400">🌐</span>
                </Button>
                <Button variant="ghost" size="icon" className="w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-gray-700/50 hover:bg-green-600/20 border border-green-600/30">
                  <span className="text-green-400">🛡️</span>
                </Button>
                <Button variant="ghost" size="icon" className="w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-gray-700/50 hover:bg-green-600/20 border border-green-600/30">
                  <span className="text-green-400">💾</span>
                </Button>

                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mt-4 border border-green-600/50">
                  <span className="text-green-400 text-lg">💻</span>
                </div>

                <div className="flex-1"></div>

                <Button variant="ghost" size="icon" className="w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-gray-700/50 hover:bg-green-600/20 border border-green-600/30">
                  <span className="text-green-400 text-sm lg:text-base">🔍</span>
                </Button>
              </div>

              <div className="flex-1 p-4 sm:p-6 lg:p-8 relative overflow-y-auto">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center mb-8 lg:mb-16">
                  <div className="space-y-4 lg:space-y-6 text-center lg:text-left">
                    <div className="space-y-2 lg:space-y-4">
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-green-400 tracking-tight">
                        AGENT TONMOY
                      </h1>
                      <p className="text-base sm:text-lg lg:text-xl text-green-300 font-medium px-2 lg:px-0">
                        Free powerful bug hunting tools, ethical & authorized only.
                      </p>
                    </div>

                    <div className="mb-4 lg:mb-6">
                      <SearchBar onSearch={handleSearch} />
                    </div>

                    <Button
                      onClick={scrollToTools}
                      className="bg-green-600 hover:bg-green-700 text-black font-bold px-6 lg:px-8 py-2 lg:py-3 rounded-full text-base lg:text-lg"
                    >
                      Start Hunting →
                    </Button>
                  </div>

                  <div className="h-60 sm:h-80 lg:h-96 rounded-xl p-4 bg-gray-800/30 flex items-center justify-center relative overflow-hidden border border-green-600/30 order-first lg:order-last">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent"></div>
                    <div className="text-center relative z-10">
                      <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 lg:mb-4 animate-pulse">🤖</div>
                      <p className="text-green-400 font-bold text-base lg:text-lg">MATRIX AGENT</p>
                      <p className="text-green-500/70 text-xs sm:text-sm mt-1 lg:mt-2">Ethical Hacking Protocol</p>
                    </div>
                    <div className="absolute inset-0 opacity-30">
                      <div className="h-full w-full bg-gradient-to-b from-transparent via-green-600/5 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Tools Section */}
                <div id="tools" className="space-y-6 lg:space-y-8">
                  <div className="text-center space-y-2 lg:space-y-4">
                    <h2 className="text-2xl lg:text-3xl font-bold text-green-400">Security Arsenal</h2>
                    <p className="text-green-300 text-sm lg:text-base px-4 lg:px-0">
                      Professional bug hunting tools for ethical security research
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {tools.map((tool, index) => (
                      <Card
                        key={index}
                        className="tool-card cursor-pointer group p-4 lg:p-6"
                      >
                        <div className="space-y-3 lg:space-y-4 h-full flex flex-col">
                          <div className="flex items-center gap-3">
                            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                              <span className="text-green-400 text-base lg:text-lg">{tool.icon}</span>
                            </div>
                            <h3 className="text-base lg:text-lg font-bold text-green-400 group-hover:text-green-300">
                              {tool.name}
                            </h3>
                          </div>
                          <p className="text-xs lg:text-sm text-gray-400 flex-1">{tool.description}</p>
                          <Link href={tool.href} className="mt-auto">
                            <Button
                              className="w-full bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/30 text-xs lg:text-sm"
                              variant="outline"
                            >
                              Open Tool
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="mt-8 lg:mt-12">
                  <Card className="tool-card bg-red-900/20 p-3 lg:p-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="text-red-400 text-lg lg:text-xl flex-shrink-0">🛡️</span>
                      <p className="text-red-300 text-xs sm:text-sm font-medium">
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
