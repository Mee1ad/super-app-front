import { NextRequest, NextResponse } from 'next/server';

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function authHeaders(request: NextRequest): HeadersInit {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entry_id, user_identifier } = body;

    // Validate required fields
    if (!entry_id || !user_identifier) {
      return NextResponse.json(
        { error: 'Missing required fields: entry_id and user_identifier' },
        { status: 400 }
      );
    }

    console.log('Making request to real API:', `${API_BASE_URL}/changelog/mark-viewed`)
    
    const response = await fetch(`${API_BASE_URL}/changelog/mark-viewed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify({
        entry_id,
        user_identifier
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      console.error('Real API returned error status:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to mark changelog entry as viewed' },
        { status: response.status }
      )
    }

  } catch (error) {
    console.error('Error marking changelog entry as viewed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 