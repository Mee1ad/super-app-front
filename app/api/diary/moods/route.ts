import { NextRequest, NextResponse } from 'next/server'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(request: NextRequest): HeadersInit {
  const authHeader = request.headers.get('authorization')
  return authHeader ? { Authorization: authHeader } : {}
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/diary/moods`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch moods')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch moods' },
      { status: 500 }
    )
  }
} 