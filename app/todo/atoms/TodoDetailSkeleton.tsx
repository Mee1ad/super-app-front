'use client';



interface TodoDetailSkeletonProps {
  count?: number;
}

export function TodoDetailSkeleton({ count = 5 }: TodoDetailSkeletonProps) {
  return (
    <div className="flex-1 space-y-6 overflow-x-hidden">
      {/* Mobile View Skeleton */}
      <div className="block md:hidden">
        <div className="w-full">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="border-b border-border last:border-b-0"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Checkbox skeleton */}
                  <div className="w-5 h-5 bg-muted rounded" />
                  
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

      {/* Desktop View Skeleton */}
      <div className="hidden md:block">
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Checkbox skeleton */}
                  <div className="w-5 h-5 bg-muted rounded" />
                  
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
    </div>
  );
} 