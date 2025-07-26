'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import { useFoodTrackerApi } from './atoms/useFoodTrackerApi'
import { FoodEntry, FoodEntryCreate, FoodEntryUpdate, FoodEntriesFilters } from './atoms/types'
import { AppLayout } from '../shared/organisms/AppLayout'
import { ListPageLayout } from '../shared/organisms/ListPageLayout'
import { FoodEntryCard } from './molecules/FoodEntryCard'
import { AddFoodEntryForm } from './molecules/AddFoodEntryForm'
import { Button } from '@/components/ui/button'

export default function FoodTrackerPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [filters] = useState<FoodEntriesFilters>({})
  const [isClient, setIsClient] = useState(false)

  const { getFoodEntries, createFoodEntry, updateFoodEntry, deleteFoodEntry, loading: apiLoading } = useFoodTrackerApi()

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

  const loadData = async () => {
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
  }

  // Load data on mount and when filters change
  useEffect(() => {
    if (isClient) {
      loadData()
    }
  }, [filters, isClient])

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
      setError(err instanceof Error ? err.message : 'Failed to add food entry')
    }
  }

  const handleEditEntry = async (id: string, data: FoodEntryUpdate) => {
    try {
      const updatedEntry = await updateFoodEntry(id, data)
      if (updatedEntry) {
        setEntries(prev => prev.map(entry => 
          entry.id === id ? updatedEntry : entry
        ))
        setEditingEntry(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update food entry')
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      const success = await deleteFoodEntry(id)
      if (success) {
        setEntries(prev => prev.filter(entry => entry.id !== id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete food entry')
    }
  }

  const handleEdit = (entry: FoodEntry) => {
    setEditingEntry(entry)
  }



  // Group entries by date
  const groupEntriesByDate = (entries: FoodEntry[]) => {
    const groups: { [key: string]: FoodEntry[] } = {}
    
    entries.forEach(entry => {
      const dateKey = new Date(entry.date).toISOString().split('T')[0]
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(entry)
    })
    
    // Sort dates and entries within each date
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Most recent first
      .map(date => ({
        date,
        entries: groups[date].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first within day
      }))
  }

  const groupedEntries = groupEntriesByDate(entries)

  // Format date for display
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

  return (
    <AppLayout title="Food Tracker" className="!container !max-w-none min-h-screen">
      <ListPageLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Mobile Layout */}
          <div className="block md:hidden">

          {/* Content */}
          <div className="px-4 pb-20">
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
            ) : groupedEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No food entries yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Start tracking your meals and expenses
                </p>

              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {groupedEntries.map((group, groupIndex) => (
                    <motion.div
                      key={group.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: groupIndex * 0.1,
                        ease: "easeOut"
                      }}
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
                        <AnimatePresence>
                          {group.entries.map((entry, entryIndex) => (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ 
                                duration: 0.2, 
                                delay: entryIndex * 0.05,
                                ease: "easeOut"
                              }}
                            >
                              <FoodEntryCard
                                entry={entry}
                                onEdit={() => handleEdit(entry)}
                                onDelete={() => handleDeleteEntry(entry.id)}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>


        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="max-w-4xl mx-auto px-6 py-8">

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
            ) : groupedEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  No food entries yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Start tracking your meals and expenses to see your food history and spending patterns
                </p>

              </div>
            ) : (
              <div className="space-y-8">
                <AnimatePresence>
                  {groupedEntries.map((group, groupIndex) => (
                    <motion.div
                      key={group.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: groupIndex * 0.1,
                        ease: "easeOut"
                      }}
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
                        <AnimatePresence>
                          {group.entries.map((entry, entryIndex) => (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ 
                                duration: 0.2, 
                                delay: entryIndex * 0.05,
                                ease: "easeOut"
                              }}
                            >
                              <FoodEntryCard
                                entry={entry}
                                onEdit={() => handleEdit(entry)}
                                onDelete={() => handleDeleteEntry(entry.id)}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
        />
        </div>
      </ListPageLayout>
    </AppLayout>
  )
} 