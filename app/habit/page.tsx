'use client'

import { Target } from 'lucide-react';

export default function HabitPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Target className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Habit Tracker
          </h1>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We're working on building an amazing habit tracking experience for you
          </p>
        </div>
      </div>
    </div>
  );
} 