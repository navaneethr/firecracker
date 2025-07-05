import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {

  const response = await fetch('https://app.fireworks.ai/api/models/mini-playground', {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }

  const data = await response.json()
  return NextResponse.json(data)
}
