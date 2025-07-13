'use client'

import { useState } from 'react'
import { Plus, Search, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddFoodDialog } from './organisms/AddFoodDialog'
import { MealPlanView } from './organisms/MealPlanView'
import { FoodHistoryView } from './organisms/FoodHistoryView'
import { CalendarView } from './organisms/CalendarView'
import { FoodEntry, MealType } from './atoms/types'

const mealTypes: MealType[] = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🍳', time: '08:00' },
  { id: 'lunch', name: 'Lunch', emoji: '🍕', time: '12:00' },
  { id: 'dinner', name: 'Dinner', emoji: '🍽️', time: '18:00' },
  { id: 'snack', name: 'Snack', emoji: '☕', time: '15:00' },
]

export default function FoodPlannerPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([
    {
      id: '1',
      name: 'Oatmeal with berries',
      category: 'planned',
      mealType: 'breakfast',
      time: '08:00',
      date: new Date('2024-01-15'),
      comment: 'Healthy start to the day',
    },
    {
      id: '2',
      name: 'Grilled chicken salad',
      category: 'eaten',
      mealType: 'lunch',
      time: '12:30',
      date: new Date('2024-01-15'),
      comment: 'Felt great after this meal',
      followedPlan: true,
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory
    const matchesDate = selectedDate === 'all' || 
                       entry.date.toDateString() === new Date(selectedDate).toDateString()
    return matchesSearch && matchesCategory && matchesDate
  })

  const addEntry = (newEntry: Omit<FoodEntry, 'id' | 'date'>) => {
    const entry: FoodEntry = {
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

  const updateEntry = (id: string, updatedEntry: Partial<FoodEntry>) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    ))
  }

  const getDateOptions = () => {
    const dates = [...new Set(entries.map(entry => entry.date.toDateString()))]
    return dates.map(date => ({
      value: new Date(date).toISOString().split('T')[0],
      label: new Date(date).toLocaleDateString()
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Food Planner</h1>
          <p className="text-muted-foreground">Plan meals and track what you eat</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Food Entry
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search food entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="eaten">Eaten</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {getDateOptions().map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="plan" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plan">Meal Plan</TabsTrigger>
          <TabsTrigger value="history">Food History</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-4">
          <MealPlanView
            entries={filteredEntries.filter(e => e.category === 'planned')}
            mealTypes={mealTypes}
            onDelete={deleteEntry}
            onUpdate={updateEntry}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <FoodHistoryView
            entries={filteredEntries.filter(e => e.category === 'eaten')}
            mealTypes={mealTypes}
            onDelete={deleteEntry}
            onUpdate={updateEntry}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView entries={entries} />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Followed Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.category === 'eaten' && e.followedPlan).length}
                </p>
                <p className="text-sm text-muted-foreground">meals this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Off Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.category === 'eaten' && !e.followedPlan).length}
                </p>
                <p className="text-sm text-muted-foreground">meals this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{entries.length}</p>
                <p className="text-sm text-muted-foreground">food entries</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AddFoodDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={addEntry}
        mealTypes={mealTypes}
      />
    </div>
  )
} 