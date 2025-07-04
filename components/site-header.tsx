"use client"
import Link from "next/link"
import * as React from "react"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"
import { ModelSelect } from "@/components/chat/ModelSelect"
// Mock models from Fireworks API (keep in sync with ChatContainer)
const models = [
  {
    name: "accounts/fireworks/models/qwen3-30b-a3b",
    title: "Qwen3 30B-A3B",
    description: "Latest Qwen3 state of the art model, 30B with 3B active parameter mode."
  },
  {
    name: "accounts/fireworks/models/llama4-maverick-instruct-basic",
    title: "Llama 4 Maverick Instruct (Basic)",
    description: "Llama 4 collection of models are natively multimodal AI models."
  },
  {
    name: "accounts/fireworks/models/deepseek-r1-0528",
    title: "Deepseek R1 05/28",
    description: "05/28 updated checkpoint of Deepseek R1. Improved reasoning and coding."
  }
]

export function SiteHeader() {
  const [selectedModel, setSelectedModel] = React.useState(models[0].name)
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-24 items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.firecracker className="h-8 w-8 text-amber-500" />
          <span className="font-bold text-amber-500 text-base flex items-center">FireCracker</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="min-w-[200px]">
            <ModelSelect models={models} value={selectedModel} onChange={setSelectedModel} />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
