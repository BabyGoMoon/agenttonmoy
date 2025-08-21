"use client"

import type React from "react"

import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500 p-1 shadow-2xl">
          {/* Top navigation bar */}
          <div className="flex justify-between items-center px-8 py-4">
            <Link href="/">
              <Button variant="ghost" className="text-green-400 hover:text-green-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-16 h-6 bg-black rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-green-600 rounded-full text-black font-bold text-sm font-logo">
                AGENT TONMOY
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl mx-2 mb-2 min-h-[700px]">
            {children}
          </div>
        </div>
      </div>

      {/* Safety disclaimer */}
      <div className="mt-6 max-w-7xl mx-auto">
        <Card className="bg-red-900/20 border-red-600/50 p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm font-medium font-body">
              <strong>Educational / Authorized use only.</strong> Always ensure you have explicit permission before
              testing any target. Unauthorized testing is illegal and unethical.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
