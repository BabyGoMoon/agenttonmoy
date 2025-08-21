"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface SafetyGuardsProps {
  onConfirm: () => void
  isLoading?: boolean
  toolName: string
}

export default function SafetyGuards({ onConfirm, isLoading, toolName }: SafetyGuardsProps) {
  const [permissions, setPermissions] = useState({
    authorized: false,
    educational: false,
    legal: false,
    ethical: false,
  })

  const allChecked = Object.values(permissions).every(Boolean)

  const handlePermissionChange = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleConfirm = () => {
    if (allChecked) {
      onConfirm()
    }
  }

  return (
    <Card className="bg-red-900/10 border-red-600/30 p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-bold text-red-400 font-heading">Safety & Legal Requirements</h3>
        </div>

        <p className="text-red-300 text-sm font-body">
          Before using {toolName}, you must confirm the following requirements:
        </p>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="authorized"
              checked={permissions.authorized}
              onCheckedChange={() => handlePermissionChange("authorized")}
              className="border-red-400 data-[state=checked]:bg-red-600"
            />
            <label htmlFor="authorized" className="text-sm text-red-300 font-body cursor-pointer">
              I have explicit written authorization to test the target
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="educational"
              checked={permissions.educational}
              onCheckedChange={() => handlePermissionChange("educational")}
              className="border-red-400 data-[state=checked]:bg-red-600"
            />
            <label htmlFor="educational" className="text-sm text-red-300 font-body cursor-pointer">
              This is for educational or authorized security research only
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="legal"
              checked={permissions.legal}
              onCheckedChange={() => handlePermissionChange("legal")}
              className="border-red-400 data-[state=checked]:bg-red-600"
            />
            <label htmlFor="legal" className="text-sm text-red-300 font-body cursor-pointer">
              I understand that unauthorized testing is illegal
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="ethical"
              checked={permissions.ethical}
              onCheckedChange={() => handlePermissionChange("ethical")}
              className="border-red-400 data-[state=checked]:bg-red-600"
            />
            <label htmlFor="ethical" className="text-sm text-red-300 font-body cursor-pointer">
              I will use this tool ethically and responsibly
            </label>
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!allChecked || isLoading}
          className={`w-full font-body ${
            allChecked ? "bg-green-600 hover:bg-green-700 text-black" : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Processing..." : "I Confirm - Proceed with Tool"}
        </Button>
      </div>
    </Card>
  )
}
