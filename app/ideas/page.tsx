'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { AddIdeaDialog } from './organisms/AddIdeaDialog'
import { IdeaCard } from './molecules/IdeaCard'
import { Idea, Category } from './atoms/types'

const categories: Category[] = [
  { id: 'project', name: 'Project', emoji: '🚀' },
  { id: 'article', name: 'Article', emoji: '📝' },
  { id: 'shopping', name: 'Shopping', emoji: '🛒' },
  { id: 'learning', name: 'Learning', emoji: '📚' },
  { id: 'personal', name: 'Personal', emoji: '💭' },
  { id: 'work', name: 'Work', emoji: '💼' },
]

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: '1',
      title: 'Build a habit tracker app',
      description: 'Simple app to track daily habits with streaks and analytics',
      category: 'project',
      tags: ['react', 'typescript', 'productivity'],
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Write about AI in education',
      description: 'Article exploring how AI can personalize learning experiences',
      category: 'article',
      tags: ['ai', 'education', 'writing'],
      createdAt: new Date('2024-01-14'),
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addIdea = (newIdea: Omit<Idea, 'id' | 'createdAt'>) => {
    const idea: Idea = {
      ...newIdea,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setIdeas(prev => [idea, ...prev])
    setIsAddDialogOpen(false)
  }

  const deleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id))
  }

  const updateIdea = (id: string, updatedIdea: Partial<Idea>) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, ...updatedIdea } : idea
    ))
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Daily Ideas</h1>
          <p className="text-muted-foreground">Capture and organize your thoughts</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
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

      {/* Ideas List */}
      <div className="space-y-4">
        {filteredIdeas.length === 0 ? (
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
          filteredIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              category={categories.find(c => c.id === idea.category)!}
              onDelete={deleteIdea}
              onUpdate={updateIdea}
            />
          ))
        )}
      </div>

      <AddIdeaDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={addIdea}
        categories={categories}
      />
    </div>
  )
} 