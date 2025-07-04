"use client"
import * as React from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"

interface Model {
  name: string
  title: string
  description: string
}

interface ModelSelectProps {
  models: Model[]
  value: string
  onChange: (value: string) => void
}

export function ModelSelect({ models, value, onChange }: ModelSelectProps) {
  return (
    <div className="w-full flex flex-col gap-1 text-left">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full text-left">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent className="text-left">
          {models.map((model) => (
            <SelectItem key={model.name} value={model.name} className="text-left">
              {model.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
