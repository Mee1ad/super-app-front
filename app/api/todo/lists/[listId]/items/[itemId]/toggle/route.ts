import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string; itemId: string }> }
) {
  try {
    const { listId, itemId } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const toggledItem = {
        id: itemId,
        list_id: listId,
        title: 'Toggled Item',
        url: null,
        price: null,
        source: null,
        checked: true, // Toggle to true
        variant: 'default',
        position: 0,
        created_at: '2024-12-01T10:00:00Z',
        updated_at: now
      }
      
      return NextResponse.json(toggledItem)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}/items/${itemId}/toggle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Shopping item not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to toggle shopping item')
    }
    
    const toggledItem = await response.json()
    return NextResponse.json(toggledItem)
  } catch {
    return NextResponse.json(
      { error: 'Failed to toggle shopping item' },
      { status: 500 }
    )
  }
} 