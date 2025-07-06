"use client"

import * as React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Message } from "@/types/conversation"
import { AssistantMessageWithCopy } from "@/components/chat/AssistantMessageWithCopy"

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
                  loading={loading && i === messages.length - 1}
                />
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
