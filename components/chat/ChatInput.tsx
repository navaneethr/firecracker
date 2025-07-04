"use client"
import * as React from "react"
import { ArrowUpRight } from "lucide-react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  loading?: boolean
}

export function ChatInput({ value, onChange, onSend, loading }: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    if (!loading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [loading]);
  return (
    <form
      className="flex flex-col gap-2 bg-background"
      onSubmit={e => {
        e.preventDefault()
        onSend()
      }}
    >
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          className="w-full resize-none rounded-md border px-3 py-2 pr-12 text-sm font-sans placeholder:text-sm placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-amber-500 h-28 overflow-auto"
          placeholder="Type a message and press Enter or click the arrow..."
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={loading}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          inputMode="text"
          style={{ fontSize: '16px' }}
        />
        <button
          type="submit"
          className="absolute bottom-5 right-2.5 p-2 text-amber-500 hover:bg-amber-100 transition disabled:opacity-50 rounded-md"
          disabled={loading || !value.trim()}
          tabIndex={0}
          aria-label="Send"
          style={{ lineHeight: 0, background: 'none', border: 'none' }}
        >
          <ArrowUpRight size={24} strokeWidth={4} />
        </button>
      </div>
    </form>
  )
}
