import { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
  className?: string
}

export function AppLayout({ children, className = '' }: AppLayoutProps) {
  return (
    <div className={`container mx-auto px-6 py-8 max-w-6xl ${className}`}>
      {children}
    </div>
  )
} 