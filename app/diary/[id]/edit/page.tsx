'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { DiaryEntryForm } from '../../organisms/DiaryEntryForm'
import { DiaryEntryUpdate, DiaryEntry } from '../../atoms/types'
import { usePageTransition } from '../../atoms/usePageTransition'
import { useReplicacheDiary } from '../../atoms/ReplicacheDiaryContext'

export default function EditDiaryPage() {
  const params = useParams()
  const { navigateWithAnimation } = usePageTransition()
  const entryId = params.id as string
  const { moods, entries, rep } = useReplicacheDiary()

  const [entry, setEntry] = useState<DiaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!entryId || !isClient) return
    setLoading(true)
    setError(null)
    const found = entries.find(e => e.id === entryId)
    if (found) {
      setEntry(found)
      setLoading(false)
    } else {
      setError('Diary entry not found')
      setLoading(false)
    }
  }, [entryId, isClient, entries])

  const handleUpdate = async (id: string, updatedEntry: DiaryEntryUpdate) => {
    try {
      await rep.mutate.updateEntry({ id, ...updatedEntry })
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