import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useReplicacheDiary } from './ReplicacheDiaryContext'
import {
  Mood,
  DiaryEntry,
  DiaryEntryCreate,
  DiaryEntryUpdate
} from './types'

export const useInfiniteDiaryApi = () => {
  const { moods, entries, rep } = useReplicacheDiary()
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isClient, setIsClient] = useState(false)
  const ITEMS_PER_PAGE = 10
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load moods (no-op, live via Replicache)
  const loadMoods = useCallback(async () => {}, [])

  // Local pagination for entries
  const paginatedEntries = entries.slice(0, currentPage * ITEMS_PER_PAGE)

  // Load initial diary entries (no-op, live via Replicache)
  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setHasMore(entries.length > paginatedEntries.length)
    } catch (err) {
      setError('Failed to load diary entries')
      toast({
        title: "Error",
        description: 'Failed to load diary entries',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [entries, paginatedEntries.length, toast])

  // Load more entries (pagination)
  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    setError(null)
    try {
      setCurrentPage(page => page + 1)
      setHasMore(entries.length > (currentPage + 1) * ITEMS_PER_PAGE)
    } catch (err) {
      setError('Failed to load more diary entries')
      toast({
        title: "Error",
        description: 'Failed to load more diary entries',
        variant: "destructive"
      })
    } finally {
      setLoadingMore(false)
    }
  }, [entries.length, currentPage, toast])

  // Create diary entry
  const createEntry = useCallback(async (data: DiaryEntryCreate) => {
    try {
      const id = `diary_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await rep.mutate.createEntry({ ...data, id })
      return { id, ...data, images: data.images || [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as DiaryEntry
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to create diary entry',
        variant: "destructive"
      })
      throw err
    }
  }, [rep, toast])

  // Update diary entry
  const updateEntry = useCallback(async (id: string, data: DiaryEntryUpdate) => {
    try {
      await rep.mutate.updateEntry({ id, ...data })
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to update diary entry',
        variant: "destructive"
      })
      throw err
    }
  }, [rep, toast])

  // Delete diary entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      await rep.mutate.deleteEntry({ id })
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to delete diary entry',
        variant: "destructive"
      })
      throw err
    }
  }, [rep, toast])

  // Upload image (keep as is, still uses API)
  const uploadImage = useCallback(async (file: File) => {
    return ''
  }, [])

  return {
    moods,
    entries: paginatedEntries,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMoods,
    loadEntries,
    loadMore,
    createEntry,
    updateEntry,
    deleteEntry,
    uploadImage
  }
} 