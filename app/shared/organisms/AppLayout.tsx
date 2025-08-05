'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useSidebar } from './SidebarContext'
import { Header } from './Header'

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
        customHeader ? (
          customHeader
        ) : (
          <Header 
            title={title || ''} 
            onMenuClick={mounted ? toggleMobileMenu : undefined}
          />
        )
      )}
      <div className={`${base} scrollbar-hide`}>
        {children}
      </div>
    </>
  )
} 