import { Conversation } from "../types"

export function useLocalStorage() {
  const LS_KEY = "firecracker_conversations"
  const LS_LAST_ID = "firecracker_last_conversation_id"
  const LS_SELECTED_MODEL = "selectedModel"

  function getConversationsFromLS(): Conversation[] {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]")
    } catch {
      return []
    }
  }
  function saveConversationsToLS(convs: Conversation[]) {
    if (typeof window === "undefined") return
    localStorage.setItem(LS_KEY, JSON.stringify(convs))
  }
  function getLastConversationId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(LS_LAST_ID)
  }
  function setLastConversationId(id: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(LS_LAST_ID, id)
  }
  function saveModelToLS(model: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(LS_SELECTED_MODEL, JSON.stringify(model))
  }
  function getModelFromLS(): string | null {
    if (typeof window === "undefined") return null
    const model = localStorage.getItem(LS_SELECTED_MODEL)
    return model || null
  }
  return {
    getConversationsFromLS,
    saveConversationsToLS,
    getLastConversationId,
    setLastConversationId,
    getModelFromLS,
    saveModelToLS,
  }
}
