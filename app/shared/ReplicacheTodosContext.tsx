// DEPRECATED: Do not use this provider. Use ReplicacheTodoProvider from app/todo/atoms/ReplicacheTodoContext instead.
import React, { ReactNode } from 'react';

export function ReplicacheTodosProvider({ children }: { children: ReactNode }) {
  if (typeof window !== 'undefined') {
    console.warn('ReplicacheTodosProvider is deprecated. Use ReplicacheTodoProvider instead.');
  }
  return <>{children}</>;
}