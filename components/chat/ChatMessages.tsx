"use client"

import * as React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { StatsTooltip } from "@/components/chat/StatsTooltip"
import { CopyIcon } from "@/components/icons/CopyIcon"

import MarkdownMessage from "./MarkdownMessage"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  stats?: {
    responseTime: number
    timeToFirstToken: number
    tokensPerSecond: number
  }
}

interface ChatMessagesProps {
  messages: Message[]
  loading?: boolean
}

export function ChatMessages({ messages, loading = false }: ChatMessagesProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  // Scroll to bottom when messages or loading change
  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading])

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 overflow-y-auto flex-1 scrollbar-hide relative"
    >
      {messages.map((msg, i) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {msg.role === "user" ? (
            <div className="rounded-lg px-4 py-2 max-w-[70%] text-sm bg-primary text-primary-foreground whitespace-pre-line shadow-sm">
              {msg.content}
            </div>
          ) : (
            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <AssistantMessageWithCopy
                  content={msg.content}
                  stats={msg.stats}
                />
                {/* Show loading spinner if this is the last assistant message and loading is true */}
                {loading && i === messages.length - 1 && (
                  <Loader2 className="ml-2 animate-spin text-muted-foreground w-5 h-5" />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

function AssistantMessageWithCopy({
  content,
  stats,
}: {
  content: string
  stats?: {
    responseTime: number
    timeToFirstToken: number
    tokensPerSecond: number
  }
}) {
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
          className="rounded-lg px-4 py-2 text-sm border border-border text-foreground prose prose-neutral dark:prose-invert w-full sm:max-w-[70%] sm:w-fit min-w-0 leading-loose overflow-x-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <MarkdownMessage content={content} />
          {stats && <StatsTooltip stats={stats} />}
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
