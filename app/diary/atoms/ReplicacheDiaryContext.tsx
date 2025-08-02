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
    const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
    fetch(`${BASE_API_URL}/api/poke`, { method: 'POST' });
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
      const es = new window.EventSource('/api/replicache/stream');
      es.onmessage = () => {
        rep.pull();
      };
      return () => {
        es.close();
      };
    }
  }, [rep]);

  // Seed moods on first mount if not present
  useEffect(() => {
    if (!rep) return;
    (async () => {
      for (const mood of mockMoods) {
        // Try to get the mood from Replicache
        const moodsArr = await rep.query(async tx => {
          return await tx.get(`mood/${mood.id}`);
        });
        if (!moodsArr) {
          await rep.mutate.createMood(mood);
        }
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