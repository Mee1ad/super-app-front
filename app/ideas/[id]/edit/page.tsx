'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { IdeaForm } from '../../organisms/IdeaForm'
import { useIdeasApi } from '../../atoms/useIdeasApi'
import { LoadingSpinner } from '../../atoms/LoadingSpinner'
// Idea import removed as it's not used

export default function EditIdeaPage() {
  const params = useParams()
  const router = useRouter()
  const { ideas, isLoading: apiLoading } = useIdeasApi()
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  
  const ideaId = params.id as string
  const idea = ideas.find(i => i.id === ideaId)

  // Track when data has initially loaded
  useEffect(() => {
    if (!apiLoading && ideas.length > 0) {
      setHasInitiallyLoaded(true)
    }
  }, [apiLoading, ideas.length])

  const handleCancel = () => {
    router.push('/ideas')
  }

  // Show loading spinner while API is loading OR before initial data load
  if (apiLoading || !hasInitiallyLoaded) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Show "not found" if idea doesn't exist after data has loaded
  if (!idea) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground mb-4">
            Idea not found
          </p>
          <button
            onClick={handleCancel}
            className="text-primary hover:underline"
          >
            Back to Ideas
          </button>
        </div>
      </div>
    )
  }

  // Render the edit form when idea is found
  return <IdeaForm mode="edit" idea={idea} onCancel={handleCancel} />
} 