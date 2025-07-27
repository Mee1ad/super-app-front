'use client'

import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation' // Using navigateWithAnimation instead
import { Plus, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AddDiaryDialog } from './organisms/AddDiaryDialog'
import { DiarySkeleton } from './atoms/DiarySkeleton'
import { DiaryCard } from './molecules/DiaryCard'
import { useInfiniteDiaryApi } from './atoms/useInfiniteDiaryApi'
import { useInfiniteScroll } from './atoms/useInfiniteScroll'
import { usePageTransition } from './atoms/usePageTransition'
import { DiaryEntryCreate, DiaryEntryUpdate } from './atoms/types'
import { AppLayout } from '../shared/organisms/AppLayout'


export default function DiaryPage() {
  // const router = useRouter() // Using navigateWithAnimation instead
  const { navigateWithAnimation } = usePageTransition()
  const [isClient, setIsClient] = useState(false)
  
  // Handle client-side hydration and scroll to top
  useEffect(() => {
    setIsClient(true)
    // Always scroll to top when page loads/refreshes
    window.scrollTo(0, 0)
    
    // Additional scroll to top after a short delay to handle any late rendering
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 50)
    
    return () => clearTimeout(timer)
  }, [])

  const {
    moods,
    entries,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMoods,
    loadEntries,
    loadMoreEntries,
    createEntry,
    updateEntry,
    deleteEntry
  } = useInfiniteDiaryApi()

  // Infinite scroll setup
  const observerRef = useInfiniteScroll({
    onLoadMore: () => {
      loadMoreEntries({
        mood: selectedMood !== 'all' ? selectedMood : undefined
      })
    },
    hasMore,
    loading: loadingMore
  })

  const [selectedMood] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Show skeleton immediately when page loads, before any API calls
  const shouldShowSkeleton = !isClient || loading

  // Scroll to top when page becomes visible (for back navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        window.scrollTo(0, 0)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Load initial data - only after client-side hydration
  useEffect(() => {
    if (isClient) {
      loadMoods()
      loadEntries()
      // Ensure we're at the top after data loads
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 100)
    }
  }, [loadMoods, loadEntries, isClient])

  // Scroll to top when entries change (for fresh loads)
  useEffect(() => {
    if (entries.length > 0 && isClient) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 50)
    }
  }, [entries.length, isClient])

  const handleAddEntry = async (newEntry: DiaryEntryCreate) => {
    try {
      await createEntry(newEntry)
      setIsAddDialogOpen(false)
      // Reload entries to get updated list
      loadEntries({
        mood: selectedMood !== 'all' ? selectedMood : undefined
      })
    } catch {
      // Error is already handled in the hook
    }
  }

  const handleUpdateEntry = async (id: string, updatedEntry: DiaryEntryUpdate) => {
    try {
      await updateEntry(id, updatedEntry)
    } catch {
      // Error is already handled in the hook
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id)
    } catch {
      // Error is already handled in the hook
    }
  }

  return (
    <div className="w-full overflow-x-hidden scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
      {/* Mobile Native Layout */}
      <div className="min-h-screen bg-background md:hidden overflow-x-hidden scrollbar-hide">
        <AppLayout title="Diary">
          {/* Mobile Content */}
          <div className="flex flex-col gap-4 overflow-x-hidden scrollbar-hide">
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {/* Entries List */}
            <div className="space-y-3">
              {shouldShowSkeleton ? (
                <DiarySkeleton count={5} />
              ) : entries.length === 0 ? (
                <div className="w-full flex justify-center items-start mt-20 mb-4">
                  <span className="text-lg text-gray-500 font-medium">There is nothing here, lets add some data</span>
                </div>
              ) : (
                <>
                  {entries.map((entry) => {
                    const mood = moods.find(m => m.id === entry.mood)
                    if (!mood) return null
                    
                    return (
                      <div
                        key={entry.id}
                      >
                        <DiaryCard
                          entry={entry}
                          mood={mood}
                          moods={moods}
                          onDelete={handleDeleteEntry}
                          onUpdate={handleUpdateEntry}
                          loading={loading}
                        />
                      </div>
                    )
                  })}
                  
                  {/* Infinite scroll observer */}
                  <div ref={observerRef} className="h-1" />
                  
                  {/* Loading more indicator */}
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* End of list indicator */}
                  {!hasMore && entries.length > 0 && (
                    <div className="w-full flex justify-center text-base text-muted-foreground mt-1">
                      <span>That&apos;s all</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Floating Action Button */}
          <button
            onClick={() => {
              console.log('Diary FAB clicked - animation should be working');
              navigateWithAnimation('/diary/new');
            }}
            disabled={loading}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50"
            style={{ 
              position: 'fixed',
              zIndex: 50,
              transform: 'translateZ(0)' // Force hardware acceleration
            }}
          >
            {loading ? (
              <Loader2 className="h-6 w-6" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </button>
        </AppLayout>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block overflow-x-hidden scrollbar-hide">
        <AppLayout title="Diary">
          <div className="container mx-auto pb-6 md:py-8">
            <div className="mb-6 md:mb-8">
              <div>
                <p className="text-sm md:text-base text-muted-foreground">Capture your thoughts and feelings</p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Card className="mb-6 border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive text-sm md:text-base">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Entries List */}
            <div className="space-y-4 scrollbar-hide">
              {shouldShowSkeleton ? (
                <DiarySkeleton count={5} />
              ) : entries.length === 0 ? (
                null
              ) : (
                <>
                  {entries.map((entry) => {
                    const mood = moods.find(m => m.id === entry.mood)
                    if (!mood) return null
                    
                    return (
                      <div
                        key={entry.id}
                      >
                        <DiaryCard
                          entry={entry}
                          mood={mood}
                          moods={moods}
                          onDelete={handleDeleteEntry}
                          onUpdate={handleUpdateEntry}
                          loading={loading}
                        />
                      </div>
                    )
                  })}
                  
                  {/* Infinite scroll observer */}
                  <div ref={observerRef} className="h-4" />
                  
                  {/* Loading more indicator */}
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* End of list indicator */}
                  {!hasMore && entries.length > 0 && (
                    <div className="w-full flex justify-center text-base md:text-lg text-muted-foreground mt-1">
                      <span>That&apos;s all</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </AppLayout>
      </div>

      <AddDiaryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddEntry}
        moods={moods}
        loading={loading}
      />
    </div>
  )
} 