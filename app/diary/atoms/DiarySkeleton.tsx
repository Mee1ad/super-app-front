'use client';

import { Card, CardContent } from '@/components/ui/card';

interface DiarySkeletonProps {
  count?: number;
}

export function DiarySkeleton({ count = 5 }: DiarySkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Mobile Skeleton */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                {/* Title and date skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                
                {/* Mood and action buttons skeleton */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="w-6 h-6 bg-muted rounded" />
                  <div className="w-6 h-6 bg-muted rounded" />
                </div>
              </div>
              
              {/* Content skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
              
              {/* Tags skeleton */}
              <div className="flex gap-2 mt-3">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden md:block">
        <div className="space-y-6">
          {Array.from({ length: count }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {/* Title and date skeleton */}
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                  
                  {/* Mood and action buttons skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="w-8 h-8 bg-muted rounded" />
                    <div className="w-8 h-8 bg-muted rounded" />
                  </div>
                </div>
                
                {/* Content skeleton */}
                <div className="space-y-3">
                  <div className="h-5 bg-muted rounded w-full" />
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-5 bg-muted rounded w-1/2" />
                </div>
                
                {/* Tags skeleton */}
                <div className="flex gap-2 mt-4">
                  <div className="h-7 bg-muted rounded w-20" />
                  <div className="h-7 bg-muted rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 