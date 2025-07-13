'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { AddDiaryDialog } from './organisms/AddDiaryDialog'
import { DiaryCard } from './molecules/DiaryCard'
import { DiaryEntry, Mood } from './atoms/types'

const moods: Mood[] = [
  { id: 'happy', name: 'Happy', emoji: '😊', color: 'text-yellow-500' },
  { id: 'excited', name: 'Excited', emoji: '🤩', color: 'text-orange-500' },
  { id: 'calm', name: 'Calm', emoji: '😌', color: 'text-blue-500' },
  { id: 'sad', name: 'Sad', emoji: '😔', color: 'text-gray-500' },
  { id: 'angry', name: 'Angry', emoji: '😠', color: 'text-red-500' },
  { id: 'neutral', name: 'Neutral', emoji: '😐', color: 'text-gray-400' },
]

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([
    {
      id: '1',
      title: 'A wonderful day at the park',
      content: 'Spent the afternoon walking in the park with friends. The weather was perfect and we had a great picnic. Really needed this break from work.',
      mood: 'happy',
      date: new Date('2024-01-15'),
      images: [],
    },
    {
      id: '2',
      title: 'Productive coding session',
      content: 'Finally finished that complex feature I was working on. The satisfaction of solving a difficult problem is unmatched. Ready for the next challenge!',
      mood: 'excited',
      date: new Date('2024-01-14'),
      images: [],
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood
    return matchesSearch && matchesMood
  })

  const addEntry = (newEntry: Omit<DiaryEntry, 'id' | 'date'>) => {
    const entry: DiaryEntry = {
      ...newEntry,
      id: Date.now().toString(),
      date: new Date(),
    }
    setEntries(prev => [entry, ...prev])
    setIsAddDialogOpen(false)
  }

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const updateEntry = (id: string, updatedEntry: Partial<DiaryEntry>) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    ))
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Diary</h1>
          <p className="text-muted-foreground">Capture your thoughts and feelings</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            {moods.map(mood => (
              <SelectItem key={mood.id} value={mood.id}>
                {mood.emoji} {mood.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <p className="text-lg font-medium mb-2">No entries found</p>
                <p className="text-sm">
                  {searchTerm || selectedMood !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start by writing your first diary entry'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map(entry => (
            <DiaryCard
              key={entry.id}
              entry={entry}
              mood={moods.find(m => m.id === entry.mood)!}
              onDelete={deleteEntry}
              onUpdate={updateEntry}
            />
          ))
        )}
      </div>

      <AddDiaryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={addEntry}
        moods={moods}
      />
    </div>
  )
} 