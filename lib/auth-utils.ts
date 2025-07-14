import { getAccessToken } from './auth-token'

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getAccessToken()
  return !!token
}

// Get authentication status for API routes
export function getAuthStatus(request: Request): { isAuthenticated: boolean; token: string | null } {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || null
  return {
    isAuthenticated: !!token,
    token
  }
}

// Helper to determine if we should use mock data
export function shouldUseMockData(request: Request): boolean {
  const { isAuthenticated } = getAuthStatus(request)
  return !isAuthenticated
} 