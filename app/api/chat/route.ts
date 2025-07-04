import { NextRequest, NextResponse } from 'next/server';

// Dummy chat data for initial integration
const messages = [
  { id: '1', role: 'user', content: 'Hello!' },
  { id: '2', role: 'assistant', content: 'Hi! How can I help you today?' },
  { id: '3', role: 'user', content: 'Tell me about Fireworks API.' },
  { id: '4', role: 'assistant', content: 'Fireworks API provides access to state-of-the-art LLMs.' },
  { id: '5', role: 'user', content: 'Ok, lets talk about something else.' },
  { id: '6', role: 'assistant', content: 'Sure! What would you like to discuss?' },
];

export async function GET(req: NextRequest) {
  return NextResponse.json({ messages });
}
