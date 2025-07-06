"use client"

import * as React from "react"

import { ModelSelectProps } from "@/types/nav"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export function ModelSelect({
  models,
  value,
  onChange,
  loading,
}: ModelSelectProps) {
  return (
    <div className="w-full flex flex-col gap-1 text-left">
      {loading || models.length === 0 ? (
        <Skeleton className="w-full h-10 rounded-md" />
      ) : (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full text-left">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent className="text-left">
            {models.map((model) => (
              <SelectItem
                key={model.name}
                value={model.name}
                className="text-left"
              >
                {model.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
