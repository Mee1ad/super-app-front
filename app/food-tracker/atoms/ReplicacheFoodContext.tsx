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
    
    const backendUrl = process.env.NEXT_PUBLIC_BASE_API_URL || '';
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
        pushURL: `${process.env.NEXT_PUBLIC_BASE_API_URL || ''}/replicache/push`,
        pullURL: `${process.env.NEXT_PUBLIC_BASE_API_URL || ''}/replicache/pull`,
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
        
        const backendUrl = process.env.NEXT_PUBLIC_BASE_API_URL || '';
        const authToken = localStorage.getItem('auth_access_token');
        
        // Create headers with Authorization
        const headers: HeadersInit = {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        };
        
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        // Use fetch with streaming instead of EventSource to support custom headers
        const controller = new AbortController();
        
        fetch(`${backendUrl}/replicache/stream?userId=${userId}`, {
          method: 'GET',
          headers,
          signal: controller.signal,
        }).then(response => {
          if (!response.ok) {
            throw new Error(`SSE connection failed: ${response.status}`);
          }
          
          console.log('SSE connection opened for user:', userId);
          
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          
          if (!reader) {
            throw new Error('No response body');
          }
          
          const processStream = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                console.log('SSE stream ended');
                return;
              }
              
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6); // Remove 'data: ' prefix
                  console.log('SSE message received:', data);
                  
                  // Only trigger pull on 'sync' messages, not on 'ping' or 'connected'
                  if (data === 'sync') {
                    console.log('Triggering pull due to sync message');
                    rep.pull();
                  }
                }
              }
              
              // Continue reading
              processStream();
            }).catch(error => {
              console.error('SSE stream error:', error);
            });
          };
          
          processStream();
          
          // Return cleanup function
          return () => {
            controller.abort();
            reader.cancel();
          };
        }).catch(error => {
          console.error('SSE connection error:', error);
        });
        
        return controller;
      };
      
      // Initial setup
      let cleanup = setupSSE();
      
      // Listen for auth data updates
      const handleAuthDataUpdate = () => {
        console.log('🔄 Auth data updated, reconnecting SSE with new user ID');
        if (cleanup) cleanup.abort();
        cleanup = setupSSE();
      };
      
      window.addEventListener('authDataUpdated', handleAuthDataUpdate as EventListener);
      
      return () => {
        console.log('Closing SSE connection');
        if (cleanup) cleanup.abort();
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