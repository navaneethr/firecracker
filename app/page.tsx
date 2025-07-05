"use client"
import * as React from "react"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { ChatInput } from "@/components/chat/ChatInput"
import { toast } from "sonner";
import { useGlobalContext } from "@/components/global-context"
import { fetchPost } from "@/lib/fetch-utils"

// Utility to post chat messages (initial or streaming)
async function postChatMessages({ model, messages, initial = false }: { model: string, messages: any[], initial?: boolean }) {
  try {
    const res = await fetchPost('/api/chat', { model, messages, initial }, { raw: !initial });
    if (initial) {
      return { data: res };
    } else {
      if (!res.body) throw new Error('No response body');
      return { data: res.body };
    }
  } catch (err) {
    toast.error(initial ? 'Failed to load initial chat.' : 'Failed to send message. Please try again.');
    throw err;
  }
}

export default function IndexPage() {
  const { models, selectedModel } = useGlobalContext();
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  type Message = { id: string; role: string; content: string };
  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await postChatMessages({ model: selectedModel, messages: [], initial: true });
        setMessages(res.data.messages || []);
      } catch {
        setMessages([]);
      }
    })();
  }, [selectedModel]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const newMessages = [
      ...messages,
      { id: String(messages.length + 1), role: "user", content: input }
    ];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await postChatMessages({
        model: selectedModel,
        messages: newMessages.map(({ role, content }) => ({ role, content })),
        initial: false
      });
      console.log("Response from server:", res);
      if (!res.data) {
        setLoading(false);
        toast.error("No response from server.");
        return;
      }
      const reader = res.data.getReader();
      console.log("Starting to read response stream...", reader);
      let assistantMessage = "";
      let buffer = "";
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += new TextDecoder().decode(value);
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? ""; // Save incomplete line for next chunk
          const parsed = parseFireworksSSEChunk(lines.join('\n'));
          if (parsed) {
            assistantMessage += parsed;
            console.log("Assistant message chunk:", parsed);
            const assistantId = String(newMessages.length + 1);
            setMessages((msgs) => [
              ...msgs.filter((m) => m.id !== assistantId),
              { id: assistantId, role: "assistant", content: assistantMessage }
            ]);
          }
        }
      }
      // Handle any remaining buffer after stream ends
      if (buffer) {
        const parsed = parseFireworksSSEChunk(buffer);
        if (parsed) {
          assistantMessage += parsed;
          setMessages((msgs) => [
            ...msgs.filter((m) => m.role !== "assistant" || m.id !== String(newMessages.length + 1)),
            { id: String(newMessages.length + 1), role: "assistant", content: assistantMessage }
          ]);
        }
      }
    } catch (err) {
      // toast already handled in util
    }
    setLoading(false);
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



export function parseFireworksSSEChunk(chunk: string): string {
  console
  const lines = chunk
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('data: ') && line !== 'data: [DONE]');

  let result = '';

  for (const line of lines) {
    try {
      const jsonStr = line.replace('data: ', '');
      const parsed = JSON.parse(jsonStr);
      const deltaContent = parsed?.choices?.[0]?.delta?.content;
      if (deltaContent) {
        result += deltaContent;
      }
    } catch {
      // Ignore malformed JSON lines
    }
  }

  return result;
}