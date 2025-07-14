'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import { Button } from './button'
import { useAuth } from '@/app/auth/atoms/useAuth'

interface DemoBannerProps {
  className?: string
}

export function DemoBanner({ className = '' }: DemoBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { isAuthenticated, loading: authLoading } = useAuth()

  // Don't render anything while auth is loading to prevent flash
  if (authLoading) {
    return null
  }

  // Don't show banner if user is authenticated
  if (isAuthenticated) {
    return null
  }

  // Don't show banner if user has dismissed it
  if (!isVisible) {
    return null
  }

  return (
    <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 relative ${className}`}>
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <span className="text-lg">🎯</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base">
              Welcome to the Demo!
            </h3>
            <p className="text-xs sm:text-sm opacity-90">
              You&apos;re viewing sample data. Sign in to save your own entries and access all features.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-blue-600"
            onClick={() => {
              // This will trigger the login flow
              const loginButton = document.querySelector('[data-login-button]') as HTMLButtonElement
              if (loginButton) {
                loginButton.click()
              }
            }}
          >
            Sign In
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white hover:text-blue-600 p-1"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 