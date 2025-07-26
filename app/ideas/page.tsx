'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IdeaCard } from './molecules/IdeaCard'
import { LoadingSpinner } from './atoms/LoadingSpinner'
import { useIdeasApi } from './atoms/useIdeasApi'
import { IdeaCreate, IdeaUpdate, Idea } from './atoms/types'
import { AppLayout } from '../shared/organisms/AppLayout'
import { ListPageLayout } from '../shared/organisms/ListPageLayout'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function IdeasPage() {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  
  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    ideas,
    categories,
    isLoading,
    isCreating,
    error,
    loadIdeas,
    createIdea,
    updateIdea,
    deleteIdea,
    clearError,
  } = useIdeasApi()

  const handleAddIdea = () => {
    router.push('/ideas/new')
  }

  const handleUpdateIdea = async (id: string, updatedIdea: IdeaUpdate): Promise<Idea> => {
    const result = await updateIdea(id, updatedIdea)
    if (result) {
      return result
    }
    throw new Error('Failed to update idea')
  }

  const handleDeleteIdea = async (id: string) => {
    return await deleteIdea(id)
  }

  if (!isClient || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AppLayout title="Daily Ideas">
      <ListPageLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-destructive text-sm md:text-base">{error}</p>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

              {/* Ideas List */}
      <div className="space-y-4 scrollbar-hide overflow-hidden">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <LoadingSpinner />
                  <span className="text-muted-foreground text-sm md:text-base">Loading ideas...</span>
                </div>
              </CardContent>
            </Card>
          ) : ideas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-muted-foreground text-center">
                  <p className="text-base md:text-lg font-medium mb-2">No ideas found</p>
                  <p className="text-xs md:text-sm">
                    Start by adding your first idea
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
                          <motion.div className="block md:hidden scrollbar-hide overflow-hidden">
              {/* Mobile: Full width list without cards */}
              <div className="space-y-0 scrollbar-hide overflow-hidden">
                  {ideas.map((idea, index) => {
                    const category = categories.find(c => c.id === idea.category_id)
                    if (!category) return null
                    
                    return (
                      <motion.div 
                        key={idea.id} 
                        className="border-b border-border last:border-b-0"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.6 + (index * 0.1),
                          type: "spring",
                          damping: 25,
                          stiffness: 300
                        }}
                      >
                        <IdeaCard
                          idea={idea}
                          category={category}
                          onUpdate={handleUpdateIdea}
                          categories={categories}
                        />
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
              
                              <motion.div className="hidden md:block scrollbar-hide overflow-hidden">
                  {/* Desktop: Card view */}
                {ideas.map((idea, index) => {
                  const category = categories.find(c => c.id === idea.category_id)
                  if (!category) return null
                  
                  return (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.6 + (index * 0.1),
                        type: "spring",
                        damping: 25,
                        stiffness: 300
                      }}
                    >
                      <IdeaCard
                        idea={idea}
                        category={category}
                        onUpdate={handleUpdateIdea}
                        categories={categories}
                      />
                    </motion.div>
                  )
                })}
              </motion.div>
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300,
            delay: 1.2
          }}
          onClick={handleAddIdea}
          disabled={isCreating}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center z-50"
        >
          {isCreating ? (
            <LoadingSpinner size={20} />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </motion.button>
      </ListPageLayout>
    </AppLayout>
  )
} 