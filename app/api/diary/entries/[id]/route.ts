import { NextRequest, NextResponse } from 'next/server'
import { DiaryEntryUpdate } from '@/app/diary/atoms/types'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(request: NextRequest): HeadersInit {
  const authHeader = request.headers.get('authorization')
  return authHeader ? { Authorization: authHeader } : {}
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const response = await fetch(`${API_BASE_URL}/diary-entries/${id}`, {
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
    
    const response = await fetch(`${API_BASE_URL}/diary-entries/${id}`, {
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
    
    const response = await fetch(`${API_BASE_URL}/diary-entries/${id}`, {
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