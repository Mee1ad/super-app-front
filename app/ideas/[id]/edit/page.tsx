'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { IdeaForm } from '../../organisms/IdeaForm'
import { useIdeasApi } from '../../atoms/useIdeasApi'
import { LoadingSpinner } from '../../atoms/LoadingSpinner'

export default function EditIdeaPage() {
  const params = useParams()
  const { ideas, loadIdeas } = useIdeasApi()
  const [isLoading, setIsLoading] = useState(true)
  
  const ideaId = params.id as string
  const idea = ideas.find(i => i.id === ideaId)

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadIdeas()
      } catch (error) {
        console.error('Failed to load ideas:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [loadIdeas])

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">Idea not found</p>
        </div>
      </div>
    )
  }

  return <IdeaForm mode="edit" idea={idea} />
} 