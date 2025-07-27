import { NextRequest, NextResponse } from 'next/server'
import { DiaryEntryUpdate } from '@/app/diary/atoms/types'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { mockDiaryEntries } from '../../mock-data'

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
  try {
    const { id } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock data for non-authenticated users
      const entry = mockDiaryEntries.find(e => e.id === id)
      if (!entry) {
        return NextResponse.json(
          { error: 'Diary entry not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(entry)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/api/v1/diary-entries/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Diary entry not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to fetch diary entry')
    }
    
    const entry = await response.json()
    return NextResponse.json(entry)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch diary entry' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data: DiaryEntryUpdate = await request.json()
    const { id } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock data for non-authenticated users
      const entryIndex = mockDiaryEntries.findIndex(e => e.id === id)
      if (entryIndex === -1) {
        return NextResponse.json(
          { error: 'Diary entry not found' },
          { status: 404 }
        )
      }
      
      const updatedEntry = {
        ...mockDiaryEntries[entryIndex],
        ...data,
        updated_at: new Date().toISOString()
      }
      mockDiaryEntries[entryIndex] = updatedEntry
      return NextResponse.json(updatedEntry)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/api/v1/diary-entries/${id}`, {
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
          { error: 'Diary entry not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to update diary entry')
    }
    
    const updatedEntry = await response.json()
    return NextResponse.json(updatedEntry)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update diary entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock data for non-authenticated users
      const entryIndex = mockDiaryEntries.findIndex(e => e.id === id)
      if (entryIndex === -1) {
        return NextResponse.json(
          { error: 'Diary entry not found' },
          { status: 404 }
        )
      }
      
      mockDiaryEntries.splice(entryIndex, 1)
      return NextResponse.json({ message: 'Diary entry deleted successfully' })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/api/v1/diary-entries/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Diary entry not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to delete diary entry')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete diary entry' },
      { status: 500 }
    )
  }
} 