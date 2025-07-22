'use client'

import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { AddIdeaDialog } from './organisms/AddIdeaDialog'
import { IdeaCard } from './molecules/IdeaCard'
import { LoadingSpinner } from './atoms/LoadingSpinner'
import { useIdeasApi } from './atoms/useIdeasApi'
import { IdeaCreate, IdeaUpdate, Idea } from './atoms/types'
import { AppLayout } from '../shared/organisms/AppLayout'

export default function IdeasPage() {
  const [isClient, setIsClient] = useState(false)
  
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

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Debounced search effect - only run after client-side hydration
  useEffect(() => {
    if (!isClient) return
    
    const timeoutId = setTimeout(() => {
      loadIdeas({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, loadIdeas, isClient])

  const handleAddIdea = async (newIdea: IdeaCreate): Promise<Idea> => {
    const result = await createIdea(newIdea)
    if (result) {
      setIsAddDialogOpen(false)
      return result
    }
    throw new Error('Failed to create idea')
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

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || idea.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Daily Ideas</h1>
          <p className="text-sm md:text-base text-muted-foreground">Capture and organize your thoughts</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="flex items-center gap-2 w-full sm:w-auto"
          disabled={isCreating}
        >
          {isCreating ? (
            <LoadingSpinner size={16} />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Idea
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <LoadingSpinner />
                <span className="text-muted-foreground text-sm md:text-base">Loading ideas...</span>
              </div>
            </CardContent>
          </Card>
        ) : filteredIdeas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <p className="text-base md:text-lg font-medium mb-2">No ideas found</p>
                <p className="text-xs md:text-sm">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding your first idea'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredIdeas.map(idea => {
            const category = categories.find(c => c.id === idea.category_id)
            if (!category) return null
            
            return (
              <IdeaCard
                key={idea.id}
                idea={idea}
                category={category}
                onDelete={handleDeleteIdea}
                onUpdate={handleUpdateIdea}
                categories={categories}
              />
            )
          })
        )}
      </div>

      <AddIdeaDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddIdea}
        categories={categories}
        isLoading={isCreating}
      />
    </AppLayout>
  )
} 