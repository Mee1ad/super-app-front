'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DiaryEntryForm } from '../../organisms/DiaryEntryForm'
import { Mood, DiaryEntry, DiaryEntryUpdate } from '../../atoms/types'
import { diaryApi } from '../../atoms/api'

export default function EditDiaryPage() {
  const params = useParams()
  const router = useRouter()
  const entryId = params.id as string
  
  const [moods, setMoods] = useState<Mood[]>([])
  const [entry, setEntry] = useState<DiaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load moods and entry data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [moodsResponse, entryData] = await Promise.all([
          diaryApi.getMoods(),
          diaryApi.getDiaryEntry(entryId)
        ])
        setMoods(moodsResponse.moods)
        setEntry(entryData)
      } catch (error) {
        console.error('Failed to load data:', error)
        setError('Failed to load diary entry')
      } finally {
        setLoading(false)
      }
    }
    
    if (entryId) {
      loadData()
    }
  }, [entryId])

  const handleUpdate = async (id: string, updatedEntry: DiaryEntryUpdate) => {
    try {
      await diaryApi.updateDiaryEntry(id, updatedEntry)
      router.push('/diary')
    } catch (error) {
      console.error('Failed to update entry:', error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/diary')
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Diary entry not found'}</p>
          <button
            onClick={() => router.push('/diary')}
            className="text-primary hover:underline"
          >
            Back to Diary
          </button>
        </div>
      </div>
    )
  }

  return (
    <DiaryEntryForm
      mode="edit"
      entry={entry}
      moods={moods}
      onUpdate={handleUpdate}
      onCancel={handleCancel}
    />
  )
} 