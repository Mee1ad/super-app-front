import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string; taskId: string }> }
) {
  try {
    const { listId, taskId } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const toggledTask = {
        id: taskId,
        list_id: listId,
        title: 'Toggled Task',
        description: null,
        checked: true, // Toggle to true
        variant: 'default',
        position: 0,
        created_at: '2024-12-01T10:00:00Z',
        updated_at: now
      }
      
      return NextResponse.json(toggledTask)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}/tasks/${taskId}/toggle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to toggle task')
    }
    
    const toggledTask = await response.json()
    return NextResponse.json(toggledTask)
  } catch {
    return NextResponse.json(
      { error: 'Failed to toggle task' },
      { status: 500 }
    )
  }
} 