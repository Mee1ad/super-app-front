'use client'

import { motion } from 'framer-motion'
import { ReactNode, useEffect } from 'react'

interface ListPageLayoutProps {
  children: ReactNode
  className?: string
}

export function ListPageLayout({ children, className = "" }: ListPageLayoutProps) {
  // Prevent scrolling during page load animation
  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    // Re-enable scrolling after animation completes
    const timer = setTimeout(() => {
      const y = parseInt(document.body.style.top || '0') * -1
      Object.assign(document.body.style, {
        overflow: '',
        position: '',
        top: '',
        width: ''
      })
      window.scrollTo(0, y)
    }, 800) // Slightly longer than animation duration

    return () => {
      clearTimeout(timer)
      const y = parseInt(document.body.style.top || '0') * -1
      Object.assign(document.body.style, {
        overflow: '',
        position: '',
        top: '',
        width: ''
      })
      window.scrollTo(0, y)
    }
  }, [])

  return (
    <div className={`w-full scrollbar-hide overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.6
        }}
        className="w-full overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  )
} 