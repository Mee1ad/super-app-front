'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { DiaryEntryForm } from '../../organisms/DiaryEntryForm'
import { Mood, DiaryEntry, DiaryEntryUpdate } from '../../atoms/types'
import { diaryApi } from '../../atoms/api'
import { usePageTransition } from '../../atoms/usePageTransition'

export default function EditDiaryPage() {
  const params = useParams()
  // const router = useRouter() // Using navigateWithAnimation instead
  const { navigateWithAnimation } = usePageTransition()
  const entryId = params.id as string
  
  const [moods, setMoods] = useState<Mood[]>([])
  const [entry, setEntry] = useState<DiaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load moods and entry data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
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
    
    if (entryId && isClient) {
      loadData()
    }
  }, [entryId, isClient])

  const handleUpdate = async (id: string, updatedEntry: DiaryEntryUpdate) => {
    try {
      await diaryApi.updateDiaryEntry(id, updatedEntry)
      navigateWithAnimation('/diary')
    } catch (error) {
      console.error('Failed to update entry:', error)
      throw error
    }
  }

  const handleCancel = () => {
    navigateWithAnimation('/diary')
  }

  return (
    <>
      {loading ? (
        <motion.div 
          className="w-full min-h-screen flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.5,
              type: "spring",
              damping: 20,
              stiffness: 300
            }}
          >
            <motion.div 
              className="mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Loading...
            </motion.p>
          </motion.div>
        </motion.div>
      ) : error || !entry ? (
        <motion.div 
          className="w-full min-h-screen flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="text-center"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5,
              type: "spring",
              damping: 20,
              stiffness: 300
            }}
          >
            <motion.p 
              className="text-destructive mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {error || 'Diary entry not found'}
            </motion.p>
            <motion.button
              onClick={() => navigateWithAnimation('/diary')}
              className="text-primary hover:underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              Back to Diary
            </motion.button>
          </motion.div>
        </motion.div>
      ) : (
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
            mode="edit"
            entry={entry}
            moods={moods}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
          />
        </motion.div>
      )}
    </>
  )
} 