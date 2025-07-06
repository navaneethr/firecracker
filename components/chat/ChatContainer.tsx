"use client"

import * as React from "react"

import { ChatInput } from "./ChatInput"
// import { ModelSelect } from "./ModelSelect"
import { ChatMessages } from "./ChatMessages"

export function ChatContainer({
  messages,
  loading,
}: {
  messages: any[]
  loading?: boolean
}) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-0 mb-0 relative flex-1 overflow-hidden">
      <div className="mt-2 flex-1 min-h-0 flex flex-col">
        <ChatMessages messages={messages} loading={loading} />
      </div>
    </div>
  )
}
