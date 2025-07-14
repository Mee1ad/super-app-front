import { NextRequest, NextResponse } from 'next/server'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(request: NextRequest): HeadersInit {
  const authHeader = request.headers.get('authorization')
  return authHeader ? { Authorization: authHeader } : {}
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    // Build query string for backend API
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append('start_date', startDate)
    if (endDate) queryParams.append('end_date', endDate)
    
    const url = `${API_BASE_URL}/api/v1/food-planner/entries/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch food summary')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch food summary' },
      { status: 500 }
    )
  }
} 