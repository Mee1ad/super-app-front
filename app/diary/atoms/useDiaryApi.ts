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
  const { entries, moods, rep } = useReplicacheDiary()
  const { toast } = useToast()

  // Load moods (no-op, live via Replicache)
  const loadMoods = useCallback(async () => {}, [])

  // Load entries (no-op, live via Replicache)
  const loadEntries = useCallback(async () => {}, [])

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

  // CRUD for moods
  const createMood = useCallback(async (mood: Mood) => {
    try {
      await rep.mutate.createMood(mood)
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to create mood',
        variant: "destructive"
      })
      throw err
    }
  }, [rep, toast])

  const updateMood = useCallback(async (mood: Mood) => {
    try {
      await rep.mutate.updateMood(mood)
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to update mood',
        variant: "destructive"
      })
      throw err
    }
  }, [rep, toast])

  const deleteMood = useCallback(async (id: string) => {
    try {
      await rep.mutate.deleteMood({ id })
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to delete mood',
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