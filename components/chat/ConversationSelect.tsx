"use client"

import * as React from "react"

import { Conversation } from "@/types/conversation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface ConversationSelectProps {
  value: string
  onChange: (id: string) => void
  conversations: Conversation[]
  onDelete?: (id: string) => void
}

export function ConversationSelect({
  value,
  onChange,
  conversations,
  onDelete,
}: ConversationSelectProps) {
  const hasConversations = conversations.length > 0
  return (
    <Select value={value} onValueChange={onChange} disabled={!hasConversations}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Conversation" />
      </SelectTrigger>
      <SelectContent>
        {conversations.map((conv) => (
          <SelectItem key={conv.id} value={conv.id}>
            <span className="truncate flex-1 min-w-0">{conv.title}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
