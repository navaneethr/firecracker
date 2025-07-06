"use client"

import * as React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { AssistantMessageWithCopyProps } from "@/types/conversation"
import { CopyIcon } from "@/components/icons/CopyIcon"

import MarkdownMessage from "./MarkdownMessage"

export function AssistantMessageWithCopy({
  content,
  stats,
  loading = false,
}: AssistantMessageWithCopyProps) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 1200)
    } catch {
      toast.error("Failed to copy")
    }
  }
  return (
    <div className="relative group w-full flex flex-col">
      <div className="flex flex-row items-center w-full">
        <div
          className="rounded-lg px-4 py-2 text-sm border border-border text-foreground prose prose-neutral dark:prose-invert w-full sm:w-fit min-w-[50%] min-w-0 min-h-[40px] leading-loose overflow-x-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <MarkdownMessage content={content} />
          {stats && !loading && (
            <div className="mt-1 text-[10px] italic text-muted-foreground flex flex-row gap-2">
              <span>Response Time - {stats.responseTime.toFixed(0)}ms</span>
              <span>• 1st - {stats.timeToFirstToken.toFixed(0)}ms</span>
              <span>• {stats.tokensPerSecond.toFixed(0)} tokens/s</span>
            </div>
          )}
          {loading && (
            <div className="flex w-full justify-end mt-1">
              <Loader2 className="animate-spin text-amber-400 w-4 h-4" />
            </div>
          )}
        </div>
        <button
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity z-10 bg-background p-1 rounded"
          onClick={handleCopy}
          aria-label="Copy response"
          tabIndex={0}
          type="button"
        >
          <CopyIcon copied={copied} />
        </button>
      </div>
    </div>
  )
}
