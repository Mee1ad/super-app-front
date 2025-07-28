'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { useFoodTrackerApi } from './atoms/useFoodTrackerApi'
import { FoodEntry, FoodEntryCreate, FoodEntryUpdate, FoodEntriesFilters } from './atoms/types'
import { AppLayout } from '../shared/organisms/AppLayout'
import { ListPageLayout } from '../shared/organisms/ListPageLayout'
import { FoodEntryCard } from './molecules/FoodEntryCard'
import { AddFoodEntryForm } from './molecules/AddFoodEntryForm'
import { Button } from '@/components/ui/button'
import { FoodTrackerSkeleton } from './atoms/FoodTrackerSkeleton'

export default function FoodTrackerPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [filters] = useState<FoodEntriesFilters>({})
  const [isClient, setIsClient] = useState(false)

  const { getFoodEntries, createFoodEntry, updateFoodEntry, deleteFoodEntry, loading: apiLoading } = useFoodTrackerApi()

  // Show skeleton immediately when page loads, before any API calls
  const shouldShowSkeleton = !isClient || loading || apiLoading

  // Handle client-side hydration and scroll to top
  useEffect(() => {
    setIsClient(true)
    // Force scroll to top immediately
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    
    // Additional scroll to top after a short delay to handle any late rendering
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Scroll to top when page becomes visible (for back navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Control body/html overflow to prevent scrollbar in empty state
  useEffect(() => {
    if (!isClient) return

    const groupedEntries = groupEntriesByDate(entries)
    const isEmpty = !loading && !error && groupedEntries.length === 0

    if (isEmpty) {
      // Prevent scrollbar in empty state
      document.documentElement.style.overflowY = 'hidden'
      document.body.style.overflowY = 'hidden'
    } else {
      // Restore normal scroll behavior when there's data
      document.documentElement.style.overflowY = ''
      document.body.style.overflowY = ''
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.overflowY = ''
      document.body.style.overflowY = ''
    }
  }, [entries, loading, error, isClient])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getFoodEntries(filters)
      if (result) {
        setEntries(result.entries)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load food entries')
    } finally {
      setLoading(false)
    }
  }, [filters, getFoodEntries])

  // Load data on mount and when filters change
  useEffect(() => {
    if (isClient) {
      loadData()
    }
  }, [filters, isClient, loadData])

  // Scroll to top when entries change (for fresh loads)
  useEffect(() => {
    if (entries.length > 0 && isClient) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }, 50)
    }
  }, [entries, isClient])

  const handleAddEntry = async (data: FoodEntryCreate) => {
    try {
      const newEntry = await createFoodEntry(data)
      if (newEntry) {
        setEntries(prev => [newEntry, ...prev])
      }
    } catch (err) {
      console.error('Failed to create food entry:', err)
    }
  }

  const handleEditEntry = async (id: string, data: FoodEntryUpdate) => {
    try {
      const updatedEntry = await updateFoodEntry(id, data)
      if (updatedEntry) {
        setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry))
        setEditingEntry(null)
      }
    } catch (err) {
      console.error('Failed to update food entry:', err)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteFoodEntry(id)
      setEntries(prev => prev.filter(entry => entry.id !== id))
    } catch (err) {
      console.error('Failed to delete food entry:', err)
    }
  }

  const handleEdit = (entry: FoodEntry) => {
    setEditingEntry(entry)
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
  }

  const groupEntriesByDate = (entries: FoodEntry[]) => {
    const groups: { [key: string]: FoodEntry[] } = {}
    
    entries.forEach(entry => {
      const date = new Date(entry.created_at)
      const dateKey = date.toISOString().split('T')[0]
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(entry)
    })
    
    return Object.entries(groups)
      .map(([date, entries]) => ({ date, entries }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  if (!isClient) {
    return null
  }

  const groupedEntries = groupEntriesByDate(entries)
  const isEmpty = !loading && !error && groupedEntries.length === 0

  return (
    <AppLayout title="Food Tracker" className="!container !max-w-none min-h-screen">
      <ListPageLayout>
        <div className={isEmpty ? "relative h-[calc(100vh-56px)] bg-white" : "min-h-screen bg-white"}>
          {/* Mobile Layout */}
          <div className="block md:hidden">
            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={loadData} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : shouldShowSkeleton ? (
              <FoodTrackerSkeleton count={5} />
            ) : isEmpty ? (
              <div className="w-full flex justify-center items-start mt-20 mb-4">
                <span className="text-lg text-gray-500 font-medium">There is nothing here, lets add some data</span>
              </div>
            ) : (
              <div className="px-4 pb-20">
                <div className="space-y-6">
                  {groupedEntries.map((group) => (
                    <div
                      key={group.date}
                      className="space-y-3"
                    >
                      {/* Day Header */}
                      <div className="flex items-center space-x-3 py-2">
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatDateDisplay(group.date)}
                          </h2>
                        </div>
                      </div>
                      {/* Entries for this day */}
                      <div className="space-y-3">
                        {group.entries.map((entry) => (
                          <div
                            key={entry.id}
                          >
                            <FoodEntryCard
                              entry={entry}
                              onEdit={() => handleEdit(entry)}
                              onDelete={() => handleDeleteEntry(entry.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="max-w-4xl mx-auto px-6 py-8">

            {shouldShowSkeleton ? (
              <FoodTrackerSkeleton count={5} />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={loadData} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : isEmpty ? (
              <div className="w-full flex justify-center items-start mt-20 mb-4">
                <span className="text-lg text-gray-500 font-medium">There is nothing here, lets add some data</span>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedEntries.map((group) => (
                  <div
                    key={group.date}
                    className="space-y-4"
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between py-3">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatDateDisplay(group.date)}
                      </h2>
                    </div>

                    {/* Entries for this day */}
                    <div className="grid gap-4">
                      {group.entries.map((entry) => (
                        <div
                          key={entry.id}
                        >
                          <FoodEntryCard
                            entry={entry}
                            onEdit={() => handleEdit(entry)}
                            onDelete={() => handleDeleteEntry(entry.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          

        </div>

        {/* Add/Edit Form */}
        <AddFoodEntryForm
          onCreate={handleAddEntry}
          onUpdate={handleEditEntry}
          editEntry={editingEntry}
          loading={apiLoading}
          onCancel={handleCancelEdit}
        />
        </div>
      </ListPageLayout>
    </AppLayout>
  )
} 