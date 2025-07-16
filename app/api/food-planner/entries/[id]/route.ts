import { NextRequest, NextResponse } from 'next/server'
import { FoodEntryUpdate } from '@/app/food-planner/atoms/types'

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
    
    const response = await fetch(`${API_BASE_URL}/food-entries/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Food entry not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to fetch food entry')
    }
    
    const entry = await response.json()
    return NextResponse.json(entry)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch food entry' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data: FoodEntryUpdate = await request.json()
    const { id } = await params
    
    const response = await fetch(`${API_BASE_URL}/food-entries/${id}`, {
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
          { error: 'Food entry not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to update food entry')
    }
    
    const updatedEntry = await response.json()
    return NextResponse.json(updatedEntry)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update food entry' },
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
    
    const response = await fetch(`${API_BASE_URL}/food-entries/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Food entry not found' },
          { status: 404 }
        )
      }
      throw new Error('Failed to delete food entry')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete food entry' },
      { status: 500 }
    )
  }
} 