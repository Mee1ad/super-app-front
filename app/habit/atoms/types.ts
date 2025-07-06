export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'custom';
  notes?: string;
  createdAt: Date;
  completedDates: Date[];
  streak: number;
  completionRate: number;
}

export interface HabitFormData {
  name: string;
  frequency: 'daily' | 'weekly' | 'custom';
  notes?: string;
} 