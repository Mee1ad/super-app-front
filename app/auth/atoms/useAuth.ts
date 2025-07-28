import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { authApi } from './api'
import { AuthState, GoogleLoginResponse } from './types'
import { hasPermission, hasRole, setupTokenExpiration, logout as logoutUser, checkAndClearExpiredTokens, clearAuthData } from '@/lib/permissions'

// Storage keys matching backend documentation
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user'
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
    error: null
  })
  const { toast } = useToast()

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        // First, check and clear any expired tokens
        const hadExpiredTokens = checkAndClearExpiredTokens()
        
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        const userStr = localStorage.getItem(STORAGE_KEYS.USER)
        
        if (accessToken && refreshToken && userStr) {
          const user = JSON.parse(userStr)
          console.log('Loaded user from storage:', user) // Debug log
          console.log('Setting auth state with user:', user) // Debug log
          setAuthState({
            isAuthenticated: true,
            user,
            accessToken,
            refreshToken,
            loading: false,
            error: null
          })
          
          // Setup token expiration check
          setupTokenExpiration()
        } else {
          if (hadExpiredTokens) {
            console.log('Cleared expired tokens, user needs to login again') // Debug log
          } else {
            console.log('No auth data found in storage') // Debug log
          }
          setAuthState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }

    loadAuthState()
    
    // Listen for auth data updates from URL processing
    const handleAuthDataUpdate = () => {
      console.log('🔄 Auth data updated from URL, reloading auth state')
      loadAuthState()
    }
    
    window.addEventListener('authDataUpdated', handleAuthDataUpdate as EventListener)
    
    return () => {
      window.removeEventListener('authDataUpdated', handleAuthDataUpdate as EventListener)
    }
  }, [])

  // Save auth state to localStorage
  const saveAuthState = useCallback((response: GoogleLoginResponse) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.tokens.access_token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.tokens.refresh_token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
  }, [])

  // Clear auth state from localStorage
  const clearAuthState = useCallback(() => {
    clearAuthData()
  }, [])

  // Get Google OAuth URL
  const getGoogleAuthUrl = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      const response = await authApi.getGoogleAuthUrl()
      return response.auth_url
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get Google OAuth URL'
      setAuthState(prev => ({ ...prev, error: message }))
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }, [toast])

  // Login with Google OAuth code
  const loginWithGoogle = useCallback(async (code: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      const response = await authApi.loginWithGoogle(code)
      
      saveAuthState(response)
      console.log('Login response:', response) // Debug log
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.tokens.access_token,
        refreshToken: response.tokens.refresh_token,
        loading: false,
        error: null
      })

      // Setup token expiration check
      setupTokenExpiration()

      // Removed success toast

      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login with Google'
      setAuthState(prev => ({ ...prev, error: message }))
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }, [toast, saveAuthState])

  // Logout
  const logout = useCallback(() => {
    clearAuthState()
    logoutUser() // This will redirect to login
  }, [clearAuthState])

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (code: string) => {
    try {
      await loginWithGoogle(code)
      // Redirect to home page or dashboard
      window.location.href = '/'
    } catch (error) {
      // Error is already handled by loginWithGoogle
      console.error('OAuth callback error:', error)
    }
  }, [loginWithGoogle])

  // Add permission checking methods
  const checkPermission = useCallback((permission: string) => {
    // Don't check permissions during SSR or while loading
    if (typeof window === 'undefined' || authState.loading) {
      return false;
    }
    return hasPermission(permission)
  }, [authState.loading])

  const checkRole = useCallback((roleName: string) => {
    // Don't check roles during SSR or while loading
    if (typeof window === 'undefined' || authState.loading) {
      return false;
    }
    return hasRole(roleName)
  }, [authState.loading])

  return {
    ...authState,
    getGoogleAuthUrl,
    loginWithGoogle,
    logout,
    handleOAuthCallback,
    hasPermission: checkPermission,
    hasRole: checkRole
  }
} 