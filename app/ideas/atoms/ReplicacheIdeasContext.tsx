"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { Replicache, MutatorDefs, WriteTransaction } from "replicache";
import { Idea } from "./types";
import { useSharedSSE } from "@/app/shared/ReplicacheProviders";
import { useSyncStatus } from "@/app/shared/atoms/SyncStatusContext";

interface ReplicacheIdeasMutators extends MutatorDefs {
  createIdea: (tx: WriteTransaction, args: { id: string; title: string; description: string; category: string; tags: string[] }) => Promise<void>;
  updateIdea: (tx: WriteTransaction, args: { id: string; title?: string; description?: string; category?: string; tags?: string[] }) => Promise<void>;
  deleteIdea: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
}

interface ReplicacheIdeasContextValue {
  ideas: Idea[];
  rep: Replicache<ReplicacheIdeasMutators> | null;
  mutateWithPoke: <K extends keyof ReplicacheIdeasMutators>(mutator: K, ...args: Parameters<ReplicacheIdeasMutators[K]>) => Promise<any>;
  resetReplicache: () => Promise<void>;
}

const ReplicacheIdeasContext = createContext<ReplicacheIdeasContextValue | null>(null);

export function ReplicacheIdeasProvider({ children }: { children: ReactNode }) {
  const [rep, setRep] = useState<Replicache<ReplicacheIdeasMutators> | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const sharedSSE = useSharedSSE();
  const { reportOperationStart, reportOperationComplete, reportOperationFailure } = useSyncStatus();
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
      console.log('[Replicache] Creating new Replicache instance for ideas');
      
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
        auth: authToken ? `Bearer ${authToken}` : '',
        // Prevent auto-sync on initialization
        pullInterval: null,
      });
      
      // Override pull method to control when pulls are allowed
      const originalPull = r.pull.bind(r);
      r.pull = async () => {
        if (!allowPullsRef.current) {
          console.log('[Replicache] Ideas pull blocked (not ready)');
          return;
        }
        console.log('[Replicache] Ideas pull requested');
        return originalPull();
      };
      
      setRep(r);
      
      // Allow pulls after a short delay to prevent initialization pulls
      setTimeout(() => {
        allowPullsRef.current = true;
        console.log('[Replicache] Ideas pulls enabled');
      }, 2000);
    }
    
    // Cleanup function
    return () => {
      if (rep) {
        console.log('[Replicache] Cleaning up Replicache instance for ideas');
        rep.close();
      }
    };
  }, [authToken]); // Only depend on authToken, not rep

  // --- Helper: call mutation and then poke ---
  const mutateWithPoke = async <K extends keyof ReplicacheIdeasMutators>(
    mutator: K,
    ...args: Parameters<ReplicacheIdeasMutators[K]>
  ) => {
    if (!rep) throw new Error("Replicache not initialized");
    console.log('[Replicache] Mutator called:', mutator, args);
    
    // Report operation start
    reportOperationStart();
    
    try {
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
      
      try {
        await fetch(`${backendUrl}/replicache/poke-user?userId=${userId}`, { 
          method: 'POST',
          headers
        });
        reportOperationComplete();
      } catch (error) {
        console.error('[Replicache] Poke failed:', error);
        reportOperationFailure();
      }
      
      return result;
    } catch (error) {
      console.error('[Replicache] Mutation failed:', error);
      reportOperationFailure();
      throw error;
    }
  };

  // Reset function to clear local data
  const resetReplicache = async () => {
    if (rep) {
      console.log('[Replicache] Resetting ideas data');
      try {
        // Close current instance
        rep.close();
        
        // Clear localStorage for this Replicache instance
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('replicache-ideas-replicache')) {
            localStorage.removeItem(key);
          }
        });
        
        // Reset state
        setRep(null);
        setIdeas([]);
        
        console.log('[Replicache] Ideas data cleared and instance reset');
      } catch (error) {
        console.log('[Replicache] Error clearing ideas data:', error);
      }
    }
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

  if (!rep) {
    // For unauthenticated users, provide a fallback context
    return (
      <ReplicacheIdeasContext.Provider value={{ 
        ideas: [], 
        rep: null, 
        mutateWithPoke: async () => {
          throw new Error("Replicache not initialized - user not authenticated");
        },
        resetReplicache: async () => {
          console.log('[Replicache] Ideas context not initialized, clearing localStorage only');
          // Clear localStorage for this Replicache instance even when not authenticated
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('replicache-ideas-replicache')) {
              localStorage.removeItem(key);
            }
          });
        }
      }}>
        {children}
      </ReplicacheIdeasContext.Provider>
    );
  }

  return (
    <ReplicacheIdeasContext.Provider value={{ ideas, rep, mutateWithPoke, resetReplicache }}>
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