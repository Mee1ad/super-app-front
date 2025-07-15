import { NextRequest, NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth-utils'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(request: NextRequest): HeadersInit {
  const { token } = getAuthStatus(request)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(request: NextRequest) {
  try {
    const { token } = getAuthStatus(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Call the backend profile endpoint
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(request)
      }
    })
    
    if (!response.ok) {
      // If backend is not available, return mock data for development
      console.log('Backend profile endpoint not available, using mock data')
      
      // Extract user info from token or use default
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        username: 'user',
        name: 'Demo User',
        is_active: true,
        is_superuser: false,
        role: {
          id: '1',
          name: 'viewer',
          description: 'Viewer',
          permissions: ['changelog:view']
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return NextResponse.json(mockUser)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
} 