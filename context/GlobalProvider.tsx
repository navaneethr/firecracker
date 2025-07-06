"use client"

import * as React from "react"
import { useEffect } from "react"

import type { Conversation } from "@/types/conversation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { fetchGet } from "@/lib/utils/fetch-utils"

export type Model = {
  name: string
  title: string
  description: string
}

interface GlobalContextType {
  models: Model[]
  setModels: (models: Model[] | ((prev: Model[]) => Model[])) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  conversations: Conversation[]
  setConversations: (
    conversations: Conversation[] | ((prev: Conversation[]) => Conversation[])
  ) => void
  selectedConversationId: string
  setSelectedConversationId: (id: string) => void
}

const GlobalContext = React.createContext<GlobalContextType | undefined>(
  undefined
)

export function useGlobalContext() {
  const ctx = React.useContext(GlobalContext)
  if (!ctx)
    throw new Error("useGlobalContext must be used within a GlobalProvider")
  return ctx
}

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [models, setModels] = React.useState<Model[]>([])
  const [selectedModel, setSelectedModel] = React.useState<string>("")
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] =
    React.useState<string>("")
  const {
    getModelFromLS,
    saveModelToLS,
    getConversationsFromLS,
    saveConversationsToLS,
    getLastConversationId,
    setLastConversationId,
  } = useLocalStorage()

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const stored = getModelFromLS()
    if (stored) setSelectedModel(stored)
    const conversations = getConversationsFromLS()
    const lastId = getLastConversationId()
    let found: Conversation | undefined = undefined
    if (lastId) {
      found = conversations.find((c) => c.id === lastId)
    }
    if (!found && conversations.length > 0) {
      found = conversations[conversations.length - 1]
    }
    if (found) {
      setSelectedConversationId(found.id)
      setConversations(conversations)
    }
  }, [])

  // This will also set the first model as selected if none is set
  useEffect(() => {
    fetchGet("/api/models")
      .then((data) => {
        const apiModels = Array.isArray(data) ? data : data.models || []
        setModels(apiModels)
        setSelectedModel(
          (prev) => prev || (apiModels.length > 0 ? apiModels[0].name : "")
        )
      })
      .catch(() => setModels([]))
  }, [setModels, setSelectedModel])

  // function to save selected model to state and localStorage
  const saveModel = (model: string) => {
    setSelectedModel(model)
    if (model) {
      saveModelToLS(model)
    }
  }

  // function to save conversations array to state and localStorage
  const saveConversations: GlobalContextType["setConversations"] = (
    conversationsOrUpdater
  ) => {
    setConversations((prev) => {
      const conversations =
        typeof conversationsOrUpdater === "function"
          ? (
              conversationsOrUpdater as (prev: Conversation[]) => Conversation[]
            )(prev)
          : conversationsOrUpdater
      saveConversationsToLS(conversations)
      return conversations
    })
  }

  // function to only update selectedConversationId and save to localStorage
  const saveSelectedConversationId = (id: string) => {
    setSelectedConversationId(id)
    if (id) {
      setLastConversationId(id)
    }
  }

  return (
    <GlobalContext.Provider
      value={{
        models,
        setModels,
        selectedModel,
        setSelectedModel: saveModel,
        conversations,
        setConversations: saveConversations,
        selectedConversationId,
        setSelectedConversationId: saveSelectedConversationId,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}
