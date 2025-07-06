'use client'

import React, { useState, useEffect } from 'react'
import { ChangelogDialog } from '@/components/ui/changelog-dialog'
import { useChangelog } from '@/hooks/useChangelog'

export function ChangelogProvider({ children }: { children: React.ReactNode }) {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false)
  const { hasUpdates, isChecking } = useChangelog()

  useEffect(() => {
    // Show changelog automatically if there are updates and we're done checking
    if (hasUpdates && !isChecking) {
      setIsChangelogOpen(true)
    }
  }, [hasUpdates, isChecking])

  return (
    <>
      {children}
      <ChangelogDialog 
        isOpen={isChangelogOpen} 
        onClose={() => setIsChangelogOpen(false)} 
      />
    </>
  )
} 