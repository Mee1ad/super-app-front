'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 24, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center p-8 ${className}`}>
      <Loader2 className="animate-spin" style={{ width: size, height: size }} />
    </div>
  );
} 