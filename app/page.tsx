"use client"

import * as React from "react"
import { toast } from "sonner"

import { postChatMessages } from "@/lib/fetch-utils"
import { Message as BaseMessage, Conversation } from "@/lib/types"
import { createThinkStripper, parseFireworksSSEChunk } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { ChatInput } from "@/components/chat/ChatInput"
import { useGlobalContext } from "@/components/global-context"

const stripThinkTags = createThinkStripper()

type Message = BaseMessage & {
  stats?: {
    responseTime: number
    timeToFirstToken: number
    tokensPerSecond: number
  }
}

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

    let newMessages: Message[] = []
    if (!convId) {
      convId = crypto.randomUUID()
      setSelectedConversationId(convId)
      // Add new conversation immediately so ConversationSelect updates
      const title = input.slice(0, 40) || "New Chat"
      const newConv: Conversation = {
        id: convId,
        title,
        messages: [{ id: "1", role: "user", content: input }],
        model: selectedModel,
        updatedAt: Date.now(),
      }
      setConversations([...conversations, newConv])
      setMessages(newConv.messages)
      newMessages = newConv.messages as Message[]
    } else {
      newMessages = [
        ...messages,
        { id: String(messages.length + 1), role: "user", content: input },
      ]
      setMessages(newMessages)
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // --- Timing variables ---
    const startTime = performance.now()
    let firstTokenTime = 0
    let firstTokenReceived = false
    let totalTokens = 0
    let endTime = 0
    // ---

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
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          buffer += new TextDecoder().decode(value)
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""
          const parsed = parseFireworksSSEChunk(lines.join("\n"))
          if (parsed) {
            receivedAny = true
            if (!firstTokenReceived) {
              firstTokenTime = performance.now()
              firstTokenReceived = true
            }
            const clean = stripThinkTags(parsed)
            assistantMessage += clean
            totalTokens += clean.length // crude token count, can be improved
            setMessages((msgs) => [
              ...msgs.filter((m) => m.id !== String(assistantId)),
              {
                id: String(assistantId),
                role: "assistant",
                content: assistantMessage,
                // stats will be added after streaming is done
                ...(msgs.find((m) => m.id === String(assistantId))?.stats
                  ? {
                      stats: msgs.find((m) => m.id === String(assistantId))!
                        .stats,
                    }
                  : {}),
              },
            ])
          }
        }
      }
      if (buffer) {
        const parsed = parseFireworksSSEChunk(buffer)
        if (parsed) {
          receivedAny = true
          if (!firstTokenReceived) {
            firstTokenTime = performance.now()
            firstTokenReceived = true
          }
          const clean = stripThinkTags(parsed)
          assistantMessage += parsed
          totalTokens += clean.length
          setMessages((msgs) => [
            ...msgs.filter((m) => m.id !== String(assistantId)),
            {
              id: String(assistantId),
              role: "assistant",
              content: assistantMessage,
              ...(msgs.find((m) => m.id === String(assistantId))?.stats
                ? {
                    stats: msgs.find((m) => m.id === String(assistantId))!
                      .stats,
                  }
                : {}),
            },
          ])
        }
      }
      endTime = performance.now()
      if (receivedAny) {
        const responseTime = endTime - startTime
        const timeToFirstToken = firstTokenReceived
          ? firstTokenTime - startTime
          : 0
        const tokensPerSecond =
          responseTime > 0 ? totalTokens / (responseTime / 1000) : 0
        setMessages((msgs) =>
          msgs.map((m) =>
            m.id === String(assistantId)
              ? {
                  ...m,
                  stats: {
                    responseTime,
                    timeToFirstToken,
                    tokensPerSecond,
                  },
                }
              : m
          )
        )
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
        <ChatContainer messages={messages} loading={loading} />
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
            if (!selectedModel || !model) {
              return (
                <div className="w-full text-left">
                  <Skeleton className="h-4 my-1" />
                </div>
              )
            }
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
