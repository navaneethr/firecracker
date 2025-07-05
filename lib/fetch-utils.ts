// lib/fetch-utils.ts

export async function fetchGet(url: string, options: RequestInit = {}) {
  const res = await fetch(url, { ...options, method: 'GET' });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

// If options.raw is true, return the raw Response object (for streaming)
export async function fetchPost(url: string, data: any, options: RequestInit & { raw?: boolean } = { raw: false }) {
  const { raw, ...fetchOptions } = options;
  const res = await fetch(url, {
    ...fetchOptions,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers || {})
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  if (raw) return res;
  return res.json();
}
