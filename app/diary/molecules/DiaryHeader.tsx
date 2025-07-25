'use client'

import React from 'react'

interface DiaryHeaderProps {
  loading?: boolean
}

export function DiaryHeader({
}: DiaryHeaderProps) {
  return (
    <>
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border md:hidden">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Diary</h1>
              <p className="text-xs text-muted-foreground">Capture your thoughts and feelings</p>
            </div>
          </div>
        </div>
      </div>


    </>
  )
} 