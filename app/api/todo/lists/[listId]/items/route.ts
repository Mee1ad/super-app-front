import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'
import { mockShoppingItems, generateId } from '../../../mock-data'
import { ShoppingItemCreate } from '@/app/todo/atoms/types'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock data for non-authenticated users
      const items = mockShoppingItems.filter((item) => item.list_id === params.listId)
      return NextResponse.json(items)
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${params.listId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch shopping items')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch shopping items' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const data: ShoppingItemCreate = await request.json()
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const newItem = {
        id: generateId(),
        list_id: params.listId,
        title: data.title,
        url: data.url,
        price: data.price,
        source: data.source,
        checked: data.checked,
        variant: data.variant,
        position: data.position,
        created_at: now,
        updated_at: now
      }
      
      return NextResponse.json(newItem, { status: 201 })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/lists/${params.listId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to create shopping item')
    }
    
    const newItem = await response.json()
    return NextResponse.json(newItem, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create shopping item' },
      { status: 500 }
    )
  }
} 