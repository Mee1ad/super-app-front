import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { ListResponse, ListCreate } from '@/app/todo/atoms/types'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Mock lists for non-authenticated users
const mockLists: ListResponse[] = [
  {
    id: "demo-list-1",
    type: "task",
    title: "Personal Tasks",
    variant: "default",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "demo-list-2",
    type: "shopping",
    title: "Grocery List",
    variant: "default",
    created_at: "2024-12-01T11:00:00Z",
    updated_at: "2024-12-01T11:00:00Z"
  },
  {
    id: "demo-list-3",
    type: "task",
    title: "Work Projects",
    variant: "outlined",
    created_at: "2024-12-01T12:00:00Z",
    updated_at: "2024-12-01T12:00:00Z"
  }
]

// Generate UUID for new lists
const generateId = () => {
  return 'demo-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock data for non-authenticated users
      return NextResponse.json(mockLists)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch lists')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ListCreate = await request.json()
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const newList: ListResponse = {
        id: generateId(),
        type: data.type,
        title: data.title,
        variant: data.variant,
        created_at: now,
        updated_at: now
      }
      
      return NextResponse.json(newList, { status: 201 })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to create list')
    }
    
    const newList = await response.json()
    return NextResponse.json(newList, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    )
  }
} 