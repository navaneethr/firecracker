"use client"

import * as React from "react"
import { useGlobalContext } from "@/context/GlobalProvider"
import { FilePlus2Icon, Trash2Icon } from "lucide-react"

import { Conversation } from "@/types/conversation"
import { Icons } from "@/components/icons"
import { ConversationSelect } from "@/components/navbar/ConversationSelect"
import { ModelSelect } from "@/components/navbar/ModelSelect"
import { ThemeToggle } from "@/components/navbar/ThemeToggle"

export function Navbar() {
  const {
    models,
    selectedModel,
    setSelectedModel,
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    setConversations,
  } = useGlobalContext()

  // Handler to update selected conversation
  const handleConversationChange = (id: string) => {
    setSelectedConversationId(id)
  }

  // Handler to update selected model and persist to localStorage
  const handleModelChange = (value: string) => {
    setSelectedModel(value)

    // Save conversation with the new model
    if (selectedConversationId) {
      const found = conversations.find((c) => c.id === selectedConversationId)
      if (found) {
        const updated: Conversation = {
          ...found,
          model: value, // Use the new model value directly
          updatedAt: Date.now(),
        }

        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConversationId ? updated : c))
        )
      }
    }
  }

  // Handler to add a new conversation
  const handleNewConversation = () => {
    const newId = crypto.randomUUID()
    const newConv = {
      id: newId,
      title: "New Chat",
      messages: [],
      model: selectedModel,
      updatedAt: Date.now(),
    }
    setConversations((prev) => [...prev, newConv])
    setSelectedConversationId(newId)
  }

  // Handler to delete the selected conversation
  const handleDeleteConversation = () => {
    if (!selectedConversationId) return
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== selectedConversationId)
      // If there are any left, select the last one, else clear selection
      if (filtered.length > 0) {
        setSelectedConversationId(filtered[filtered.length - 1].id)
      } else {
        setSelectedConversationId("")
      }
      return filtered
    })
  }
  console.log("selectedModel:", selectedModel)
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b overflow-x-auto scrollbar-thin scrollbar-thumb-muted/60 scrollbar-track-transparent">
      <div className="container flex h-14 items-center justify-between min-w-[360px]">
        <div className="flex items-center gap-2">
          <Icons.firecracker className="h-8 w-8 text-amber-500" />
          <span className="font-bold text-amber-500 text-base items-center hidden sm:flex">
            FireCracker
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <FilePlus2Icon
              className="w-5 h-5 min-w-[40px] cursor-pointer text-muted-foreground hover:text-primary transition-colors"
              title="New Conversation"
              onClick={handleNewConversation}
            />
            <div className="min-w-[100px] w-[100px] sm:min-w-[200px] sm:w-auto">
              <ConversationSelect
                value={selectedConversationId}
                onChange={handleConversationChange}
                conversations={conversations}
              />
            </div>
            <Trash2Icon
              className="w-5 h-5 ml-2 mr-2 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
              title="Delete Conversation"
              onClick={handleDeleteConversation}
              aria-disabled={!selectedConversationId}
              style={{
                opacity: selectedConversationId ? 1 : 0.4,
                pointerEvents: selectedConversationId ? "auto" : "none",
              }}
            />
            <div className="min-w-[100px] w-[100px] sm:min-w-[200px] sm:w-auto mr-2">
              <ModelSelect
                models={models}
                value={selectedModel}
                onChange={handleModelChange}
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
