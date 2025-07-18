"use client"

import * as React from "react"

import { ChatMessagesProps, Message } from "@/types/conversation"
import { AssistantMessageWithCopy } from "@/components/chat/AssistantMessageWithCopy"

export function ChatMessages({ messages, loading = false }: ChatMessagesProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null)
  // Scroll to bottom when messages or loading change
  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading])

  return (
    <div className="flex flex-col gap-4 overflow-y-auto flex-1 scrollbar-hide relative">
      {messages.map((msg, i) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {msg.role === "user" ? (
            <div
              className="rounded-xl px-4 py-2 max-w-[70%] text-sm bg-primary text-primary-foreground whitespace-pre-line shadow-sm"
              style={{ borderRadius: "0.75rem" }}
            >
              {msg.content}
            </div>
          ) : (
            <div className="flex flex-col items-start max-w-[80%]">
              <AssistantMessageWithCopy
                content={msg.content}
                thinkMessage={msg.thinkMessage}
                stats={msg.stats}
                loading={loading && i === messages.length - 1}
              />
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
