"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { Replicache, MutatorDefs, WriteTransaction } from "replicache";
import { DiaryEntry, DiaryEntryCreate, DiaryEntryUpdate, Mood } from "./types";
import { useSharedSSE } from "@/app/shared/ReplicacheProviders";

interface ReplicacheDiaryMutators extends MutatorDefs {
  createEntry: (tx: WriteTransaction, args: DiaryEntryCreate & { id: string }) => Promise<void>;
  updateEntry: (tx: WriteTransaction, args: { id: string } & DiaryEntryUpdate) => Promise<void>;
  deleteEntry: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
  createMood: (tx: WriteTransaction, args: Mood) => Promise<void>;
  updateMood: (tx: WriteTransaction, args: Mood) => Promise<void>;
  deleteMood: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
}

interface ReplicacheDiaryContextValue {
  entries: DiaryEntry[];
  moods: Mood[];
  rep: Replicache<ReplicacheDiaryMutators> | null;
  mutateWithPoke: <K extends keyof ReplicacheDiaryMutators>(mutator: K, ...args: Parameters<ReplicacheDiaryMutators[K]>) => Promise<any>;
}

const ReplicacheDiaryContext = createContext<ReplicacheDiaryContextValue | null>(null);

export function ReplicacheDiaryProvider({ children }: { children: ReactNode }) {
  const [rep, setRep] = useState<Replicache<ReplicacheDiaryMutators> | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const sharedSSE = useSharedSSE();
  const allowPullsRef = useRef(false);

  // Get auth token from localStorage
  const [authToken, setAuthToken] = useState<string | null>(null);
  const authTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('auth_access_token');
      authTokenRef.current = token;
      setAuthToken(token);
      
      // Listen for auth token changes with debouncing
      let debounceTimeout: NodeJS.Timeout;
      const handleStorageChange = () => {
        const newToken = localStorage.getItem('auth_access_token');
        
        // Only update if token actually changed
        if (newToken !== authTokenRef.current) {
          authTokenRef.current = newToken;
          
          // Debounce the update to prevent rapid changes
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            setAuthToken(newToken);
          }, 100);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('authDataUpdated', handleStorageChange);
      
      return () => {
        clearTimeout(debounceTimeout);
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('authDataUpdated', handleStorageChange);
      };
    }
  }, []);

  useEffect(() => {
    if (!rep && typeof window !== "undefined" && authToken) {
      console.log('[Replicache] Creating new Replicache instance for diary');
      
      const pushURL = `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/push`;
      const pullURL = `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/pull`;
      
      const r = new Replicache<ReplicacheDiaryMutators>({
        name: "diary-replicache",
        mutators: {
          createEntry: async (tx, { id, title, content, mood, date, images }) => {
            const now = new Date().toISOString();
            await tx.set(`diary/${id}`, {
              id,
              title,
              content,
              mood,
              date: date || new Date().toISOString().slice(0, 10),
              images: images || [],
              created_at: now,
              updated_at: now,
            });
          },
          updateEntry: async (tx, { id, ...data }) => {
            const entry = await tx.get<DiaryEntry>(`diary/${id}`);
            if (!entry) return;
            await tx.set(`diary/${id}`, {
              ...entry,
              ...data as any,
              updated_at: new Date().toISOString(),
            });
          },
          deleteEntry: async (tx, { id }) => {
            await tx.del(`diary/${id}`);
          },
          createMood: async (tx, mood) => {
            await tx.set(`mood/${mood.id}`, mood);
          },
          updateMood: async (tx, mood) => {
            await tx.set(`mood/${mood.id}`, mood);
          },
          deleteMood: async (tx, { id }) => {
            await tx.del(`mood/${id}`);
          },
        },
        pushURL,
        pullURL,
        auth: authToken ? `Bearer ${authToken}` : '',
        // Prevent auto-sync on initialization
        pullInterval: null,
      });
      
      // Override pull method to control when pulls are allowed
      const originalPull = r.pull.bind(r);
      r.pull = async () => {
        if (!allowPullsRef.current) {
          console.log('[Replicache] Diary pull blocked (not ready)');
          return;
        }
        console.log('[Replicache] Diary pull requested');
        return originalPull();
      };
      
      setRep(r);
      
      // Allow pulls after a short delay to prevent initialization pulls
      setTimeout(() => {
        allowPullsRef.current = true;
        console.log('[Replicache] Diary pulls enabled');
      }, 2000);
    }
    
    // Cleanup function
    return () => {
      if (rep) {
        console.log('[Replicache] Cleaning up Replicache instance for diary');
        rep.close();
      }
    };
  }, [authToken]); // Only depend on authToken, not rep

  // --- Helper: call mutation and then poke ---
  const mutateWithPoke = async <K extends keyof ReplicacheDiaryMutators>(
    mutator: K,
    ...args: Parameters<ReplicacheDiaryMutators[K]>
  ) => {
    if (!rep) throw new Error("Replicache not initialized");
    console.log('[Replicache] Mutator called:', mutator, args);
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
    if (!rep) return;
    // Note: Replicache v15+ uses different event handling
    // These properties may not exist in the current version
  }, [rep]);

  // --- Use shared SSE instead of creating our own connection ---
  useEffect(() => {
    if (rep) {
      console.log('[Replicache] Setting up shared SSE listener for diary');
      
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

  useEffect(() => {
    if (!rep) return;
    let stop = false;
    const unsubEntries = rep.subscribe(
      async tx => {
        const arr = await tx.scan({ prefix: 'diary/' }).values().toArray();
        return arr as unknown as DiaryEntry[];
      },
      { onData: data => { if (!stop) setEntries(data); } }
    );
    const unsubMoods = rep.subscribe(
      async tx => {
        const arr = await tx.scan({ prefix: 'mood/' }).values().toArray();
        return arr as unknown as Mood[];
      },
      { onData: data => { if (!stop) setMoods(data); } }
    );
    return () => {
      stop = true;
      unsubEntries();
      unsubMoods();
    };
  }, [rep]);

  if (!rep) {
    // For unauthenticated users, provide a fallback context
    return (
      <ReplicacheDiaryContext.Provider value={{ 
        entries: [], 
        moods: [], 
        rep: null, 
        mutateWithPoke: async () => {
          throw new Error("Replicache not initialized - user not authenticated");
        }
      }}>
        {children}
      </ReplicacheDiaryContext.Provider>
    );
  }

  return (
    <ReplicacheDiaryContext.Provider value={{ entries, moods, rep, mutateWithPoke }}>
      {children}
    </ReplicacheDiaryContext.Provider>
  );
}

export function useReplicacheDiary() {
  const context = useContext(ReplicacheDiaryContext);
  if (!context) {
    throw new Error("useReplicacheDiary must be used within a ReplicacheDiaryProvider");
  }
  return context;
}