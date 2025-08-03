"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Replicache, MutatorDefs, WriteTransaction } from "replicache";
import { DiaryEntry, DiaryEntryCreate, DiaryEntryUpdate, Mood } from "./types";
import { mockMoods } from '@/app/api/diary/mock-data';
import { getAccessToken } from "@/lib/auth-token";

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
  rep: Replicache<ReplicacheDiaryMutators>;
  mutateWithPoke: <K extends keyof ReplicacheDiaryMutators>(mutator: K, ...args: Parameters<ReplicacheDiaryMutators[K]>) => Promise<any>;
}

const ReplicacheDiaryContext = createContext<ReplicacheDiaryContextValue | null>(null);

export function ReplicacheDiaryProvider({ children }: { children: ReactNode }) {
  const [rep, setRep] = useState<Replicache<ReplicacheDiaryMutators> | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // --- Helper: call mutation and then poke ---
  const mutateWithPoke = async <K extends keyof ReplicacheDiaryMutators>(
    mutator: K,
    ...args: Parameters<ReplicacheDiaryMutators[K]>
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
        auth: localStorage.getItem('auth_access_token') ? `Bearer ${localStorage.getItem('auth_access_token')}` : '',
      });
      setRep(r);
    }
  }, [rep]);

  useEffect(() => {
    if (!rep) return;
    // Note: Replicache v15+ uses different event handling
    // These properties may not exist in the current version
  }, [rep]);

  // --- SSE logic: listen for /api/replicache/stream and trigger pull ---
  useEffect(() => {
    if (typeof window !== 'undefined' && rep) {
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
      es.onmessage = (event) => {
        // Only trigger pull on 'sync' messages, not on 'ping' or 'connected'
        if (event.data === 'sync') {
          rep.pull();
        }
      };
      return () => {
        es.close();
      };
    }
  }, [rep]);

  // Seed moods on first mount if not present
  useEffect(() => {
    if (!rep) return;
    
    // Only seed if we haven't seeded before (check localStorage flag)
    const hasSeededMoods = localStorage.getItem('diary-moods-seeded');
    if (hasSeededMoods) return;
    
    (async () => {
      let needsSeeding = false;
      
      // Check if any moods exist
      const existingMoods = await rep.query(async tx => {
        const moods = await tx.scan({ prefix: "mood/" }).values().toArray();
        return moods;
      });
      
      if (existingMoods.length === 0) {
        needsSeeding = true;
        for (const mood of mockMoods) {
          await rep.mutate.createMood(mood);
        }
        localStorage.setItem('diary-moods-seeded', 'true');
        console.log('[Diary] Seeded default moods');
      } else {
        localStorage.setItem('diary-moods-seeded', 'true');
      }
    })();
  }, [rep]);

  useEffect(() => {
    if (!rep) return;
    let stop = false;
    const unsubEntries = rep.subscribe(
      async tx => {
        const arr = await tx.scan({ prefix: "diary/" }).values().toArray();
        return arr as unknown as DiaryEntry[];
      },
      { onData: data => { if (!stop) setEntries(data); } }
    );
    const unsubMoods = rep.subscribe(
      async tx => {
        const arr = await tx.scan({ prefix: "mood/" }).values().toArray();
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

  if (!rep) return null;

  return (
    <ReplicacheDiaryContext.Provider value={{ entries, moods, rep, mutateWithPoke }}>
      {children}
    </ReplicacheDiaryContext.Provider>
  );
}

export function useReplicacheDiary() {
  const ctx = useContext(ReplicacheDiaryContext);
  if (!ctx) throw new Error("useReplicacheDiary must be used within ReplicacheDiaryProvider");
  return ctx;
}