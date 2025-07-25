'use client'

import { useState, useEffect } from 'react'
import { DiaryEntryForm } from '../organisms/DiaryEntryForm'
import { Mood } from '../atoms/types'
import { diaryApi } from '../atoms/api'

export default function NewDiaryPage() {
  const [moods, setMoods] = useState<Mood[]>([])

  // Load moods on component mount
  useEffect(() => {
    const loadMoods = async () => {
      try {
        const response = await diaryApi.getMoods()
        setMoods(response.moods)
      } catch (error) {
        console.error('Failed to load moods:', error)
      }
    }
    loadMoods()
  }, [])

  return (
    <DiaryEntryForm
      mode="create"
      moods={moods}
    />
  )
} 