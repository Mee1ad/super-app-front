'use client';


import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface TodoSkeletonProps {
  count?: number;
}

export function TodoSkeleton({ count = 3 }: TodoSkeletonProps) {
  return (
    <div className="space-y-4 md:space-y-6" style={{ transition: 'none', animation: 'none' }}>
      {/* Mobile Skeleton */}
      <div className="block md:hidden" style={{ transition: 'none', animation: 'none' }}>
        <div className="space-y-0">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="border-b border-border last:border-b-0"
              style={{ transition: 'none', animation: 'none' }}
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
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8" style={{ transition: 'none', animation: 'none' }}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            style={{ transition: 'none', animation: 'none' }}
          >
            <Card className="h-64">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {/* Title skeleton */}
                  <div className="h-5 bg-muted rounded w-2/3" />
                  
                  {/* Action buttons skeleton */}
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 bg-muted rounded" />
                    <div className="w-6 h-6 bg-muted rounded" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Items skeleton */}
                {Array.from({ length: 4 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-3">
                    {/* Checkbox skeleton */}
                    <div className="w-4 h-4 bg-muted rounded" />
                    
                    {/* Item content skeleton */}
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted rounded w-full" />
                      {itemIndex % 2 === 0 && (
                        <div className="h-2 bg-muted rounded w-2/3" />
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add button skeleton */}
                <div className="pt-2">
                  <div className="h-8 bg-muted rounded w-full" />
                </div>
              </CardContent>
                          </Card>
            </div>
          ))}
      </div>
    </div>
  );
} 