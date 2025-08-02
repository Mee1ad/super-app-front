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
  mutateWithPoke: <K extends keyof ReplicacheFoodMutators>(mutator: K, ...args: Parameters<ReplicacheFoodMutators[K]>) => Promise<any>;
}

const ReplicacheFoodContext = createContext<ReplicacheFoodContextValue | null>(null);

export function ReplicacheFoodProvider({ children }: { children: ReactNode }) {
  const [rep, setRep] = useState<Replicache<ReplicacheFoodMutators> | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // --- Helper: call mutation and then poke ---
  const mutateWithPoke = async <K extends keyof ReplicacheFoodMutators>(
    mutator: K,
    ...args: Parameters<ReplicacheFoodMutators[K]>
  ) => {
    if (!rep) throw new Error('Replicache not initialized');
    // @ts-ignore
    const result = await rep.mutate[mutator](...args);
    fetch(`/api/replicache/poke`, { method: 'POST' });
    return result;
  };

  useEffect(() => {
    if (!rep && typeof window !== 'undefined') {

      const r = new Replicache<ReplicacheFoodMutators>({
        name: 'food-tracker-replicache',
        mutators: {
          createEntry: async (tx, { id, name, price, description, date, time, mealType }) => {
            const now = new Date().toISOString();
            // @ts-ignore
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
          updateEntry: async (tx, { id, name, price, description, date, time, mealType }) => {
            // @ts-ignore
            const entry = await tx.get(`food/${id}`);
            if (!entry) return;
            const updatedEntry = {
              id: entry.id,
              name: name !== undefined ? name : entry.name,
              price: price !== undefined ? price : entry.price,
              description: description !== undefined ? description : entry.description,
              date: date !== undefined ? date : entry.date,
              time: time !== undefined ? time : entry.time,
              mealType: mealType !== undefined ? mealType : entry.mealType,
              created_at: entry.created_at,
              updated_at: new Date().toISOString(),
            };
            // @ts-ignore
            await tx.set(`food/${id}`, updatedEntry);
          },
          deleteEntry: async (tx, { id }) => {
            await tx.del(`food/${id}`);
          },
        },
        pushURL: `/api/replicache/push`,
        pullURL: `/api/replicache/pull`,
        auth: localStorage.getItem('auth_access_token') || '',
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
        return arr as unknown as FoodEntry[];
      },
      { onData: data => { if (!stop) setEntries(data); } }
    );
    return () => {
      stop = true;
      unsub();
    };
  }, [rep]);

  // --- SSE logic: listen for /api/replicache/stream and trigger pull ---
  useEffect(() => {
    if (typeof window !== 'undefined' && rep) {
      const es = new window.EventSource('/api/replicache/stream');
      es.onmessage = () => {
        rep.pull();
      };
      return () => {
        es.close();
      };
    }
  }, [rep]);

  if (!rep) return null;

  return (
    <ReplicacheFoodContext.Provider value={{ entries, rep, mutateWithPoke }}>
      {children}
    </ReplicacheFoodContext.Provider>
  );
}

export function useReplicacheFood() {
  const context = useContext(ReplicacheFoodContext);
  if (!context) {
    throw new Error('useReplicacheFood must be used within a ReplicacheFoodProvider');
  }
  return context;
}