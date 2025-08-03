"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Replicache, MutatorDefs, WriteTransaction } from "replicache";
import { Idea } from "./types";
import { useSharedSSE } from "@/app/shared/ReplicacheProviders";

interface ReplicacheIdeasMutators extends MutatorDefs {
  createIdea: (tx: WriteTransaction, args: { id: string; title: string; description: string; category: string; tags: string[] }) => Promise<void>;
  updateIdea: (tx: WriteTransaction, args: { id: string; title?: string; description?: string; category?: string; tags?: string[] }) => Promise<void>;
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
  const sharedSSE = useSharedSSE();

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
    let stop = false;
    const unsub = rep.subscribe(
      async tx => {
        const arr = await tx.scan({ prefix: 'idea/' }).values().toArray();
        return arr as unknown as Idea[];
      },
      { onData: data => { if (!stop) setIdeas(data); } }
    );
    return () => {
      stop = true;
      unsub();
    };
  }, [rep]);

  // --- Use shared SSE instead of creating our own connection ---
  useEffect(() => {
    if (rep) {
      console.log('[Replicache] Setting up shared SSE listener for ideas');
      
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
    <ReplicacheIdeasContext.Provider value={{ ideas, rep, mutateWithPoke }}>
      {children}
    </ReplicacheIdeasContext.Provider>
  );
}

export function useReplicacheIdeas() {
  const context = useContext(ReplicacheIdeasContext);
  if (!context) {
    throw new Error("useReplicacheIdeas must be used within a ReplicacheIdeasProvider");
  }
  return context;
}