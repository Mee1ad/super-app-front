'use client'

import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { AppLayout } from '../shared/organisms/AppLayout';

export default function HabitPage() {
  const [isClient, setIsClient] = useState(false);
  
  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render content until client-side hydration is complete
  if (!isClient) {
    return (
      <AppLayout>
        <div className="text-center py-8 md:py-12">
          <div className="text-gray-400 mb-4">
            <Target className="h-12 w-12 md:h-16 md:w-16 mx-auto" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Habit Tracker
          </h1>
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
            Coming Soon
          </h3>
          <p className="text-sm md:text-base text-gray-600">
            We&apos;re working on building an amazing habit tracking experience for you
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="text-center py-8 md:py-12">
        <div className="text-gray-400 dark:text-gray-600 mb-4">
          <Target className="h-12 w-12 md:h-16 md:w-16 mx-auto" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Habit Tracker
        </h1>
        <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">
          Coming Soon
        </h3>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          We&apos;re working on building an amazing habit tracking experience for you
        </p>
      </div>
    </AppLayout>
  );
} 