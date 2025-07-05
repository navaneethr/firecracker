import { NextRequest, NextResponse } from 'next/server';

// Dummy chat data for initial integration
const messages = [
  { id: '1', role: 'assistant', content: 'Hello!' },
];

export async function POST(req: NextRequest) {
  const { model, messages: conversation, initial } = await req.json();
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (initial) {
    // Return dummy messages for initial load
    return NextResponse.json({ messages });
  }
  if (!apiKey) {
    return new Response('Missing Fireworks API key', { status: 500 });
  }

  const fwRes = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: conversation,
      stream: true,
    }),
  });

  if (!fwRes.body) {
    return new Response('No response body from Fireworks', { status: 500 });
  }

  return new Response(fwRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ messages });
}
