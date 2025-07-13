'use client'

import { useState, useEffect } from 'react'
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
import { useFoodPlannerApi } from './atoms/useFoodPlannerApi'
import { FoodEntry } from './atoms/types'

export default function FoodPlannerPage() {
  const {
    mealTypes,
    foodEntries,
    summary,
    loading,
    error,
    loadMealTypes,
    loadFoodEntries,
    createFoodEntry,
    updateFoodEntry,
    deleteFoodEntry,
    loadSummary
  } = useFoodPlannerApi()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedMealType, setSelectedMealType] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Load data on mount
  useEffect(() => {
    loadMealTypes()
    loadFoodEntries()
    loadSummary()
  }, [loadMealTypes, loadFoodEntries, loadSummary])

  const filteredEntries = foodEntries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.comment && entry.comment.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory
    const matchesMealType = selectedMealType === 'all' || entry.meal_type_id === selectedMealType
    const matchesDate = selectedDate === 'all' || entry.date === selectedDate
    return matchesSearch && matchesCategory && matchesMealType && matchesDate
  })

  const handleAddEntry = async (newEntry: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at' | 'meal_type'>) => {
    try {
      await createFoodEntry({
        name: newEntry.name,
        category: newEntry.category,
        meal_type_id: newEntry.meal_type_id,
        time: newEntry.time,
        date: newEntry.date,
        comment: newEntry.comment,
        image: newEntry.image,
        followed_plan: newEntry.followed_plan,
        symptoms: newEntry.symptoms
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteFoodEntry(id)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleUpdateEntry = async (id: string, updatedEntry: Partial<FoodEntry>) => {
    try {
      await updateFoodEntry(id, {
        name: updatedEntry.name,
        category: updatedEntry.category,
        meal_type_id: updatedEntry.meal_type_id,
        time: updatedEntry.time,
        date: updatedEntry.date,
        comment: updatedEntry.comment,
        image: updatedEntry.image,
        followed_plan: updatedEntry.followed_plan,
        symptoms: updatedEntry.symptoms
      })
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const getDateOptions = () => {
    const dates = [...new Set(foodEntries.map(entry => entry.date))]
    return dates.map(date => ({
      value: date,
      label: new Date(date).toLocaleDateString()
    }))
  }

  if (loading && foodEntries.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading food planner...</p>
          </div>
        </div>
      </div>
    )
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
        <Select value={selectedMealType} onValueChange={setSelectedMealType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Meal Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Meals</SelectItem>
            {mealTypes.map(mealType => (
              <SelectItem key={mealType.id} value={mealType.id}>
                {mealType.emoji} {mealType.name}
              </SelectItem>
            ))}
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
            onDelete={handleDeleteEntry}
            onUpdate={handleUpdateEntry}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <FoodHistoryView
            entries={filteredEntries.filter(e => e.category === 'eaten')}
            mealTypes={mealTypes}
            onDelete={handleDeleteEntry}
            onUpdate={handleUpdateEntry}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView entries={foodEntries} />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Planned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {summary?.planned_count || 0}
                </p>
                <p className="text-sm text-muted-foreground">meals planned</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Eaten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {summary?.eaten_count || 0}
                </p>
                <p className="text-sm text-muted-foreground">meals eaten</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Followed Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {summary?.followed_plan_count || 0}
                </p>
                <p className="text-sm text-muted-foreground">meals on plan</p>
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
                  {summary?.off_plan_count || 0}
                </p>
                <p className="text-sm text-muted-foreground">meals off plan</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AddFoodDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mealTypes={mealTypes}
        onSubmit={handleAddEntry}
      />
    </div>
  )
} 