"use client"
import * as React from "react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Conversation } from "@/types/conversation";

export function ConversationSelect({ value, onChange, conversations }: { value: string, onChange: (id: string) => void, conversations: Conversation[] }) {
  const hasConversations = conversations.length > 0;
  return (
    <Select
      value={hasConversations ? value : undefined}
      onValueChange={onChange}
      disabled={!hasConversations}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={hasConversations ? "Select Conversation" : "No conversations"} />
      </SelectTrigger>
      <SelectContent>
        {hasConversations && conversations.map((conv) => (
          <SelectItem key={conv.id} value={conv.id}>{conv.title}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}