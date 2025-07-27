import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'

// Generate a simple ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// Mock food entries data for the API route
const mockFoodEntries = [
  {
    id: '1',
    user_id: 'user-1',
    name: 'Pizza Margherita',
    price: 12.99,
    description: 'Classic Italian pizza with tomato sauce and mozzarella',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user-1',
    name: 'Caesar Salad',
    price: 8.50,
    description: 'Fresh romaine lettuce with Caesar dressing and croutons',
    image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

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
      const start_date = searchParams.get('start_date')
      const end_date = searchParams.get('end_date')
      const min_price = searchParams.get('min_price')
      const max_price = searchParams.get('max_price')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
      
      let filteredEntries = [...mockFoodEntries]
      
      // Apply search filter
      if (search) {
        const searchTerm = search.toLowerCase()
        filteredEntries = filteredEntries.filter(entry =>
          entry.name.toLowerCase().includes(searchTerm) ||
          entry.description?.toLowerCase().includes(searchTerm)
        )
      }
      
      // Apply date filters
      if (start_date) {
        filteredEntries = filteredEntries.filter(entry => entry.date >= start_date)
      }
      if (end_date) {
        filteredEntries = filteredEntries.filter(entry => entry.date <= end_date)
      }
      
      // Apply price filters
      if (min_price) {
        filteredEntries = filteredEntries.filter(entry => entry.price >= parseFloat(min_price))
      }
      if (max_price) {
        filteredEntries = filteredEntries.filter(entry => entry.price <= parseFloat(max_price))
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedEntries = filteredEntries.slice(startIndex, endIndex)
      
      return NextResponse.json({
        entries: paginatedEntries,
        total: filteredEntries.length,
        page,
        limit,
        pages: Math.ceil(filteredEntries.length / limit)
      })
    }

    // Use real API for authenticated users
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const min_price = searchParams.get('min_price')
    const max_price = searchParams.get('max_price')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    
    // Build query string for backend API
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    if (start_date) queryParams.append('start_date', start_date)
    if (end_date) queryParams.append('end_date', end_date)
    if (min_price) queryParams.append('min_price', min_price)
    if (max_price) queryParams.append('max_price', max_price)
    if (page) queryParams.append('page', page)
    if (limit) queryParams.append('limit', limit)
    
    const url = `${API_BASE_URL}/food-entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    let response: Response
    try {
      response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(request)
        }
      })
    } catch (fetchError) {
      console.error('🔍 Frontend API: Fetch error:', fetchError)
      throw new Error(`Network error connecting to backend: ${(fetchError as Error).message}`)
    }
    
    if (!response.ok) {
      // If backend returns 401 (unauthorized), return the same status
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid or expired token' },
          { status: 401 }
        )
      }
      // For other errors, throw to be caught by the outer catch
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Food entries API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch food entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Check if user is authenticated
    if (shouldUseMockData(request)) {
      // Return mock response for non-authenticated users
      const now = new Date().toISOString()
      const newEntry = {
        id: generateId(),
        user_id: 'user-1',
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: data.image_url,
        date: data.date || new Date().toISOString().split('T')[0],
        created_at: now,
        updated_at: now
      }
      
      return NextResponse.json(newEntry, { status: 201 })
    }

    // Use real API for authenticated users
    const response = await fetch(`${API_BASE_URL}/food-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      // If backend returns 401 (unauthorized), return the same status
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid or expired token' },
          { status: 401 }
        )
      }
      // For other errors, throw to be caught by the outer catch
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }
    
    const newEntry = await response.json()
    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    console.error('Food entries POST API error:', error)
    return NextResponse.json(
      { error: 'Failed to create food entry' },
      { status: 500 }
    )
  }
} 