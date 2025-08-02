'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Replicache, MutatorDefs, WriteTransaction } from 'replicache';
import { FoodEntry, FoodEntryCreate, FoodEntryUpdate } from './types';

interface ReplicacheFoodMutators extends MutatorDefs {
  createEntry: (tx: WriteTransaction, args: FoodEntryCreate & { id: string }) => Promise<void>;
  updateEntry: (tx: WriteTransaction, args: { id: string } & FoodEntryUpdate) => Promise<void>;
  deleteEntry: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
}

interface ReplicacheFoodContextValue {
  entries: FoodEntry[];
  rep: Replicache<ReplicacheFoodMutators>;
}

const ReplicacheFoodContext = createContext<ReplicacheFoodContextValue | null>(null);

export function ReplicacheFoodProvider({ children }: { children: ReactNode }) {
  const [rep, setRep] = useState<Replicache<ReplicacheFoodMutators> | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);

  useEffect(() => {
    if (!rep && typeof window !== 'undefined') {
      const r = new Replicache<ReplicacheFoodMutators>({
        name: 'food-tracker-replicache',
        mutators: {
          createEntry: async (tx, { id, name, price, description, date, time, mealType }) => {
            const now = new Date().toISOString();
            await tx.set(`food/${id}`, {
              id,
              name,
              price,
              description,
              date,
              time,
              mealType,
              created_at: now,
              updated_at: now,
            });
          },
          updateEntry: async (tx, { id, ...data }) => {
            const entry = await tx.get<FoodEntry>(`food/${id}`);
            if (!entry) return;
            await tx.set(`food/${id}`, {
              ...entry,
              ...data,
              updated_at: new Date().toISOString(),
            });
          },
          deleteEntry: async (tx, { id }) => {
            await tx.del(`food/${id}`);
          },
        },
      });
      setRep(r);
    }
  }, [rep]);

  useEffect(() => {
    if (!rep) return;
    let stop = false;
    const unsub = rep.subscribe(
      async tx => {
        const arr = await tx.scan({ prefix: 'food/' }).values().toArray();
        return arr as FoodEntry[];
      },
      { onData: data => { if (!stop) setEntries(data); } }
    );
    return () => {
      stop = true;
      unsub();
    };
  }, [rep]);

  if (!rep) return null;

  return (
    <ReplicacheFoodContext.Provider value={{ entries, rep }}>
      {children}
    </ReplicacheFoodContext.Provider>
  );
}

export function useReplicacheFood() {
  const ctx = useContext(ReplicacheFoodContext);
  if (!ctx) throw new Error('useReplicacheFood must be used within ReplicacheFoodProvider');
  return ctx;
}