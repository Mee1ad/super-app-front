'use client'

import { X } from 'lucide-react'
import { useAuth } from '@/app/auth/atoms/useAuth'
import { usePersistentState } from '@/hooks/use-persistent-state'

interface DemoBannerProps {
  className?: string
}

const DEMO_BANNER_DISMISSED_KEY = 'demo-banner-dismissed'

export function DemoBanner({ className = '' }: DemoBannerProps) {
  const [isVisible, setIsVisible] = usePersistentState(DEMO_BANNER_DISMISSED_KEY, true)
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
    <div className={`bg-gray-50 border-b border-gray-200 text-gray-600 px-4 py-2 relative ${className}`}>
      <div className="md:ml-64">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <span className="text-sm font-medium">Demo Mode</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 