import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { ListUpdate } from '@/app/todo/atoms/types'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const data: ListUpdate = await request.json()
    const { listId } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const updatedList = {
        id: listId,
        type: 'task',
        title: data.title || 'Updated List',
        variant: data.variant || 'default',
        created_at: '2024-12-01T10:00:00Z',
        updated_at: now
      }
      
      return NextResponse.json(updatedList)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
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
      throw new Error('Failed to update list')
    }
    
    const updatedList = await response.json()
    return NextResponse.json(updatedList)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { listId } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      return NextResponse.json({ message: 'List deleted successfully' })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'List not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to delete list')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    )
  }
} 