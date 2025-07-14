import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { mockTasks, mockShoppingItems } from '../mock-data'
import { SearchResponse } from '@/app/todo/atoms/types'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Mock lists for search
const mockLists = [
  {
    id: "demo-list-1",
    type: "task" as const,
    title: "Personal Tasks",
    variant: "default" as const,
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "demo-list-2",
    type: "shopping" as const,
    title: "Grocery List",
    variant: "default" as const,
    created_at: "2024-12-01T11:00:00Z",
    updated_at: "2024-12-01T11:00:00Z"
  }
]

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock data for non-authenticated users
      const { searchParams } = new URL(request.url)
      const query = searchParams.get('q')
      
      if (!query) {
        return NextResponse.json({
          lists: [],
          tasks: [],
          shopping_items: []
        })
      }
      
      const searchTerm = query.toLowerCase()
      
      // Search in lists
      const matchingLists = mockLists.filter(list =>
        list.title.toLowerCase().includes(searchTerm)
      )
      
      // Search in tasks
      const matchingTasks = mockTasks.filter((task) =>
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
      )
      
      // Search in shopping items
      const matchingItems = mockShoppingItems.filter((item) =>
        item.title.toLowerCase().includes(searchTerm)
      )
      
      const searchResponse: SearchResponse = {
        lists: matchingLists,
        tasks: matchingTasks,
        shopping_items: matchingItems
      }
      
      return NextResponse.json(searchResponse)
    }

    // Use real API for authenticated users
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    const url = `${API_BASE_URL}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to search')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
} 