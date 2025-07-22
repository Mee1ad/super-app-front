'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { AddDiaryDialog } from './organisms/AddDiaryDialog'
import { DiaryCard } from './molecules/DiaryCard'
import { useDiaryApi } from './atoms/useDiaryApi'
import { DiaryEntryCreate, DiaryEntryUpdate } from './atoms/types'
import { AppLayout } from '../shared/organisms/AppLayout'

export default function DiaryPage() {
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

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Load initial data
  useEffect(() => {
    loadMoods()
    loadEntries()
  }, [loadMoods, loadEntries])

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    loadEntries({
      search: value || undefined,
      mood: selectedMood !== 'all' ? selectedMood : undefined
    })
  }

  const handleMoodChange = (value: string) => {
    setSelectedMood(value)
    loadEntries({
      search: searchTerm || undefined,
      mood: value !== 'all' ? value : undefined
    })
  }

  const handleAddEntry = async (newEntry: DiaryEntryCreate) => {
    try {
      await createEntry(newEntry)
      setIsAddDialogOpen(false)
      // Reload entries to get updated list
      loadEntries({
        search: searchTerm || undefined,
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
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Diary</h1>
          <p className="text-muted-foreground">Capture your thoughts and feelings</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Entry
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Select value={selectedMood} onValueChange={handleMoodChange} disabled={loading}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            {moods.map(mood => (
              <SelectItem key={mood.id} value={mood.id}>
                {mood.emoji} {mood.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {loading && entries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading entries...</p>
            </CardContent>
          </Card>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <p className="text-lg font-medium mb-2">No entries found</p>
                <p className="text-sm">
                  {searchTerm || selectedMood !== 'all' 
                    ? 'Try adjusting your search or filters'
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
              <div className="text-center text-sm text-muted-foreground mt-4">
                Showing {entries.length} of {meta.total} entries
                {meta.pages > 1 && ` (Page ${meta.page} of ${meta.pages})`}
              </div>
            )}
          </>
        )}
      </div>

      <AddDiaryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddEntry}
        moods={moods}
        loading={loading}
      />
    </AppLayout>
  )
} 