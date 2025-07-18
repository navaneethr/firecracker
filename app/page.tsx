"use client"

import * as React from "react"
import { useGlobalContext } from "@/context/GlobalProvider"
import { toast } from "sonner"

import { Conversation, Message } from "@/types/conversation"
import { postChatMessages } from "@/lib/utils/fetch-utils"
import {
  createThinkExtractor,
  createThinkStripper,
  parseFireworksSSEChunk,
} from "@/lib/utils/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatInput } from "@/components/chat/ChatInput"
import { ChatMessages } from "@/components/chat/ChatMessages"

const stripThinkTags = createThinkStripper()
const extractThinkContent = createThinkExtractor()

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

  const saveConversation = (
    conversationId: string,
    messagesData: Message[]
  ) => {
    const title =
      messagesData.find((m) => m.role === "user")?.content?.slice(0, 40) ||
      "New Chat"
    const updatedConversation: Conversation = {
      id: conversationId,
      title,
      messages: messagesData,
      model: selectedModel,
      updatedAt: Date.now(),
    }

    setConversations((prevConversations) => {
      const idx = prevConversations.findIndex((c) => c.id === conversationId)
      if (idx > -1) {
        const updated = [...prevConversations]
        updated[idx] = updatedConversation
        return updated
      } else {
        return [...prevConversations, updatedConversation]
      }
    })
  }

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
      // Save conversation after adding user message
      saveConversation(convId, newMessages)
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
      let thinkMessage = ""
      let buffer = ""
      let done = false
      let receivedAny = false
      const assistantId = String(newMessages.length + 1)
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          buffer += new TextDecoder().decode(value)
          // // Received data: "data: {chunk1}\ndata: {chunk2}\ndata: {incomplete"
          // lines = ["data: {chunk1}", "data: {chunk2}", "data: {incomplete"]
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""
          // buffer = "data: {incomplete"
          // lines = ["data: {chunk1}", "data: {chunk2}"]
          const parsed = parseFireworksSSEChunk(lines.join("\n"))
          if (parsed) {
            receivedAny = true
            if (!firstTokenReceived) {
              firstTokenTime = performance.now()
              firstTokenReceived = true
            }
            const clean = stripThinkTags(parsed)
            const thinkContent = extractThinkContent(parsed)
            assistantMessage += clean
            thinkMessage += thinkContent // Keep only the text inside think tags
            totalTokens += clean.length // crude token count, can be improved
            setMessages((msgs) => [
              ...msgs.filter((m) => m.id !== String(assistantId)),
              {
                id: String(assistantId),
                role: "assistant",
                content: assistantMessage,
                thinkMessage: thinkMessage,
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

      // Process final buffer and calculate performance metrics in one call
      if (buffer) {
        const parsed = parseFireworksSSEChunk(buffer)
        if (parsed) {
          receivedAny = true
          if (!firstTokenReceived) {
            firstTokenTime = performance.now()
            firstTokenReceived = true
          }
          const clean = stripThinkTags(parsed)
          const thinkContent = extractThinkContent(parsed)
          assistantMessage += clean
          thinkMessage += thinkContent // Keep only the text inside think tags
          totalTokens += clean.length
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

        setMessages((msgs) => {
          const finalMessages = msgs.map((m) =>
            m.id === String(assistantId)
              ? {
                  ...m,
                  content: assistantMessage, // Update with final content
                  thinkMessage: thinkMessage, // Update with final think content
                  stats: {
                    responseTime,
                    timeToFirstToken,
                    tokensPerSecond,
                  },
                }
              : m
          )

          // Save conversation with the complete message including stats
          saveConversation(convId!, finalMessages)

          return finalMessages
        })
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
        {selectedConversationId && (
          <ChatMessages messages={messages} loading={loading} />
        )}
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
