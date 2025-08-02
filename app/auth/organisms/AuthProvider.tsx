'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useAuth } from '../atoms/useAuth'
import { AuthState } from '../atoms/types'


interface AuthContextType extends AuthState {
  getGoogleAuthUrl: () => Promise<string>
  loginWithGoogle: (code: string) => Promise<import('../atoms/types').GoogleLoginResponse>
  logout: () => void
  handleOAuthCallback: (code: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  // Global handler for ?auth=... param in URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const url = new URL(window.location.href)
    const authParam = url.searchParams.get('auth')
    
    if (authParam) {
      try {
        console.log('🔐 Processing auth parameter from URL')
        const authData = JSON.parse(decodeURIComponent(authParam))
        const user = authData.user
        const tokens = authData.tokens
        
        // Store auth data
        localStorage.setItem('auth_access_token', tokens.access_token)
        localStorage.setItem('auth_refresh_token', tokens.refresh_token)
        localStorage.setItem('auth_user', JSON.stringify(user))
        
        console.log('✅ Auth data stored successfully')
        
        // Remove the auth param from the URL without reloading
        url.searchParams.delete('auth')
        window.history.replaceState({}, '', url.pathname + url.search)
        
        // Trigger auth state update by dispatching a custom event
        window.dispatchEvent(new CustomEvent('authDataUpdated', { 
          detail: { user, tokens } 
        }))
        
      } catch (error) {
        console.error('❌ Error processing auth parameter:', error)
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
} 