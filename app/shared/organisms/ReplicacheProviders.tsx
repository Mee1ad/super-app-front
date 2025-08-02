"use client";

import React, { ReactNode } from "react";
import { ReplicacheTodoProvider } from "../../todo/atoms/ReplicacheTodoContext";
import { ReplicacheFoodProvider } from "../../food-tracker/atoms/ReplicacheFoodContext";
import { ReplicacheDiaryProvider } from "../../diary/atoms/ReplicacheDiaryContext";
import { ReplicacheIdeasProvider } from "../../ideas/atoms/ReplicacheIdeasContext";

interface ReplicacheProvidersProps {
  children: ReactNode;
}

export function ReplicacheProviders({ children }: ReplicacheProvidersProps) {
  return (
    <ReplicacheTodoProvider>
      <ReplicacheFoodProvider>
        <ReplicacheDiaryProvider>
          <ReplicacheIdeasProvider>
            {children}
          </ReplicacheIdeasProvider>
        </ReplicacheDiaryProvider>
      </ReplicacheFoodProvider>
    </ReplicacheTodoProvider>
  );
} 