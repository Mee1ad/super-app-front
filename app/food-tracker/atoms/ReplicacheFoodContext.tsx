'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Replicache, MutatorDefs, WriteTransaction } from 'replicache';
import { FoodEntry } from './types';
import { useSharedSSE } from '@/app/shared/ReplicacheProviders';

interface ReplicacheFoodMutators extends MutatorDefs {
  createEntry: (tx: WriteTransaction, args: FoodEntry & { id: string }) => Promise<void>;
  updateEntry: (tx: WriteTransaction, args: { id: string } & Partial<FoodEntry>) => Promise<void>;
  deleteEntry: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
}

interface ReplicacheFoodContextValue {
  entries: FoodEntry[];
  rep: Replicache<ReplicacheFoodMutators> | null;
  mutateWithPoke: <K extends keyof ReplicacheFoodMutators>(mutator: K, ...args: Parameters<ReplicacheFoodMutators[K]>) => Promise<any>;
}

const ReplicacheFoodContext = createContext<ReplicacheFoodContextValue | null>(null);

export function ReplicacheFoodProvider({ children }: { children: ReactNode }) {
  const [rep, setRep] = useState<Replicache<ReplicacheFoodMutators> | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const sharedSSE = useSharedSSE();

  // Get auth token from localStorage
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('auth_access_token');
      setAuthToken(token);
      
      // Listen for auth token changes
      const handleStorageChange = () => {
        const newToken = localStorage.getItem('auth_access_token');
        setAuthToken(newToken);
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('authDataUpdated', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('authDataUpdated', handleStorageChange);
      };
    }
  }, []);

  useEffect(() => {
    if (!rep && typeof window !== 'undefined' && authToken) {
      const r = new Replicache<ReplicacheFoodMutators>({
        name: 'food-tracker-replicache',
        mutators: {
          createEntry: async (tx, { id, ...data }) => {
            const now = new Date().toISOString();
            await tx.set(`food/${id}`, {
              id,
              ...data,
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
        pushURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/push`,
        pullURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/pull`,
        auth: authToken ? `Bearer ${authToken}` : '',
      });
      setRep(r);
    }
  }, [rep, authToken]);

  // --- Helper: call mutation and then poke ---
  const mutateWithPoke = async <K extends keyof ReplicacheFoodMutators>(
    mutator: K,
    ...args: Parameters<ReplicacheFoodMutators[K]>
  ) => {
    if (!rep) throw new Error('Replicache not initialized');
    console.log('[Replicache] Mutator called:', mutator, args);
    const result = await rep.mutate[mutator](...args);
    
    // Get user ID from auth system for personal notifications
    let userId = 'anonymous';
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id || user.user_id || 'anonymous';
      } catch (error) {
        console.log('Could not parse auth user for poke');
      }
    }
    
    // Get auth token for authorization header
    const authToken = localStorage.getItem('auth_access_token');
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
    fetch(`${backendUrl}/replicache/poke-user?userId=${userId}`, { 
      method: 'POST',
      headers
    });
    
    return result;
  };

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

  // --- Use shared SSE instead of creating our own connection ---
  useEffect(() => {
    if (rep) {
      console.log('[Replicache] Setting up shared SSE listener for food');
      
      const cleanup = sharedSSE.addListener((event) => {
        console.log('[Replicache] Shared SSE message received:', event);
        // Only trigger pull on 'sync' messages, not on 'ping' or 'connected'
        if (event === 'sync') {
          console.log('[Replicache] Triggering pull due to sync message');
          rep.pull();
        }
      });
      
      return cleanup;
    }
  }, [rep, sharedSSE]);

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