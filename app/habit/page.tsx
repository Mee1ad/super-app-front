'use client'

import { useState, useEffect } from 'react';
import { HabitCard } from './molecules/HabitCard';
import { AddHabitDialog } from './organisms/AddHabitDialog';
import { EditHabitDialog } from './organisms/EditHabitDialog';
import { HabitDetailsDialog } from './organisms/HabitDetailsDialog';
import { Habit, HabitFormData } from './atoms/types';
import { Target, TrendingUp } from 'lucide-react';

export default function HabitPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Load habits from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const calculateStreak = (completedDates: Date[]): number => {
    if (completedDates.length === 0) return 0;
    
    const sortedDates = completedDates
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = today;
    
    for (const completedDate of sortedDates) {
      const completedDay = new Date(completedDate);
      completedDay.setHours(0, 0, 0, 0);
      
      if (currentDate.getTime() === completedDay.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (currentDate.getTime() > completedDay.getTime()) {
        break;
      }
    }
    
    return streak;
  };

  const calculateCompletionRate = (completedDates: Date[], frequency: string): number => {
    const today = new Date();
    const startDate = new Date(today);
    
    // Calculate based on frequency
    let totalDays = 0;
    if (frequency === 'daily') {
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      totalDays = 30;
    } else if (frequency === 'weekly') {
      startDate.setDate(startDate.getDate() - 90); // Last 90 days
      totalDays = 13; // ~13 weeks
    } else {
      startDate.setDate(startDate.getDate() - 30); // Last 30 days for custom
      totalDays = 30;
    }
    
    const completedInPeriod = completedDates.filter(date => {
      const completedDate = new Date(date);
      return completedDate >= startDate && completedDate <= today;
    }).length;
    
    return totalDays > 0 ? (completedInPeriod / totalDays) * 100 : 0;
  };

  const addHabit = (habitData: HabitFormData) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: habitData.name,
      frequency: habitData.frequency,
      notes: habitData.notes,
      createdAt: new Date(),
      completedDates: [],
      streak: 0,
      completionRate: 0,
    };
    
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (habitId: string, habitData: HabitFormData) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const updatedHabit = {
          ...habit,
          name: habitData.name,
          frequency: habitData.frequency,
          notes: habitData.notes,
        };
        
        // Recalculate streak and completion rate
        updatedHabit.streak = calculateStreak(updatedHabit.completedDates);
        updatedHabit.completionRate = calculateCompletionRate(updatedHabit.completedDates, updatedHabit.frequency);
        
        return updatedHabit;
      }
      return habit;
    }));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const toggleHabit = (habitId: string, completed: boolean) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let updatedCompletedDates = [...habit.completedDates];
        
        if (completed) {
          // Add today's date if not already present
          const todayExists = updatedCompletedDates.some(
            date => new Date(date).toDateString() === today.toDateString()
          );
          if (!todayExists) {
            updatedCompletedDates.push(today);
          }
        } else {
          // Remove today's date
          updatedCompletedDates = updatedCompletedDates.filter(
            date => new Date(date).toDateString() !== today.toDateString()
          );
        }
        
        const updatedHabit = {
          ...habit,
          completedDates: updatedCompletedDates,
        };
        
        // Recalculate streak and completion rate
        updatedHabit.streak = calculateStreak(updatedHabit.completedDates);
        updatedHabit.completionRate = calculateCompletionRate(updatedHabit.completedDates, updatedHabit.frequency);
        
        return updatedHabit;
      }
      return habit;
    }));
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditDialogOpen(true);
  };

  const totalHabits = habits.length;
  const completedToday = habits.filter(habit => 
    habit.completedDates.some(
      date => new Date(date).toDateString() === new Date().toDateString()
    )
  ).length;
  const averageCompletionRate = habits.length > 0 
    ? Math.round(habits.reduce((sum, habit) => sum + habit.completionRate, 0) / habits.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Habit Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Build better habits and track your progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Habits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHabits}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedToday}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageCompletionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Habit Button */}
        <div className="mb-6">
          <AddHabitDialog onAdd={addHabit} />
        </div>

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Target className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No habits yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start building better habits by adding your first one
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map(habit => (
              <div key={habit.id} className="relative">
                <HabitCard
                  habit={habit}
                  onToggle={toggleHabit}
                  onEdit={handleEdit}
                  onDelete={deleteHabit}
                />
                <div className="mt-2">
                  <HabitDetailsDialog habit={habit} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <EditHabitDialog
          habit={editingHabit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={updateHabit}
        />
      </div>
    </div>
  );
} 