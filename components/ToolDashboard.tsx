"use client"

import type { ReactNode } from "react"

interface ToolDashboardProps {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
  stats?: {
    label: string
    value: string | number
    color?: "green" | "blue" | "yellow" | "red"
  }[]
}

export default function ToolDashboard({ title, description, icon, children, stats }: ToolDashboardProps) {
  return (
    <div className="p-8 space-y-6">
      {/* Tool Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center border border-green-600/30 glow-green">
          {icon}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-green-400 font-logo">{title}</h1>
          <p className="text-green-300 font-body mt-1">{description}</p>
        </div>
      </div>

      {/* Stats Strip */}
      {stats && stats.length > 0 && (
        <div className="stats-strip rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className={`text-2xl font-bold font-heading ${
                    stat.color === "green"
                      ? "text-green-400"
                      : stat.color === "blue"
                        ? "text-blue-400"
                        : stat.color === "yellow"
                          ? "text-yellow-400"
                          : stat.color === "red"
                            ? "text-red-400"
                            : "text-green-400"
                  }`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 font-body">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="tool-dashboard rounded-lg p-6">{children}</div>
    </div>
  )
}
