import { NextRequest, NextResponse } from 'next/server';

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function authHeaders(request: NextRequest): HeadersInit {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    console.log('Making request to real API:', `${API_BASE_URL}/changelog/latest?limit=${limit}`)
    
    const response = await fetch(`${API_BASE_URL}/changelog/latest?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('Real API response:', data)
      return NextResponse.json(data)
    } else {
      console.error('Real API returned error status:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch changelog from backend' },
        { status: response.status }
      )
    }

  } catch (error) {
    console.error('Error fetching latest changelog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 