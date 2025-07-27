import { NextRequest, NextResponse } from 'next/server'
import { shouldUseMockData, getAuthStatus } from '@/lib/auth-utils'

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
      // const { searchParams } = new URL(request.url)
      // const start_date = searchParams.get('start_date')
      // const end_date = searchParams.get('end_date')
      
      const mockSummary = {
        total_entries: 15,
        total_spent: 156.75,
        average_price: 10.45,
        entries_by_date: {
          '2024-01-15': 3,
          '2024-01-14': 2,
          '2024-01-13': 4,
          '2024-01-12': 3,
          '2024-01-11': 3
        }
      }
      
      return NextResponse.json(mockSummary)
    }

    // Use real API for authenticated users
    // const { searchParams } = new URL(request.url)
    // const start_date = searchParams.get('start_date')
    // const end_date = searchParams.get('end_date')
    
    // Build query string for backend API
    const queryParams = new URLSearchParams()
    // if (start_date) queryParams.append('start_date', start_date)
    // if (end_date) queryParams.append('end_date', end_date)
    
    const url = `${API_BASE_URL}/food-entries/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch food summary' },
      { status: 500 }
    )
  }
} 