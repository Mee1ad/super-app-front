import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { mockIdeas } from '../mock-data'
import { IdeaUpdate } from '@/app/ideas/atoms/types'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock data for non-authenticated users
      const idea = mockIdeas.find(i => i.id === id)
      if (!idea) {
        return NextResponse.json(
          { error: 'Idea not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(idea)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/ideas/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch idea')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data: IdeaUpdate = await request.json()
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const idea = mockIdeas.find(i => i.id === id)
      if (!idea) {
        return NextResponse.json(
          { error: 'Idea not found' },
          { status: 404 }
        )
      }
      
      const updatedIdea = {
        ...idea,
        ...data,
        category_id: data.category || idea.category_id,
        updated_at: new Date().toISOString()
      }
      
      return NextResponse.json(updatedIdea)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/ideas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to update idea')
    }
    
    const updatedIdea = await response.json()
    return NextResponse.json(updatedIdea)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const idea = mockIdeas.find(i => i.id === id)
      if (!idea) {
        return NextResponse.json(
          { error: 'Idea not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ message: 'Idea deleted successfully' })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/ideas/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete idea')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    )
  }
} 