"use client"
import * as React from "react"
// import { ModelSelect } from "./ModelSelect"
import { ChatMessages } from "./ChatMessages"
import { ChatInput } from "./ChatInput"



export function ChatContainer({ selectedModel, messages, modelSelectSection, children }: {
  selectedModel: string,
  messages: any[],
  modelSelectSection?: React.ReactNode,
  children?: React.ReactNode
}) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-0 mb-0 relative flex-1 overflow-hidden">
      <div className="mt-2 flex-1 min-h-0 flex flex-col">
        <ChatMessages messages={messages} />
      </div>
      {modelSelectSection && (
        <div className="w-full">{modelSelectSection}</div>
      )}
    </div>
  )
}