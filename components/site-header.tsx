"use client"
import Link from "next/link"
import * as React from "react"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"
import { ModelSelect } from "@/components/chat/ModelSelect"
import { fetchGet } from "@/lib/fetch-utils"
import { useGlobalContext } from "@/components/global-context"


export function SiteHeader() {
  const { models, selectedModel, setSelectedModel } = useGlobalContext();

  // Handler to update selected model and persist to localStorage
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    if (value) localStorage.setItem("selectedModel", value);
  };

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.firecracker className="h-8 w-8 text-amber-500" />
          <span className="font-bold text-amber-500 text-base items-center hidden sm:flex">FireCracker</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="min-w-[200px]">
            <ModelSelect models={models} value={selectedModel} onChange={handleModelChange} />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
