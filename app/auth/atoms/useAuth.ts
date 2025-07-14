import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { authApi } from './api'
import { AuthState, GoogleLoginResponse } from './types'

// Storage keys
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
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        const userStr = localStorage.getItem(STORAGE_KEYS.USER)
        
        if (accessToken && refreshToken && userStr) {
          const user = JSON.parse(userStr)
          // Handle both old and new user data formats
          const normalizedUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            picture: user.picture
          }
          setAuthState({
            isAuthenticated: true,
            user: normalizedUser,
            accessToken,
            refreshToken,
            loading: false,
            error: null
          })
        } else {
          setAuthState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }

    loadAuthState()
  }, [])

  // Save auth state to localStorage
  const saveAuthState = useCallback((response: GoogleLoginResponse) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
  }, [])

  // Clear auth state from localStorage
  const clearAuthState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
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
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        loading: false,
        error: null
      })

      toast({
        title: "Success",
        description: `Welcome back, ${response.user.username || response.user.name}!`,
      })

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
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null
    })
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }, [clearAuthState, toast])

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

  return {
    ...authState,
    getGoogleAuthUrl,
    loginWithGoogle,
    logout,
    handleOAuthCallback
  }
} 