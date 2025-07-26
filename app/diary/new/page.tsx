'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    <motion.div 
      className="w-full min-h-screen bg-background scrollbar-hide"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ 
        duration: 0.4,
        type: "spring",
        damping: 25,
        stiffness: 300
      }}
    >
      <DiaryEntryForm
        mode="create"
        moods={moods}
      />
    </motion.div>
  )
} 