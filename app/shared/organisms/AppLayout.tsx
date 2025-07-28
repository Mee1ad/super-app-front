'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useSidebar } from './SidebarContext'

interface AppLayoutProps {
  children: ReactNode
  className?: string
  title?: string
  customHeader?: ReactNode
}

export function AppLayout({ children, className = '', title, customHeader }: AppLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const { toggleMobileMenu } = useSidebar();
  
  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // If className disables container/max-w, don't add them
  const disableContainer = className.includes('!container') || className.includes('!max-w-none');
  const base = disableContainer
    ? `pb-6 md:px-6 md:py-8 ${className}`
    : `container mx-auto px-4 pb-6 md:px-6 md:py-8 max-w-6xl ${className}`;
  
  return (
    <>
      {(title || customHeader) && (
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          {customHeader ? (
            customHeader
          ) : (
            <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={mounted ? toggleMobileMenu : undefined}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Open menu"
                  type="button"
                  disabled={!mounted}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h1>
              </div>
            </div>
          )}
        </div>
      )}
      <div className={`${base} scrollbar-hide`}>
        {children}
      </div>
    </>
  )
} 