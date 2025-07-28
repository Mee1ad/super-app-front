import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

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
      const mockEntry = {
        id: id,
        user_id: 'user-1',
        name: 'Sample Food Entry',
        price: 10.99,
        description: 'This is a sample food entry',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return NextResponse.json(mockEntry)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/food-entries/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch food entry')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
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
  const { id } = await params
  try {
    const data = await request.json()
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const updatedEntry = {
        id: id,
        user_id: 'user-1',
        name: data.name || 'Updated Food Entry',
        price: data.price || 10.99,
        description: data.description || 'Updated description',
        image_url: data.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        date: data.date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return NextResponse.json(updatedEntry)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/food-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
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
  const { id } = await params
  try {
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      return NextResponse.json({ message: 'Food entry deleted successfully' })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/food-entries/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete food entry')
    }
    
    return NextResponse.json({ message: 'Food entry deleted successfully' })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete food entry' },
      { status: 500 }
    )
  }
} 