"use client"
import * as React from "react"
import axios from "axios"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { ModelSelect } from "@/components/chat/ModelSelect"
import { ChatInput } from "@/components/chat/ChatInput"
import { ThemeToggle } from "@/components/theme-toggle"
import { Icons } from "@/components/icons"




import { useGlobalContext } from "@/components/global-context"

export default function IndexPage() {
  const { models, selectedModel } = useGlobalContext();
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  type Message = { id: string; role: string; content: string };
  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    axios.get('/api/chat')
      .then(res => {
        setMessages(res.data.messages || [])
      })
      .catch(() => setMessages([]))
  }, [])

  const handleSend = () => {
    if (!input.trim()) return
    setLoading(true)
    setMessages((msgs) => [
      ...msgs,
      { id: String(msgs.length + 1), role: "user", content: input }
    ])
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { id: String(msgs.length + 1), role: "assistant", content: `You said: ${input}` }
      ])
      setInput("")
      setLoading(false)
    }, 800)
  }

  return (
    <main className="flex-1 flex flex-col relative items-center">
      <div className="flex-1 flex flex-col w-full max-w-3xl px-4 sm:px-8 md:px-12 lg:mx-auto gap-4 min-h-0 pt-4 pb-40">
        <ChatContainer
          selectedModel={selectedModel}
          messages={messages}
        />
      </div>
      <div className="w-full flex flex-col items-center fixed bottom-0 left-0 z-20 bg-background pb-4">
        <div className="w-full max-w-3xl mb-2 px-4 sm:px-8 md:px-12">
          <ChatInput value={input} onChange={setInput} onSend={handleSend} loading={loading} />
        </div>
        <div className="w-full max-w-3xl flex flex-col items-start px-4 sm:px-8 md:px-12">
          {(() => {
            const model = models.find(m => m.name === selectedModel);
            if (!model) return null;
            return (
              <div className="w-full text-left">
                <div className="text-xs text-muted-foreground px-1 whitespace-nowrap overflow-x-hidden text-ellipsis" style={{maxWidth: '100%'}}>{model.description}</div>
              </div>
            );
          })()}
        </div>
      </div>
    </main>
  )
}
