'use client'

import { motion } from 'framer-motion'
import { DiaryEntryForm } from '../organisms/DiaryEntryForm'
import { useReplicacheDiary } from '../atoms/ReplicacheDiaryContext'

export default function NewDiaryPage() {
  const { moods } = useReplicacheDiary()

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