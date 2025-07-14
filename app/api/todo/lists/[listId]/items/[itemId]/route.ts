import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { ShoppingItemUpdate } from '@/app/todo/atoms/types'

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
    const data: ShoppingItemUpdate = await request.json()
    const { listId, itemId } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const updatedItem = {
        id: itemId,
        list_id: listId,
        title: data.title || 'Updated Item',
        url: data.url || null,
        price: data.price || null,
        source: data.source || null,
        checked: data.checked || false,
        variant: data.variant || 'default',
        position: data.position || 0,
        created_at: '2024-12-01T10:00:00Z',
        updated_at: now
      }
      
      return NextResponse.json(updatedItem)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}/items/${itemId}`, {
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
          { error: 'Shopping item not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to update shopping item')
    }
    
    const updatedItem = await response.json()
    return NextResponse.json(updatedItem)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update shopping item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string; itemId: string }> }
) {
  try {
    const { listId, itemId } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      return NextResponse.json({ message: 'Shopping item deleted successfully' })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
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
      throw new Error('Failed to delete shopping item')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete shopping item' },
      { status: 500 }
    )
  }
} 