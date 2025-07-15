import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility to parse Fireworks SSE chunk
export function parseFireworksSSEChunk(chunk: string): string {
  const lines = chunk
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data: ") && line !== "data: [DONE]")

  let result = ""

  for (const line of lines) {
    try {
      const jsonStr = line.replace(/^data: /, "")
      const parsed = JSON.parse(jsonStr)
      let deltaContent = parsed?.choices?.[0]?.delta?.content
      if (typeof deltaContent === "string") {
        result += deltaContent
      }
    } catch {
      // Ignore malformed JSON lines
    }
  }

  return result
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createThinkStripper() {
  let inThink = false
  let buffer = ""

  // Example chunk 1: "Hello <think>reasoning</think> world"
  // Result: "Hello  world" (thinking content removed)

  return function stripChunk(chunk: string): string {
    buffer += chunk
    let output = ""
    let i = 0
    // Process the buffer until we reach the end
    while (i < buffer.length) {
      if (!inThink) {
        // Find the next <think> tag
        const openTag = buffer.indexOf("<think", i)
        // If no more <think> tags, add the rest of the buffer
        if (openTag === -1) {
          output += buffer.slice(i)
          buffer = ""
          break
        }

        // Add text before <think
        output += buffer.slice(i, openTag)

        // Try to find the end of the opening tag
        const tagEnd = buffer.indexOf(">", openTag)
        if (tagEnd === -1) {
          // Not enough data yet, wait for more
          buffer = buffer.slice(openTag)
          return output
        }

        const isSelfClosing = buffer[tagEnd - 1] === "/"
        inThink = !isSelfClosing

        i = tagEnd + 1
      } else {
        const closeTag = buffer.indexOf("</think>", i)
        if (closeTag === -1) {
          // Wait for more data inside <think>
          buffer = buffer.slice(i)
          return output
        }

        // Skip <think> content
        i = closeTag + "</think>".length
        inThink = false
      }
    }

    buffer = ""
    return output
  }
}

export function createThinkExtractor() {
  let inThink = false
  let buffer = ""

  return function extractThink(chunk: string): string {
    buffer += chunk
    let thinkContent = ""
    let i = 0

    while (i < buffer.length) {
      if (!inThink) {
        // Find the next <think> tag
        const openTag = buffer.indexOf("<think", i)
        if (openTag === -1) {
          buffer = ""
          break
        }

        // Try to find the end of the opening tag
        const tagEnd = buffer.indexOf(">", openTag)
        if (tagEnd === -1) {
          // Not enough data yet, wait for more
          buffer = buffer.slice(openTag)
          return thinkContent
        }

        const isSelfClosing = buffer[tagEnd - 1] === "/"
        inThink = !isSelfClosing

        i = tagEnd + 1
      } else {
        const closeTag = buffer.indexOf("</think>", i)
        if (closeTag === -1) {
          // Extract what we have so far inside <think>
          thinkContent += buffer.slice(i)
          buffer = buffer.slice(i)
          return thinkContent
        }

        // Extract content between <think> and </think>
        thinkContent += buffer.slice(i, closeTag)
        i = closeTag + "</think>".length
        inThink = false
      }
    }

    buffer = ""
    return thinkContent
  }
}
