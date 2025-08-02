// Utility to get the JWT access token from storage
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_access_token')
}

// Utility to clear the auth token cookie (for cleanup)
export function clearAuthTokenCookie(): void {
  if (typeof window === 'undefined') return
  
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
} 