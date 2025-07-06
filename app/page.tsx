"use client"

import * as React from "react"
import { toast } from "sonner"

import { postChatMessages } from "@/lib/fetch-utils"
import { Conversation, Message } from "@/lib/types"
import { createThinkStripper, parseFireworksSSEChunk } from "@/lib/utils"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { ChatInput } from "@/components/chat/ChatInput"
import { useGlobalContext } from "@/components/global-context"

const stripThinkTags = createThinkStripper()

export default function Page() {
  const {
    models,
    selectedModel,
    selectedConversationId,
    setSelectedConversationId,
    conversations,
    setConversations,
  } = useGlobalContext()

  const [loading, setLoading] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([])
  const abortControllerRef = React.useRef<AbortController | null>(null)

  // Load last conversation on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return
    let found: Conversation | undefined = undefined
    if (selectedConversationId) {
      found = conversations.find((c) => c.id === selectedConversationId)
    }
    if (!found && conversations.length > 0) {
      found = conversations[conversations.length - 1]
    }
    if (found) {
      setMessages(found.messages)
    }
  }, [selectedConversationId])

  // Save conversation to localStorage on messages/model change
  React.useEffect(() => {
    if (!selectedConversationId) return
    const idx = conversations.findIndex((c) => c.id === selectedConversationId)
    const title =
      messages.find((m) => m.role === "user")?.content?.slice(0, 40) ||
      "New Chat"
    const updated: Conversation = {
      id: selectedConversationId,
      title,
      messages,
      model: selectedModel,
      updatedAt: Date.now(),
    }
    if (idx > -1) {
      conversations[idx] = updated
    } else {
      conversations.push(updated)
    }
    setConversations(conversations)
    setSelectedConversationId(selectedConversationId)
  }, [messages, selectedModel, selectedConversationId])

  React.useEffect(() => {
    // If conversations change, reset messages if no conversation is selected
    if (!selectedConversationId && conversations.length > 0) {
      const lastConv = conversations[conversations.length - 1]
      setSelectedConversationId(lastConv.id)
      setMessages(lastConv.messages)
    } else if (!selectedConversationId) {
      setMessages([]) // Clear messages if no conversation found
    }
  }, [conversations, selectedConversationId])

  const handleSend = async (input: string) => {
    if (!input.trim()) return
    setLoading(true)
    let convId = selectedConversationId
    if (!convId) {
      convId = crypto.randomUUID()
      setSelectedConversationId(convId)
    }
    const newMessages = [
      ...messages,
      { id: String(messages.length + 1), role: "user", content: input },
    ]
    setMessages(newMessages)

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const res = await postChatMessages({
        model: selectedModel,
        messages: newMessages.map(({ role, content }) => ({ role, content })),
        initial: false,
        signal: abortController.signal,
      })
      if (!res.data) {
        setLoading(false)
        toast.error("No response from server.")
        return
      }
      const reader = res.data.getReader()
      let assistantMessage = ""
      let buffer = ""
      let done = false
      let receivedAny = false
      const assistantId = String(newMessages.length + 1)
      /* 
        'data: {"choices":[{"delta":{"conte'
        'nt":"**Why I\'m open-source:**"}}]}\n'
        'data: {"choices":[{"delta":{"con'
        'tent":"\\n\\n"}}]}\n'
        'data: {"choices":[{"delta":{"cont'
        'ent":"I\'m a variant of the transformer "}}]}\n'
        'data: {"choices":[{"delta":{"conte'
        'nt":"architecture."}}]}\n'
        'data: [DONE]\n'
      */
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          buffer += new TextDecoder().decode(value)
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""
          console.log("Received chunk:", lines)
          const parsed = parseFireworksSSEChunk(lines.join("\n"))
          if (parsed) {
            receivedAny = true
            const clean = stripThinkTags(parsed)
            assistantMessage += clean
            setMessages((msgs) => [
              ...msgs.filter((m) => m.id !== String(assistantId)),
              {
                id: String(assistantId),
                role: "assistant",
                content: assistantMessage,
              },
            ])
          }
        }
      }
      if (buffer) {
        const parsed = parseFireworksSSEChunk(buffer)
        if (parsed) {
          receivedAny = true
          const clean = stripThinkTags(parsed)
          assistantMessage += parsed
          setMessages((msgs) => [
            ...msgs.filter((m) => m.id !== String(assistantId)),
            {
              id: String(assistantId),
              role: "assistant",
              content: assistantMessage,
            },
          ])
        }
      }
      if (!receivedAny) {
        toast.error(
          "The model returned an empty response, use a different model or try again."
        )
        throw new Error("Empty stream response from model")
      }
    } catch (err) {
      if ((err as any)?.name === "AbortError") {
        toast.info("Request stopped.")
      } else {
        // toast already handled in util or above
        console.error("Error sending message:", err)
      }
    } finally {
      abortControllerRef.current = null
      setLoading(false)
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  return (
    <main className="flex-1 flex flex-col relative items-center">
      <div className="flex-1 flex flex-col w-full max-w-5xl px-4 sm:px-8 md:px-12 lg:mx-auto gap-4 min-h-0 pt-4 pb-40">
        <ChatContainer messages={messages} />
      </div>
      <div className="w-full flex flex-col items-center fixed bottom-0 left-0 z-20 bg-background pb-4">
        <div className="w-full max-w-5xl mb-2 px-4 sm:px-8 md:px-12">
          <ChatInput
            onSend={handleSend}
            loading={loading}
            onStop={handleStop}
          />
        </div>
        <div className="w-full max-w-5xl flex flex-col items-start px-4 sm:px-8 md:px-12">
          {(() => {
            const model = models.find((m) => m.name === selectedModel)
            if (!model) return null
            return (
              <div className="w-full text-left">
                <div
                  className="text-xs text-muted-foreground px-1 whitespace-nowrap overflow-x-hidden text-ellipsis"
                  style={{ maxWidth: "100%" }}
                >
                  {model.description}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </main>
  )
}
