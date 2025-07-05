// Utility to parse Fireworks SSE chunk
export function parseFireworksSSEChunk(chunk: string): string {
  const lines = chunk
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('data: ') && line !== 'data: [DONE]');

  let result = '';

  for (const line of lines) {
    try {
      const jsonStr = line.replace(/^data: |<think\s*\/?\>/g, '');
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
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
