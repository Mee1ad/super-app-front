"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Replicache, MutatorDefs, WriteTransaction } from "replicache";
import {
  Idea,
  IdeaCreate,
  IdeaUpdate,
} from "./types";

interface ReplicacheIdeasMutators extends MutatorDefs {
  createIdea: (tx: WriteTransaction, args: IdeaCreate & { id: string }) => Promise<void>;
  updateIdea: (tx: WriteTransaction, args: { id: string } & IdeaUpdate) => Promise<void>;
  deleteIdea: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
}

interface ReplicacheIdeasContextValue {
  ideas: Idea[];
  rep: Replicache<ReplicacheIdeasMutators> | null;
  mutateWithPoke: <K extends keyof ReplicacheIdeasMutators>(mutator: K, ...args: Parameters<ReplicacheIdeasMutators[K]>) => Promise<any>;
}

const ReplicacheIdeasContext = createContext<ReplicacheIdeasContextValue | null>(null);

export function ReplicacheIdeasProvider({ children }: { children: ReactNode }) {
  const [rep, setRep] = useState<Replicache<ReplicacheIdeasMutators> | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  useEffect(() => {
    if (!rep && typeof window !== "undefined") {
      const r = new Replicache<ReplicacheIdeasMutators>({
        name: "ideas-replicache",
        mutators: {
          createIdea: async (tx, { id, title, description, category, tags }) => {
            const now = new Date().toISOString();
            // @ts-ignore
            await tx.set(`idea/${id}`, {
              id,
              title,
              description,
              category_id: category,
              tags: tags || [],
              created_at: now,
              updated_at: now,
            });
          },
          updateIdea: async (tx, { id, title, description, category, tags }) => {
            // @ts-ignore
            const idea = await tx.get(`idea/${id}`);
            if (!idea) return;
            // @ts-ignore
            const updatedIdea = {
              id: idea.id,
              title: title !== undefined ? title : idea.title,
              description: description !== undefined ? description : idea.description,
              category_id: category !== undefined ? category : idea.category_id,
              tags: tags !== undefined ? tags : idea.tags,
              created_at: idea.created_at,
              updated_at: new Date().toISOString(),
            };
            // @ts-ignore
            await tx.set(`idea/${id}`, updatedIdea);
          },
          deleteIdea: async (tx, { id }) => {
            await tx.del(`idea/${id}`);
          },
        },
        pushURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/push`,
        pullURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/pull`,
        auth: localStorage.getItem('auth_access_token') ? `Bearer ${localStorage.getItem('auth_access_token')}` : '',
      });
      setRep(r);
    }
  }, [rep]);

  // --- Helper: call mutation and then poke ---
  const mutateWithPoke = async <K extends keyof ReplicacheIdeasMutators>(
    mutator: K,
    ...args: Parameters<ReplicacheIdeasMutators[K]>
  ) => {
    if (!rep) throw new Error("Replicache not initialized");
    // @ts-ignore
    const result = await rep.mutate[mutator](...args);
    
    // Get user ID for personal notifications
    const userId = localStorage.getItem('user_id') || 'anonymous';
    const backendUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
    fetch(`${backendUrl}/replicache/poke-user?userId=${userId}`, { method: 'POST' });
    
    return result;
  };

  useEffect(() => {
    let stop = false;
    let unsubIdeas: (() => void) | undefined;
    
    if (rep) {
      unsubIdeas = rep.subscribe(
        async tx => {
          const arr = await tx.scan({ prefix: "idea/" }).values().toArray();
          return arr as unknown as Idea[];
        },
        { onData: data => { if (!stop) setIdeas(data); } }
      );
    }
    
    return () => {
      stop = true;
      if (unsubIdeas) unsubIdeas();
    };
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

  if (!rep) return null;

  return (
    <ReplicacheIdeasContext.Provider value={{ ideas, rep, mutateWithPoke }}>
      {children}
    </ReplicacheIdeasContext.Provider>
  );
}

export function useReplicacheIdeas() {
  const context = useContext(ReplicacheIdeasContext);
  if (!context) {
    throw new Error("useReplicacheIdeas must be used within ReplicacheIdeasProvider");
  }
  return context;
}