'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, MoreHorizontal, Flame, Target } from 'lucide-react';
import { Habit } from '../atoms/types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isCompletedToday = habit.completedDates.some(
    date => new Date(date).toDateString() === new Date().toDateString()
  );

  const handleToggle = () => {
    onToggle(habit.id, !isCompletedToday);
  };

  return (
    <Card className="hover:shadow-md transition-shadow hover:bg-muted/50 active:bg-muted/30 active:scale-[0.98] transition-all duration-150 ease-out">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{habit.name}</CardTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onEdit(habit);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(habit.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="capitalize">
            {habit.frequency}
          </Badge>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{habit.streak} days</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span>{Math.round(habit.completionRate)}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleToggle}
            className={`flex items-center gap-2 ${
              isCompletedToday ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {isCompletedToday ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
            <span>{isCompletedToday ? 'Completed' : 'Mark as done'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 