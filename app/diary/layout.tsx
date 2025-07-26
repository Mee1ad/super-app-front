'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function DiaryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Don't apply slide animations to the main diary page and new diary page
  const isMainDiaryPage = pathname === '/diary'
  const isNewDiaryPage = pathname === '/diary/new'

  // Always scroll to top when diary layout loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="w-full scrollbar-hide">
      {isNewDiaryPage ? (
        // No animation for new diary page
        <div className="w-full">
          {children}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={
              isMainDiaryPage
                ? { opacity: 0 } 
                : { x: '100%' }
            }
            animate={
              isMainDiaryPage
                ? { opacity: 1 } 
                : { x: 0 }
            }
            exit={
              isMainDiaryPage
                ? { opacity: 0 } 
                : { x: '-100%' }
            }
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3
            }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
} 