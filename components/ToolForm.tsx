"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormField {
  name: string
  label: string
  type: "text" | "textarea" | "select" | "number"
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  description?: string
}

interface ToolFormProps {
  title: string
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  isLoading?: boolean
  children?: ReactNode
}

export default function ToolForm({ title, fields, onSubmit, isLoading, children }: ToolFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: Record<string, any> = {}

    fields.forEach((field) => {
      const value = formData.get(field.name)
      data[field.name] = field.type === "number" ? Number(value) : value
    })

    onSubmit(data)
  }

  return (
    <Card className="tool-dashboard p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-bold text-green-400 font-heading mb-4">{title}</h3>

        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-green-300 font-body">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </Label>

            {field.type === "text" || field.type === "number" ? (
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
                className="bg-gray-800/50 border-green-600/30 text-green-100 placeholder-gray-400 focus:border-green-500 font-body"
              />
            ) : field.type === "textarea" ? (
              <Textarea
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
                className="bg-gray-800/50 border-green-600/30 text-green-100 placeholder-gray-400 focus:border-green-500 font-body"
              />
            ) : field.type === "select" ? (
              <Select name={field.name} required={field.required}>
                <SelectTrigger className="bg-gray-800/50 border-green-600/30 text-green-100 focus:border-green-500 font-body">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-600/30">
                  {field.options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-green-100 focus:bg-green-600/20"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            {field.description && <p className="text-xs text-gray-400 font-body">{field.description}</p>}
          </div>
        ))}

        {children}

        {/* Uiverse fat-eagle-24 button */}
        <button
          type="submit"
          disabled={isLoading}
          aria-disabled={isLoading}
          className="fat-btn w-full"
        >
          {isLoading ? "Processing..." : "Run Scan"}
        </button>
      </form>
    </Card>
  )
}
