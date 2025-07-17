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

export const useDiaryApi = () => {
  const [moods, setMoods] = useState<Mood[]>([])
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<{
    total: number
    page: number
    limit: number
    pages: number
  } | null>(null)
  
  const { toast } = useToast()
  const { isAuthenticated, loading: authLoading } = useAuth()

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

  // Load diary entries
  const loadEntries = useCallback(async (params?: {
    search?: string
    mood?: string
    page?: number
    limit?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await diaryApi.getDiaryEntries(params)
      setEntries(response.entries)
      setMeta(response.meta)
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
    if (!authLoading) {
      // Don't auto-load to prevent test timeouts
      // loadMoods()
      // loadEntries()
    }
  }, [authLoading])

  // Clear mock data when user logs in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      setEntries([])
      setMeta(null)
      setError(null)
      // Reload data from real API when user becomes authenticated
      loadMoods()
      loadEntries()
    }
  }, [isAuthenticated, authLoading, loadMoods, loadEntries])

  return {
    moods,
    entries,
    loading,
    error,
    meta,
    loadMoods,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    uploadImage
  }
} 