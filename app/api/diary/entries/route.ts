import { NextRequest, NextResponse } from 'next/server'
import { DiaryEntry, DiaryEntryCreate, PaginationMeta } from '@/app/diary/atoms/types'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(request: NextRequest): HeadersInit {
  const authHeader = request.headers.get('authorization')
  return authHeader ? { Authorization: authHeader } : {}
}

export async function GET(request: NextRequest) {
  try {
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
    
    const url = `${API_BASE_URL}/api/v1/diary/entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch diary entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: DiaryEntryCreate = await request.json()
    
    const response = await fetch(`${API_BASE_URL}/api/v1/diary/entries`, {
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create diary entry' },
      { status: 500 }
    )
  }
} 