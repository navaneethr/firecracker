"use client"
import * as React from "react"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { ChatInput } from "@/components/chat/ChatInput"
import { toast } from "sonner";
import { useGlobalContext } from "@/components/global-context"

import { fetchPost } from "@/lib/fetch-utils"
import { createThinkStripper, parseFireworksSSEChunk } from "@/lib/utils"

type Message = { id: string; role: string; content: string };
type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  updatedAt: number;
};
const LS_KEY = 'firecracker_conversations';
const LS_LAST_ID = 'firecracker_last_conversation_id';

function getConversationsFromLS(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveConversationsToLS(convs: Conversation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(convs));
}
function getLastConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LS_LAST_ID);
}
function setLastConversationId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_LAST_ID, id);
}

// Utility to post chat messages (initial or streaming), supports abort
async function postChatMessages({ model, messages, initial = false, signal }: { model: string, messages: any[], initial?: boolean, signal?: AbortSignal }) {
  try {
    const res = await fetchPost('/api/chat', { model, messages, initial }, { raw: !initial, signal });
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

const stripThinkTags = createThinkStripper();

export default function Page() {
  const { models, selectedModel } = useGlobalContext();
  // Remove input state from parent, move to ChatInput
  const [loading, setLoading] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Load last conversation on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const conversations = getConversationsFromLS();
    const lastId = getLastConversationId();
    let found: Conversation | undefined = undefined;
    if (lastId) {
      found = conversations.find(c => c.id === lastId);
    }
    if (!found && conversations.length > 0) {
      found = conversations[conversations.length - 1];
    }
    if (found) {
      setConversationId(found.id);
      setMessages(found.messages);
    }
  }, []);

  // Save conversation to localStorage on messages/model change
  React.useEffect(() => {
    if (!conversationId) return;
    const conversations = getConversationsFromLS();
    const idx = conversations.findIndex(c => c.id === conversationId);
    const title = messages.find(m => m.role === 'user')?.content?.slice(0, 40) || 'New Chat';
    const updated: Conversation = {
      id: conversationId,
      title,
      messages,
      model: selectedModel,
      updatedAt: Date.now(),
    };
    if (idx > -1) {
      conversations[idx] = updated;
    } else {
      conversations.push(updated);
    }
    saveConversationsToLS(conversations);
    setLastConversationId(conversationId);
  }, [messages, selectedModel, conversationId]);

  const handleSend = async (input: string) => {
    if (!input.trim()) return;
    setLoading(true);
    let convId = conversationId;
    if (!convId) {
      convId = crypto.randomUUID();
      setConversationId(convId);
    }
    const newMessages = [
      ...messages,
      { id: String(messages.length + 1), role: "user", content: input }
    ];
    setMessages(newMessages);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await postChatMessages({
        model: selectedModel,
        messages: newMessages.map(({ role, content }) => ({ role, content })),
        initial: false,
        signal: abortController.signal
      });
      if (!res.data) {
        setLoading(false);
        toast.error("No response from server.");
        return;
      }
      const reader = res.data.getReader();
      let assistantMessage = "";
      let buffer = "";
      let done = false;
      let receivedAny = false;
      const assistantId = String(newMessages.length + 1);
      /* 
        'data: {"choices":[{"delta":{"conte'
        'nt":"**Why I\'m open-source:**"}}]}\n'
        'data: {"choices":[{"delta":{"con'
        'tent":"\\n\\n"}}]}\n'
        'data: {"choices":[{"delta":{"cont'
        'ent":"I\'m a variant of the transformer "}}]}\n'
        'data: {"choices":[{"delta":{"conte'
        'nt":"architecture."}}]}\n'
        'data: [DONE]\n'
      */
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += new TextDecoder().decode(value);
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? "";
          console.log("Received chunk:", lines);
          const parsed = parseFireworksSSEChunk(lines.join('\n'));
          if (parsed) {
            receivedAny = true;
            const clean = stripThinkTags(parsed);
            assistantMessage += clean;
            setMessages((msgs) => [
              ...msgs.filter((m) => m.id !== String(assistantId)),
              { id: String(assistantId), role: "assistant", content: assistantMessage }
            ]);
          }
        }
      }
      if (buffer) {
        const parsed = parseFireworksSSEChunk(buffer);
        if (parsed) {
          receivedAny = true;
          const clean = stripThinkTags(parsed);
          assistantMessage += parsed;
          setMessages((msgs) => [
            ...msgs.filter((m) => m.role !== "assistant" || m.id !== String(assistantId)),
            { id: String(assistantId), role: "assistant", content: assistantMessage }
          ]);
        }
      }
      if (!receivedAny) {
        toast.error("The model returned an empty response, use a different model or try again.");
        throw new Error("Empty stream response from model");
      }
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        toast.info('Request stopped.');
      } else {
        // toast already handled in util or above
        console.error("Error sending message:", err);
      }
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return (
    <main className="flex-1 flex flex-col relative items-center">
      <div className="flex-1 flex flex-col w-full max-w-5xl px-4 sm:px-8 md:px-12 lg:mx-auto gap-4 min-h-0 pt-4 pb-40">
        <ChatContainer
          selectedModel={selectedModel}
          messages={messages}
        />
      </div>
      <div className="w-full flex flex-col items-center fixed bottom-0 left-0 z-20 bg-background pb-4">
        <div className="w-full max-w-5xl mb-2 px-4 sm:px-8 md:px-12">
        <ChatInput onSend={handleSend} loading={loading} onStop={handleStop} />
        </div>
        <div className="w-full max-w-5xl flex flex-col items-start px-4 sm:px-8 md:px-12">
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