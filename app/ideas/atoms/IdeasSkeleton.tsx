'use client';

import { Card, CardContent } from '@/components/ui/card';

interface IdeasSkeletonProps {
  count?: number;
}

export function IdeasSkeleton({ count = 5 }: IdeasSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Mobile Skeleton */}
      <div className="block md:hidden">
        <div className="space-y-0">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="border-b border-border last:border-b-0"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Icon skeleton */}
                  <div className="w-8 h-8 bg-muted rounded-lg" />
                  
                  {/* Content skeleton */}
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                
                {/* Action buttons skeleton */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded" />
                  <div className="w-8 h-8 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="h-48">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                {/* Title skeleton */}
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
                
                {/* Action buttons skeleton */}
                <div className="flex items-center gap-1">
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
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 