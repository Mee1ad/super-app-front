import { GoogleAuthUrlResponse, GoogleLoginRequest, GoogleLoginResponse, User } from './types'
import { getAccessToken } from '@/lib/auth-token'

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(): HeadersInit {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const authApi = {
  // Get Google OAuth URL
  async getGoogleAuthUrl(): Promise<GoogleAuthUrlResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/google/url`)
    if (!response.ok) {
      throw new Error('Failed to get Google OAuth URL')
    }
    return response.json()
  },

  // Login with Google OAuth code
  async loginWithGoogle(code: string): Promise<GoogleLoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      } as HeadersInit,
      body: JSON.stringify({ code } as GoogleLoginRequest),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to login with Google')
    }
    
    return response.json()
  },

  // Get user profile with role information
  async getProfile(): Promise<User> {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      } as HeadersInit
    })
    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }
    return response.json()
  }
} 