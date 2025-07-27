'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { IdeaForm } from '../../organisms/IdeaForm'
import { useIdeasApi } from '../../atoms/useIdeasApi'
import { LoadingSpinner } from '../../atoms/LoadingSpinner'
import { Idea } from '../../atoms/types'

export default function EditIdeaPage() {
  const params = useParams()
  const router = useRouter()
  const { ideas, loadIdeas } = useIdeasApi()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const ideaId = params.id as string
  const idea = ideas.find(i => i.id === ideaId)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        await loadIdeas()
      } catch (error) {
        console.error('❌ Failed to load ideas:', error)
        setError('Failed to load idea')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (ideaId) {
      loadData()
    }
  }, [ideaId, loadIdeas])

  const handleCancel = () => {
    router.push('/ideas')
  }

  return (
    <>
      {isLoading ? (
        <div className="w-full min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : error || !idea ? (
        <div className="w-full min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground mb-4">
              {error || 'Idea not found'}
            </p>
            <button
              onClick={handleCancel}
              className="text-primary hover:underline"
            >
              Back to Ideas
            </button>
          </div>
        </div>
      ) : (
        <IdeaForm mode="edit" idea={idea} onCancel={handleCancel} />
      )}
    </>
  )
} 