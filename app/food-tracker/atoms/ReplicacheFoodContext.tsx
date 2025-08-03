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
        pushURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/push`,
        pullURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/pull`,
        auth: localStorage.getItem('auth_access_token') ? `Bearer ${localStorage.getItem('auth_access_token')}` : '',
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
      const setupSSE = () => {
        // Get user ID from auth system or fallback to anonymous
        let userId = 'anonymous';
        
        // Try to get user ID from auth system
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userId = user.id || user.user_id || 'anonymous';
            console.log('Using authenticated user ID:', userId);
          } catch (error) {
            console.log('Could not parse auth user, using anonymous');
          }
        }
        
        const backendUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
        const es = new window.EventSource(`${backendUrl}/replicache/stream?userId=${userId}`);
        
        es.onopen = () => {
          console.log('SSE connection opened for user:', userId);
        };
        
        es.onmessage = (event) => {
          console.log('SSE message received:', event.data);
          // Only trigger pull on 'sync' messages, not on 'ping' or 'connected'
          if (event.data === 'sync') {
            console.log('Triggering pull due to sync message');
            rep.pull();
          }
        };
        
        es.onerror = (error) => {
          console.error('SSE error:', error);
        };
        
        return es;
      };
      
      // Initial setup
      let es = setupSSE();
      
      // Listen for auth data updates
      const handleAuthDataUpdate = () => {
        console.log('🔄 Auth data updated, reconnecting SSE with new user ID');
        es.close();
        es = setupSSE();
      };
      
      window.addEventListener('authDataUpdated', handleAuthDataUpdate as EventListener);
      
      return () => {
        console.log('Closing SSE connection');
        es.close();
        window.removeEventListener('authDataUpdated', handleAuthDataUpdate as EventListener);
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