import { ReactNode } from 'react'
import { Header } from './Header'
import { useSidebar } from './SidebarContext'

interface AppLayoutProps {
  children: ReactNode
  className?: string
  title?: string
}

export function AppLayout({ children, className = '', title }: AppLayoutProps) {
  const { toggleMobileMenu } = useSidebar();
  
  // If className disables container/max-w, don't add them
  const disableContainer = className.includes('!container') || className.includes('!max-w-none');
  const base = disableContainer
    ? `pb-6 md:px-6 md:py-8 ${className}`
    : `container mx-auto px-4 pb-6 md:px-6 md:py-8 max-w-6xl ${className}`;
  
  return (
    <>
      {title && <Header title={title} onMenuClick={toggleMobileMenu} />}
      <div className={`${base} scrollbar-hide`}>
        {children}
      </div>
    </>
  )
} 