import { useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useReplicacheDiary } from './ReplicacheDiaryContext'
import {
  Mood,
  DiaryEntry,
  DiaryEntryCreate,
  DiaryEntryUpdate
} from './types'

export const useDiaryApi = () => {
  const { entries, moods, mutateWithPoke } = useReplicacheDiary()
  const { toast } = useToast()

  // Load moods (no-op, live via Replicache)
  const loadMoods = useCallback(async () => {}, [])

  // Load entries (no-op, live via Replicache)
  const loadEntries = useCallback(async () => {}, [])

  // Create diary entry
  const createEntry = useCallback(async (data: DiaryEntryCreate) => {
    try {
      const id = `diary_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await mutateWithPoke('createEntry', { ...data, id })
      return { id, ...data, images: data.images || [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as DiaryEntry
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to create diary entry',
        variant: "destructive"
      })
      throw err
    }
  }, [mutateWithPoke, toast])

  // Update diary entry
  const updateEntry = useCallback(async (id: string, data: DiaryEntryUpdate) => {
    try {
      await mutateWithPoke('updateEntry', { id, ...data })
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to update diary entry',
        variant: "destructive"
      })
      throw err
    }
  }, [mutateWithPoke, toast])

  // Delete diary entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      await mutateWithPoke('deleteEntry', { id })
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to delete diary entry',
        variant: "destructive"
      })
      throw err
    }
  }, [mutateWithPoke, toast])

  // CRUD for moods
  const createMood = useCallback(async (mood: Mood) => {
    try {
      await mutateWithPoke('createMood', mood)
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to create mood',
        variant: "destructive"
      })
      throw err
    }
  }, [mutateWithPoke, toast])

  const updateMood = useCallback(async (mood: Mood) => {
    try {
      await mutateWithPoke('updateMood', mood)
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to update mood',
        variant: "destructive"
      })
      throw err
    }
  }, [mutateWithPoke, toast])

  const deleteMood = useCallback(async (id: string) => {
    try {
      await mutateWithPoke('deleteMood', { id })
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to delete mood',
        variant: "destructive"
      })
      throw err
    }
  }, [mutateWithPoke, toast])

  // Upload image (keep as is, still uses API)
  const uploadImage = useCallback(async (file: File) => {
    return ''
  }, [])

  return {
    moods,
    entries,
    loadMoods,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    createMood,
    updateMood,
    deleteMood,
    uploadImage
  }
} 