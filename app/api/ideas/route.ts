import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { mockIdeas, generateId } from './mock-data'
import { IdeaCreate } from '@/app/ideas/atoms/types'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock data for non-authenticated users
      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search')
      const category = searchParams.get('category')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
      
      let filteredIdeas = [...mockIdeas]
      
      // Apply search filter
      if (search) {
        const searchTerm = search.toLowerCase()
        filteredIdeas = filteredIdeas.filter(idea =>
          idea.title.toLowerCase().includes(searchTerm) ||
          (idea.description && idea.description.toLowerCase().includes(searchTerm)) ||
          (idea.tags && idea.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        )
      }
      
      // Apply category filter
      if (category) {
        filteredIdeas = filteredIdeas.filter(idea => idea.category_id === category)
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedIdeas = filteredIdeas.slice(startIndex, endIndex)
      
      const meta = {
        total: filteredIdeas.length,
        page,
        limit,
        pages: Math.ceil(filteredIdeas.length / limit)
      }
      
      return NextResponse.json({
        ideas: paginatedIdeas,
        meta
      })
    }

    // Use real API for authenticated users
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    
    // Build query string for backend API
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    if (category) queryParams.append('category', category)
    if (page) queryParams.append('page', page)
    if (limit) queryParams.append('limit', limit)
    
          const url = `${API_BASE_URL}/ideas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch ideas')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: IdeaCreate = await request.json()
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const newIdea = {
        id: generateId(),
        title: data.title,
        description: data.description,
        category_id: data.category,
        tags: data.tags || [],
        created_at: now,
        updated_at: now
      }
      
      return NextResponse.json(newIdea, { status: 201 })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to create idea')
    }
    
    const newIdea = await response.json()
    return NextResponse.json(newIdea, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    )
  }
} 