'use client'

import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation' // Using navigateWithAnimation instead
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

import { AddDiaryDialog } from './organisms/AddDiaryDialog'
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
          <motion.div 
            className="flex flex-col gap-4 py-4 overflow-x-hidden scrollbar-hide"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.5
            }}
          >
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <p className="text-destructive text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Entries List */}
            <div className="space-y-3">
              {loading && entries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-8 w-8 text-muted-foreground mb-4" />
                  </motion.div>
                  <p className="text-muted-foreground text-sm">Loading entries...</p>
                </motion.div>
              ) : entries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <div className="text-muted-foreground text-center">
                    <p className="text-base font-medium mb-2">No entries found</p>
                    <p className="text-xs">
                      {selectedMood !== 'all' 
                        ? 'Try adjusting your filters'
                        : 'Start by writing your first diary entry'
                      }
                    </p>
                  </div>
                </motion.div>
              ) : (
                <>
                  <AnimatePresence>
                    {entries.map((entry, index) => {
                      const mood = moods.find(m => m.id === entry.mood)
                      if (!mood) return null
                      
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 0.6 + (index * 0.1),
                            ease: "easeOut"
                          }}
                        >
                          <DiaryCard
                            entry={entry}
                            mood={mood}
                            moods={moods}
                            onDelete={handleDeleteEntry}
                            onUpdate={handleUpdateEntry}
                            loading={loading}
                          />
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  
                  {/* Infinite scroll observer */}
                  <div ref={observerRef} className="h-1" />
                  
                  {/* Loading more indicator */}
                  <AnimatePresence>
                    {loadingMore && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center py-4"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="h-6 w-6 text-muted-foreground" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* End of list indicator */}
                  {!hasMore && entries.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.5,
                        delay: 1.0 + (entries.length * 0.1)
                      }}
                      className="w-full flex justify-center text-base text-muted-foreground mt-1"
                    >
                      <span>That&apos;s all</span>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Floating Action Button */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 1.2
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => navigateWithAnimation('/diary/new')}
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-6 w-6" />
                </motion.div>
              ) : (
                <Plus className="h-6 w-6" />
              )}
            </Button>
          </motion.div>
        </AppLayout>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block overflow-x-hidden scrollbar-hide">
        <motion.div 
          className="container mx-auto pb-6 md:py-8"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300,
            duration: 0.5
          }}
        >
          <div className="mb-6 md:mb-8">
            <div>
              <p className="text-sm md:text-base text-muted-foreground">Capture your thoughts and feelings</p>
            </div>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-6 border-destructive">
                  <CardContent className="pt-6">
                    <p className="text-destructive text-sm md:text-base">{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entries List */}
          <div className="space-y-4 scrollbar-hide">
            {loading && entries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-8 w-8 text-muted-foreground mb-4" />
                    </motion.div>
                    <p className="text-muted-foreground text-sm md:text-base">Loading entries...</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : entries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-muted-foreground text-center">
                      <p className="text-base md:text-lg font-medium mb-2">No entries found</p>
                      <p className="text-xs md:text-sm">
                        {selectedMood !== 'all' 
                          ? 'Try adjusting your filters'
                          : 'Start by writing your first diary entry'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <>
                <AnimatePresence>
                  {entries.map((entry, index) => {
                    const mood = moods.find(m => m.id === entry.mood)
                    if (!mood) return null
                    
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.1,
                          ease: "easeOut"
                        }}
                      >
                        <DiaryCard
                          entry={entry}
                          mood={mood}
                          moods={moods}
                          onDelete={handleDeleteEntry}
                          onUpdate={handleUpdateEntry}
                          loading={loading}
                        />
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                
                {/* Infinite scroll observer */}
                <div ref={observerRef} className="h-4" />
                
                {/* Loading more indicator */}
                <AnimatePresence>
                  {loadingMore && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-center py-4"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-6 w-6 text-muted-foreground" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* End of list indicator */}
                {!hasMore && entries.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5,
                      delay: 1.0 + (entries.length * 0.1)
                    }}
                    className="w-full flex justify-center text-base md:text-lg text-muted-foreground mt-1"
                  >
                    <span>That&apos;s all</span>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
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