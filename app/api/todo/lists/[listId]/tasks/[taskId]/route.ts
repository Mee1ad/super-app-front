import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { TaskUpdate } from '@/app/todo/atoms/types'

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
    const data: TaskUpdate = await request.json()
    const { listId, taskId } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const updatedTask = {
        id: taskId,
        list_id: listId,
        title: data.title || 'Updated Task',
        description: data.description || null,
        checked: data.checked || false,
        variant: data.variant || 'default',
        position: data.position || 0,
        created_at: '2024-12-01T10:00:00Z',
        updated_at: now
      }
      
      return NextResponse.json(updatedTask)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}/tasks/${taskId}`, {
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
          { error: 'Task not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to update task')
    }
    
    const updatedTask = await response.json()
    return NextResponse.json(updatedTask)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string; taskId: string }> }
) {
  try {
    const { listId, taskId } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      return NextResponse.json({ message: 'Task deleted successfully' })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}/tasks/${taskId}`, {
      method: 'DELETE',
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
      throw new Error('Failed to delete task')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
} 