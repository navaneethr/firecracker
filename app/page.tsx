"use client"
import * as React from "react"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { ModelSelect } from "@/components/chat/ModelSelect"
import { ChatInput } from "@/components/chat/ChatInput"
import { ThemeToggle } from "@/components/theme-toggle"
import { Icons } from "@/components/icons"

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

export default function IndexPage() {
  const [selectedModel, setSelectedModel] = React.useState(models[0].name)
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [messages, setMessages] = React.useState([
    { id: "1", role: "user", content: "Hello!" },
    { id: "2", role: "assistant", content: "Hi! How can I help you today?" },
    { id: "3", role: "user", content: "Tell me about Fireworks API." },
    { id: "4", role: "assistant", content: "Fireworks API provides access to state-of-the-art LLMs." }
  ])

  const handleSend = () => {
    if (!input.trim()) return
    setLoading(true)
    setMessages((msgs) => [
      ...msgs,
      { id: String(msgs.length + 1), role: "user", content: input }
    ])
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { id: String(msgs.length + 1), role: "assistant", content: `You said: ${input}` }
      ])
      setInput("")
      setLoading(false)
    }, 800)
  }

  return (
    <div className="flex flex-col">
      <nav className="w-full h-16 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0">
        <div className="flex items-center gap-4 w-full">
          <div className="flex items-center gap-2">
            <Icons.firecracker className="h-8 w-8 text-amber-500" />
            <span className="font-bold text-amber-500 text-base flex items-center hidden sm:flex">FireCracker</span>
            <div className="flex sm:hidden w-40 my-4">
              <ModelSelect models={models} value={selectedModel} onChange={setSelectedModel} />
            </div>
          </div>
          <div className="w-64 my-4 hidden sm:block">
            <ModelSelect models={models} value={selectedModel} onChange={setSelectedModel} />
          </div>
        </div>
        <ThemeToggle />
      </nav>
      <main className="flex-1 flex flex-col relative items-center">
        <div className="flex-1 flex flex-col w-full max-w-3xl px-4 sm:px-8 md:px-12 lg:mx-auto gap-4 min-h-0 pt-4 pb-40">
          <ChatContainer
            selectedModel={selectedModel}
            messages={messages}
          />
        </div>
        <div className="w-full flex flex-col items-center fixed bottom-0 left-0 z-20 bg-background pb-4">
          <div className="w-full max-w-3xl px-4 sm:px-8 md:px-12 mb-2">
            <ChatInput value={input} onChange={setInput} onSend={handleSend} loading={loading} />
          </div>
          <div className="w-full max-w-3xl px-4 sm:px-8 md:px-12 flex flex-col items-start">
            {(() => {
              const model = models.find(m => m.name === selectedModel);
              if (!model) return null;
              return (
                <div className="w-full text-left">
                  <div className="text-xs text-muted-foreground whitespace-nowrap overflow-x-hidden text-ellipsis px-1" style={{maxWidth: '100%'}}>{model.description}</div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  )
}
