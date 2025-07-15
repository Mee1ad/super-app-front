'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../atoms/useAuth'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function OAuthCallback() {
  const { handleOAuthCallback, error } = useAuth()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [processingError, setProcessingError] = useState<string | null>(null)

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for auth data in URL query parameters
        const authParam = searchParams.get('auth')
        
        if (authParam) {
          try {
            const authData = JSON.parse(decodeURIComponent(authParam))
            
            // Extract user and token information
            const user = authData.user
            const tokens = authData.tokens
            
            // Store the authentication data using the correct keys
            localStorage.setItem('access_token', tokens.access_token)
            localStorage.setItem('refresh_token', tokens.refresh_token)
            localStorage.setItem('user', JSON.stringify(user))
            
            // Redirect to home page
            window.location.href = '/'
            return
          } catch {
            setProcessingError('Invalid auth data format')
            setIsProcessing(false)
            return
          }
        }

        // Fallback to original OAuth code flow
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        
        if (error) {
          setProcessingError(`OAuth error: ${error}`)
          setIsProcessing(false)
          return
        }

        if (!code) {
          setProcessingError('No authorization code received')
          setIsProcessing(false)
          return
        }

        await handleOAuthCallback(code)
        // Success - component will unmount due to redirect
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to process OAuth callback'
        setProcessingError(message)
        setIsProcessing(false)
      }
    }

    processCallback()
  }, [searchParams, handleOAuthCallback])

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Completing Sign In
            </CardTitle>
            <CardDescription className="text-gray-600">
              Please wait while we complete your authentication...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (processingError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Authentication Failed
            </CardTitle>
            <CardDescription className="text-gray-600">
              {processingError || error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <button
              onClick={() => window.location.href = '/login'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
} 