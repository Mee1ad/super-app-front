import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { mockTasks, generateId } from '../../../mock-data'
import { TaskCreate } from '@/app/todo/atoms/types'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  const { listId } = await params
  try {
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock data for non-authenticated users
      const tasks = mockTasks.filter((task) => task.list_id === listId)
      return NextResponse.json(tasks)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}/tasks`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch tasks')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  const { listId } = await params
  try {
    const data: TaskCreate = await request.json()
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const newTask = {
        id: generateId(),
        list_id: listId,
        title: data.title,
        description: data.description,
        checked: data.checked,
        variant: data.variant,
        position: data.position,
        created_at: now,
        updated_at: now
      }
      
      return NextResponse.json(newTask, { status: 201 })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${listId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to create task')
    }
    
    const newTask = await response.json()
    return NextResponse.json(newTask, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
} 