"use client"

import * as React from "react"
import { useState } from "react"
import { ChevronDown, Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { AssistantMessageWithCopyProps } from "@/types/conversation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import MarkdownMessage from "./MarkdownMessage"

export function AssistantMessageWithCopy({
  content,
  thinkMessage,
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
          className="rounded-xl px-4 py-2 text-sm border border-border text-foreground prose prose-neutral dark:prose-invert w-full sm:max-w-[80%] sm:w-fit min-w-[50%] min-h-[40px] leading-loose overflow-x-auto"
          style={{ WebkitOverflowScrolling: "touch", borderRadius: "0.75rem" }}
        >
          {thinkMessage && thinkMessage.trim() && (
            <div className="mb-3">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="think-content" className="border-none">
                  <AccordionTrigger className="text-xs text-muted-foreground hover:text-foreground hover:no-underline py-1 [&>svg]:hidden">
                    <span className="flex items-center gap-1">
                      <span>Show AI reasoning</span>
                      <ChevronDown className="h-3 w-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent
                    className="text-xs text-muted-foreground bg-muted/30 border border-border rounded-xl p-0 mt-1"
                    style={{ borderRadius: "0.75rem" }}
                  >
                    <div className="max-h-48 overflow-y-auto scrollbar-hide p-4">
                      <div className="whitespace-pre-line">{thinkMessage}</div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
          <MarkdownMessage content={content} />
          {stats && !loading && (
            <div className="mt-1 text-[10px] italic text-muted-foreground flex flex-row gap-2">
              <span title="Response Time (ms)">
                RT - {stats.responseTime.toFixed(0)}ms
              </span>
              <span title="Time to First Token (ms)">
                • 1st - {stats.timeToFirstToken.toFixed(0)}ms
              </span>
              <span title="Tokens/Second">
                • {stats.tokensPerSecond.toFixed(0)} Tks/s
              </span>
            </div>
          )}
          {loading && (
            <div className="flex w-full justify-end mt-1">
              <Loader2 className="animate-spin text-amber-400 w-4 h-4" />
            </div>
          )}
        </div>
        <button
          className={
            "ml-2 transition-opacity z-10 bg-background p-1 rounded-xl" +
            (loading ? " opacity-50 cursor-not-allowed" : " hover:opacity-100")
          }
          onClick={handleCopy}
          aria-label="Copy response"
          tabIndex={0}
          type="button"
          disabled={loading}
          style={{ borderRadius: "0.75rem" }}
        >
          <Copy
            className={
              (copied
                ? "text-amber-500"
                : loading
                ? "text-muted-foreground"
                : "text-amber-400") + " w-5 h-5"
            }
          />
        </button>
      </div>
    </div>
  )
}
