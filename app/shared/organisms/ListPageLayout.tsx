'use client'

import { ReactNode } from 'react'

interface ListPageLayoutProps {
  children: ReactNode
  className?: string
}

export function ListPageLayout({ children, className = "" }: ListPageLayoutProps) {
  return (
    <div className={`w-full scrollbar-hide overflow-hidden ${className}`}>
      <div className="w-full overflow-hidden">
        {children}
      </div>
    </div>
  )
} 