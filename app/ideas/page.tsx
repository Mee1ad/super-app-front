'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IdeaCard } from './molecules/IdeaCard'
import { LoadingSpinner } from './atoms/LoadingSpinner'
import { useIdeasApi } from './atoms/useIdeasApi'

import { AppLayout } from '../shared/organisms/AppLayout'
import { ListPageLayout } from '../shared/organisms/ListPageLayout'
import { useRouter } from 'next/navigation'
import { Idea } from './atoms/types'
import { IdeasSkeleton } from './atoms/IdeasSkeleton'


export default function IdeasPage() {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  
  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    ideas,
    isLoading,
    isCreating,
    error,
    clearError,
    deleteIdea,
  } = useIdeasApi()

  // Show skeleton immediately when page loads, before any API calls
  const shouldShowSkeleton = !isClient || isLoading

  const handleAddIdea = () => {
    router.push('/ideas/new')
  }

  const handleEditIdea = (idea: Idea) => {
    router.push(`/ideas/${idea.id}/edit`)
  }

  const handleDeleteIdea = async (id: string) => {
    try {
      await deleteIdea(id)
    } catch (err) {
      console.error('Failed to delete idea:', err)
    }
  }

  return (
    <AppLayout title="Daily Ideas">
      <ListPageLayout>
        {shouldShowSkeleton ? (
          <IdeasSkeleton count={5} />
        ) : (
          <>
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
              {ideas.length === 0 ? (
                <div className="w-full flex justify-center mt-20 mb-4">
                  <span className="text-lg text-gray-500 font-medium">There is nothing here, lets add some data</span>
                </div>
              ) : (
                <>
                  <div className="block md:hidden scrollbar-hide overflow-hidden">
                    {/* Mobile: Full width list without cards */}
                    <div className="space-y-0 scrollbar-hide overflow-hidden">
                      {ideas.map((idea) => (
                        <div 
                          key={idea.id} 
                          className="border-b border-border last:border-b-0"
                        >
                          <IdeaCard
                            idea={idea}
                            onEdit={handleEditIdea}
                            onDelete={handleDeleteIdea}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="hidden md:block scrollbar-hide overflow-hidden">
                    {/* Desktop: Card view */}
                    {ideas.map((idea) => (
                      <div
                        key={idea.id}
                      >
                        <IdeaCard
                          idea={idea}
                          onEdit={handleEditIdea}
                          onDelete={handleDeleteIdea}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Floating Action Button */}
            <button
              onClick={handleAddIdea}
              disabled={isCreating}
              className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center z-50"
            >
              {isCreating ? (
                <LoadingSpinner size={20} />
              ) : (
                <Plus className="h-6 w-6" />
              )}
            </button>
          </>
        )}
      </ListPageLayout>
    </AppLayout>
  )
} 