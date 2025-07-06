export type Conversation = {
  id: string
  title: string
  messages: Message[]
  model: string
  updatedAt: number
}
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  stats?: {
    responseTime: number
    timeToFirstToken: number
    tokensPerSecond: number
  }
}
export interface AssistantMessageWithCopyProps {
  content: string
  stats?: {
    responseTime: number
    timeToFirstToken: number
    tokensPerSecond: number
  }
  loading?: boolean
}
