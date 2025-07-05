"use client"
import * as React from "react"
import { ArrowUpRight, Loader2, StopCircle } from "lucide-react"

interface ChatInputProps {
  onSend: (input: string) => void;
  loading?: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSend, loading, onStop }: ChatInputProps) {
  const [input, setInput] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    if (!loading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [loading]);
  const handleSend = React.useCallback(() => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  }, [input, onSend]);
  return (
    <form
      className="flex flex-col gap-2 bg-background"
      onSubmit={e => {
        e.preventDefault();
        handleSend();
      }}
    >
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          className="w-full resize-none rounded-md border px-3 py-2 pr-12 text-sm font-sans placeholder:text-sm placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-amber-500 h-28 overflow-auto"
          placeholder="Type a message and press Enter or click the arrow..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          inputMode="text"
          style={{ fontSize: '16px' }}
        />
        {/* Stop button (shows only when loading) */}
        {loading && (
          <button
            type="button"
            className="absolute bottom-5 right-12 p-2 text-amber-500 hover:bg-amber-100 transition disabled:opacity-50 rounded-md"
            onClick={onStop}
            tabIndex={0}
            aria-label="Stop"
            style={{ lineHeight: 0, background: 'none', border: 'none' }}
          >
            <StopCircle size={24} strokeWidth={3} />
          </button>
        )}
        <button
          type="submit"
          className="absolute bottom-5 right-2.5 p-2 text-amber-500 hover:bg-amber-100 transition disabled:opacity-50 rounded-md"
          disabled={loading || !input.trim()}
          tabIndex={0}
          aria-label={loading ? "Loading" : "Send"}
          style={{ lineHeight: 0, background: 'none', border: 'none' }}
        >
          {loading ? (
            <Loader2 size={24} strokeWidth={3} className="animate-spin" />
          ) : (
            <ArrowUpRight size={24} strokeWidth={4} />
          )}
        </button>
      </div>
    </form>
  );
}
