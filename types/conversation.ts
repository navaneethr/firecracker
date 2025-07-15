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
  thinkMessage?: string // Full text including think tags for assistant messages
  stats?: {
    responseTime: number
    timeToFirstToken: number
    tokensPerSecond: number
  }
}
export interface AssistantMessageWithCopyProps {
  content: string
  thinkMessage?: string
  stats?: {
    responseTime: number
    timeToFirstToken: number
    tokensPerSecond: number
  }
  loading?: boolean
}

export interface ChatMessagesProps {
  messages: Message[]
  loading?: boolean
}
export interface ChatInputProps {
  onSend: (input: string) => void
  loading?: boolean
  onStop?: () => void
}

export interface ConversationSelectProps {
  value: string
  onChange: (id: string) => void
  conversations: Conversation[]
}
