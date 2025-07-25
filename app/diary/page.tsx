'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { AddDiaryDialog } from './organisms/AddDiaryDialog'
import { DiaryCard } from './molecules/DiaryCard'
import { useDiaryApi } from './atoms/useDiaryApi'
import { DiaryEntryCreate, DiaryEntryUpdate } from './atoms/types'
import { AppLayout } from '../shared/organisms/AppLayout'

export default function DiaryPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  
  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    moods,
    entries,
    loading,
    error,
    meta,
    loadMoods,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry
  } = useDiaryApi()

  const [selectedMood] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Load initial data - only after client-side hydration
  useEffect(() => {
    if (isClient) {
      loadMoods()
      loadEntries()
    }
  }, [loadMoods, loadEntries, isClient])



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
    <div className="w-full overflow-x-hidden">
      {/* Mobile Native Layout */}
      <div className="min-h-screen bg-background md:hidden overflow-x-hidden">
                        <AppLayout title="Diary">
          {/* Mobile Content */}
          <div className="flex flex-col gap-4 px-4 py-4 overflow-x-hidden">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Entries List */}
          <div className="space-y-3">
            {loading && entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm">Loading entries...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-muted-foreground text-center">
                  <p className="text-base font-medium mb-2">No entries found</p>
                  <p className="text-xs">
                    {selectedMood !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Start by writing your first diary entry'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                {entries.map(entry => {
                  const mood = moods.find(m => m.id === entry.mood)
                  if (!mood) return null
                  
                  return (
                    <DiaryCard
                      key={entry.id}
                      entry={entry}
                      mood={mood}
                      moods={moods}
                      onDelete={handleDeleteEntry}
                      onUpdate={handleUpdateEntry}
                      loading={loading}
                    />
                  )
                })}
                
                {/* Pagination info */}
                {meta && (
                  <div className="text-center text-xs text-muted-foreground mt-6 pb-20">
                    Showing {entries.length} of {meta.total} entries
                    {meta.pages > 1 && ` (Page ${meta.page} of ${meta.pages})`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => router.push('/diary/new')}
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </Button>
        </div>
        </AppLayout>
      </div>

            {/* Desktop Layout */}
      <div className="hidden md:block overflow-x-hidden">
        <div className="container mx-auto px-4 pb-6 md:px-6 md:py-8 max-w-6xl">
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
          <div className="space-y-4">
            {loading && entries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm md:text-base">Loading entries...</p>
                </CardContent>
              </Card>
            ) : entries.length === 0 ? (
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
            ) : (
              <>
                {entries.map(entry => {
                  const mood = moods.find(m => m.id === entry.mood)
                  if (!mood) return null
                  
                  return (
                    <DiaryCard
                      key={entry.id}
                      entry={entry}
                      mood={mood}
                      moods={moods}
                      onDelete={handleDeleteEntry}
                      onUpdate={handleUpdateEntry}
                      loading={loading}
                    />
                  )
                })}
                
                {/* Pagination info */}
                {meta && (
                  <div className="text-center text-xs md:text-sm text-muted-foreground mt-4">
                    Showing {entries.length} of {meta.total} entries
                    {meta.pages > 1 && ` (Page ${meta.page} of ${meta.pages})`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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