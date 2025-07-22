import { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
  className?: string
}

export function AppLayout({ children, className = '' }: AppLayoutProps) {
  return (
    <div className={`container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-6xl ${className}`}>
      {children}
    </div>
  )
} 