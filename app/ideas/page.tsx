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
import { IdeaCreate, IdeaUpdate } from './atoms/types'

export default function IdeasPage() {
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

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadIdeas({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, loadIdeas])

  const handleAddIdea = async (newIdea: IdeaCreate) => {
    const result = await createIdea(newIdea)
    if (result) {
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateIdea = async (id: string, updatedIdea: IdeaUpdate) => {
    await updateIdea(id, updatedIdea)
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Daily Ideas</h1>
          <p className="text-muted-foreground">Capture and organize your thoughts</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="flex items-center gap-2"
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
      <div className="flex gap-4 mb-6">
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
          <SelectTrigger className="w-48">
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
              <p className="text-destructive">{error}</p>
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
                <span className="text-muted-foreground">Loading ideas...</span>
              </div>
            </CardContent>
          </Card>
        ) : filteredIdeas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <p className="text-lg font-medium mb-2">No ideas found</p>
                <p className="text-sm">
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
    </div>
  )
} 