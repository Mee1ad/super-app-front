import { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
  className?: string
}

export function AppLayout({ children, className = '' }: AppLayoutProps) {
  // If className disables container/max-w, don't add them
  const disableContainer = className.includes('!container') || className.includes('!max-w-none');
  const base = disableContainer
    ? `pt-20 pb-6 md:px-6 md:py-8 ${className}`
    : `container mx-auto px-4 pt-20 pb-6 md:px-6 md:py-8 max-w-6xl ${className}`;
  return (
    <div className={base}>
      {children}
    </div>
  )
} 