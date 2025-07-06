// lib/fetch-utils.ts
import { toast } from "sonner"

export async function fetchGet(url: string, options: RequestInit = {}) {
  const res = await fetch(url, { ...options, method: "GET" })
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
  return res.json()
}

// If options.raw is true, return the raw Response object (for streaming)
export async function fetchPost(
  url: string,
  data: any,
  options: RequestInit & { raw?: boolean } = { raw: false }
) {
  const { raw, ...fetchOptions } = options
  const res = await fetch(url, {
    ...fetchOptions,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions.headers || {}),
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`)
  if (raw) return res
  return res.json()
}

// Utility to post chat messages (initial or streaming), supports abort
export async function postChatMessages({
  model,
  messages,
  initial = false,
  signal,
}: {
  model: string
  messages: any[]
  initial?: boolean
  signal?: AbortSignal
}) {
  try {
    const res = await fetchPost(
      "/api/chat",
      { model, messages, initial, temperature: 0.8 },
      { raw: !initial, signal }
    )
    if (initial) {
      return { data: res }
    } else {
      if (!res.body) throw new Error("No response body")
      return { data: res.body }
    }
  } catch (err) {
    toast.error(
      initial
        ? "Failed to load initial chat."
        : "Failed to send message. Please try again."
    )
    throw err
  }
}
