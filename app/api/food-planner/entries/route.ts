import { NextRequest, NextResponse } from 'next/server'
import { FoodEntry, FoodEntryCreate, PaginationMeta } from '@/app/food-planner/atoms/types'

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
    const category = searchParams.get('category')
    const meal_type = searchParams.get('meal_type')
    const date_filter = searchParams.get('date_filter')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    
    // Build query string for backend API
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    if (category) queryParams.append('category', category)
    if (meal_type) queryParams.append('meal_type', meal_type)
    if (date_filter) queryParams.append('date_filter', date_filter)
    if (page) queryParams.append('page', page)
    if (limit) queryParams.append('limit', limit)
    
    const url = `${API_BASE_URL}/api/v1/food-planner/entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch food entries')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch food entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: FoodEntryCreate = await request.json()
    
    const response = await fetch(`${API_BASE_URL}/api/v1/food-planner/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to create food entry')
    }
    
    const newEntry = await response.json()
    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create food entry' },
      { status: 500 }
    )
  }
} 