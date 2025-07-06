'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flame, Target, CheckCircle } from 'lucide-react';
import { Habit } from '../atoms/types';

interface HabitDetailsDialogProps {
  habit: Habit;
}

export function HabitDetailsDialog({ habit }: HabitDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  // Generate calendar days for the current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const isCompletedOnDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return habit.completedDates.some(
      completedDate => new Date(completedDate).toDateString() === date.toDateString()
    );
  };

  const isToday = (day: number) => {
    return day === today.getDate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{habit.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{habit.streak} days</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(habit.completionRate)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Habit Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Habit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Frequency:</span>
                <Badge variant="secondary" className="capitalize">
                  {habit.frequency}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm">
                  {new Date(habit.createdAt).toLocaleDateString()}
                </span>
              </div>
              {habit.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Notes:</span>
                  <p className="text-sm mt-1">{habit.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square p-1 ${
                      day === null ? 'invisible' : 'cursor-pointer'
                    }`}
                  >
                    {day && (
                      <div
                        className={`w-full h-full rounded-md flex items-center justify-center text-sm ${
                          isCompletedOnDay(day)
                            ? 'bg-green-500 text-white'
                            : isToday(day)
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {day}
                        {isCompletedOnDay(day) && (
                          <CheckCircle className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 