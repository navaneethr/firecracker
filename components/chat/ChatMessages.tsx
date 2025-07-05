"use client"
import * as React from "react"
import MarkdownMessage from "./MarkdownMessage"
import { CopyIcon } from "@/components/icons/CopyIcon"
import { useState } from "react"
import { toast } from "sonner"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatMessagesProps {
  messages: Message[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  return (
    <div ref={containerRef} className="flex flex-col gap-4 overflow-y-auto flex-1 scrollbar-hide relative">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.role === "user" ? (
            <div className="rounded-lg px-4 py-2 max-w-[70%] text-sm bg-primary text-primary-foreground whitespace-pre-line shadow-sm">
              {msg.content}
            </div>
          ) : (
            <AssistantMessageWithCopy content={msg.content} />
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function AssistantMessageWithCopy({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Failed to copy");
    }
  };
  return (
    <div className="relative group w-full flex">
      <div
        className="rounded-lg px-4 py-2 text-sm border border-border text-foreground prose prose-neutral dark:prose-invert w-full sm:max-w-[70%] sm:w-fit min-w-0 leading-loose overflow-x-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <MarkdownMessage content={content} />
      </div>
      <button
        className="ml-2 self-center opacity-60 hover:opacity-100 transition-opacity z-10 bg-background p-1 rounded"
        onClick={handleCopy}
        aria-label="Copy response"
        tabIndex={0}
        type="button"
      >
        <CopyIcon copied={copied} />
      </button>
    </div>
  );
}