import { motion } from 'framer-motion'
import { ArrowDownRight } from 'lucide-react'

export function FabHint({ message = 'دیتایی وجود نداره، از اینجا اضافه کن' }: { message?: string }) {
  return (
    <div className="fixed bottom-24 right-8 z-[100] flex flex-col items-end select-none pointer-events-none">
      <motion.div
        initial={{ y: 0, rotate: 0 }}
        animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-2"
      >
        <ArrowDownRight className="w-12 h-12 text-primary drop-shadow-lg" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="bg-white/90 dark:bg-gray-900/90 rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 text-base font-medium"
      >
        {message}
      </motion.div>
    </div>
  )
} 