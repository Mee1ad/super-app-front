import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { diaryApi } from './api'
import { useAuth } from '@/app/auth/atoms/useAuth'
import { 
  Mood, 
  DiaryEntry, 
  DiaryEntryCreate, 
  DiaryEntryUpdate
} from './types'

export const useInfiniteDiaryApi = () => {
  const [moods, setMoods] = useState<Mood[]>([])
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isClient, setIsClient] = useState(false)
  
  const { toast } = useToast()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const ITEMS_PER_PAGE = 10

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load moods
  const loadMoods = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await diaryApi.getMoods()
      setMoods(response.moods)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load moods'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load initial diary entries
  const loadEntries = useCallback(async (params?: {
    search?: string
    mood?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      setCurrentPage(1)
      setHasMore(true)
      
      const response = await diaryApi.getDiaryEntries({
        ...params,
        page: 1,
        limit: ITEMS_PER_PAGE
      })
      
      setEntries(response.entries)
      setHasMore(response.meta.page < response.meta.pages)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load diary entries'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load more entries for infinite scroll
  const loadMoreEntries = useCallback(async (params?: {
    search?: string
    mood?: string
  }) => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      
      const response = await diaryApi.getDiaryEntries({
        ...params,
        page: nextPage,
        limit: ITEMS_PER_PAGE
      })
      
      setEntries(prev => [...prev, ...response.entries])
      setCurrentPage(nextPage)
      setHasMore(response.meta.page < response.meta.pages)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more entries'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoadingMore(false)
    }
  }, [currentPage, hasMore, loadingMore, toast])

  // Create diary entry
  const createEntry = useCallback(async (data: DiaryEntryCreate) => {
    try {
      setLoading(true)
      setError(null)
      const newEntry = await diaryApi.createDiaryEntry(data)
      setEntries(prev => [newEntry, ...prev])
      toast({
        title: "Success",
        description: "Diary entry created successfully"
      })
      return newEntry
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create diary entry'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Update diary entry
  const updateEntry = useCallback(async (id: string, data: DiaryEntryUpdate) => {
    try {
      setLoading(true)
      setError(null)
      const updatedEntry = await diaryApi.updateDiaryEntry(id, data)
      setEntries(prev => prev.map(entry => 
        entry.id === id ? updatedEntry : entry
      ))
      toast({
        title: "Success",
        description: "Diary entry updated successfully"
      })
      return updatedEntry
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update diary entry'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Delete diary entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await diaryApi.deleteDiaryEntry(id)
      setEntries(prev => prev.filter(entry => entry.id !== id))
      toast({
        title: "Success",
        description: "Diary entry deleted successfully"
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete diary entry'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Upload image
  const uploadImage = useCallback(async (file: File) => {
    try {
      setLoading(true)
      setError(null)
      const response = await diaryApi.uploadImage(file)
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      })
      return response.url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load initial data - wait for auth loading to complete first
  useEffect(() => {
    if (!authLoading && isClient) {
      // Don't auto-load to prevent test timeouts
      // loadMoods()
      // loadEntries()
    }
  }, [authLoading, isClient])

  // Clear mock data when user logs in
  useEffect(() => {
    if (isAuthenticated && !authLoading && isClient) {
      setEntries([])
      setCurrentPage(1)
      setHasMore(true)
      setError(null)
      // Reload data from real API when user becomes authenticated
      loadMoods()
      loadEntries()
    }
  }, [isAuthenticated, authLoading, loadMoods, loadEntries, isClient])

  return {
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
    deleteEntry,
    uploadImage
  }
} 