import { NextRequest, NextResponse } from 'next/server'
import { DiaryEntry, DiaryEntryCreate, PaginationMeta } from '@/app/diary/atoms/types'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { mockDiaryEntries, generateId } from '../mock-data'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
      const mood = searchParams.get('mood')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
      
      let filteredEntries = [...mockDiaryEntries]
      
      // Apply search filter
      if (search) {
        const searchTerm = search.toLowerCase()
        filteredEntries = filteredEntries.filter(entry =>
          entry.title.toLowerCase().includes(searchTerm) ||
          entry.content.toLowerCase().includes(searchTerm)
        )
      }
      
      // Apply mood filter
      if (mood) {
        filteredEntries = filteredEntries.filter(entry => entry.mood === mood)
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedEntries = filteredEntries.slice(startIndex, endIndex)
      
      const meta: PaginationMeta = {
        total: filteredEntries.length,
        page,
        limit,
        pages: Math.ceil(filteredEntries.length / limit)
      }
      
      return NextResponse.json({
        entries: paginatedEntries,
        meta
      })
    }

    // Use real API for authenticated users
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const mood = searchParams.get('mood')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    
    // Build query string for backend API
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    if (mood) queryParams.append('mood', mood)
    if (page) queryParams.append('page', page)
    if (limit) queryParams.append('limit', limit)
    
          const url = `${API_BASE_URL}/diary-entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch diary entries')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch diary entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: DiaryEntryCreate = await request.json()
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const newEntry: DiaryEntry = {
        id: generateId(),
        title: data.title,
        content: data.content,
        mood: data.mood,
        date: data.date || new Date().toISOString().split('T')[0],
        images: data.images || [],
        created_at: now,
        updated_at: now
      }
      
      return NextResponse.json(newEntry, { status: 201 })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/diary-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to create diary entry')
    }
    
    const newEntry = await response.json()
    return NextResponse.json(newEntry, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create diary entry' },
      { status: 500 }
    )
  }
} 