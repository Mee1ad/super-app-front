import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { ReorderRequest } from '@/app/todo/atoms/types'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const data: ReorderRequest = await request.json()
    const { listId } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      return NextResponse.json({ message: 'Shopping items reordered successfully' })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}/items/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'List not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to reorder shopping items')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to reorder shopping items' },
      { status: 500 }
    )
  }
} 