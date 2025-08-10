"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { Replicache, MutatorDefs, WriteTransaction } from "replicache";
import {
  ListResponse,
  ListCreate,
  ListUpdate,
  TaskResponse,
  TaskCreate,
  TaskUpdate,
  ShoppingItemResponse,
  ShoppingItemCreate,
  ShoppingItemUpdate,
  Variant,
} from "./types";
import { getAccessToken } from "@/lib/auth-token";
import { useSharedSSE } from "@/app/shared/ReplicacheProviders";
import { useSyncStatus } from "@/app/shared/atoms/SyncStatusContext";

interface ReplicacheTodoMutators extends MutatorDefs {
  createList: (tx: WriteTransaction, args: ListCreate & { id: string }) => Promise<void>;
  updateList: (tx: WriteTransaction, args: { id: string } & ListUpdate) => Promise<void>;
  deleteList: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
  createTask: (tx: WriteTransaction, args: TaskCreate & { id: string; list_id: string }) => Promise<void>;
  updateTask: (tx: WriteTransaction, args: { id: string } & TaskUpdate) => Promise<void>;
  deleteTask: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
  createItem: (tx: WriteTransaction, args: ShoppingItemCreate & { id: string; list_id: string }) => Promise<void>;
  updateItem: (tx: WriteTransaction, args: { id: string } & ShoppingItemUpdate) => Promise<void>;
  deleteItem: (tx: WriteTransaction, args: { id: string }) => Promise<void>;
  reorderTasks: (tx: WriteTransaction, args: { list_id: string; task_ids: string[] }) => Promise<void>;
  reorderItems: (tx: WriteTransaction, args: { list_id: string; item_ids: string[] }) => Promise<void>;
}

interface ReplicacheTodoContextValue {
  lists: ListResponse[];
  tasks: TaskResponse[];
  items: ShoppingItemResponse[];
  rep: Replicache<ReplicacheTodoMutators> | null;
  mutateWithPoke: <K extends keyof ReplicacheTodoMutators>(mutator: K, ...args: Parameters<ReplicacheTodoMutators[K]>) => Promise<any>;
  resetReplicache: () => Promise<void>;
}

const ReplicacheTodoContext = createContext<ReplicacheTodoContextValue | null>(null);

export function ReplicacheTodoProvider({ children }: { children: ReactNode }) {
  const [rep, setRep] = useState<Replicache<ReplicacheTodoMutators> | null>(null);
  const [lists, setLists] = useState<ListResponse[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [items, setItems] = useState<ShoppingItemResponse[]>([]);
  const sharedSSE = useSharedSSE();
  const { reportOperationStart, reportOperationComplete, reportOperationFailure } = useSyncStatus();
  const allowPullsRef = useRef(false);
  const delayedPullTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      console.log('[Replicache] Creating new Replicache instance for todo');
      
      const r = new Replicache<ReplicacheTodoMutators>({
        name: "todo-replicache-flat",
        mutators: {
          createList: async (tx, { id, ...data }) => {
            const now = new Date().toISOString();
            await tx.set(`list/${id}`, {
              id,
              ...(data as any),
              created_at: now,
              updated_at: now,
            });
          },
          updateList: async (tx, { id, ...data }) => {
            const list = await tx.get(`list/${id}`);
            if (!list) return;
            const current = list as any;
            const preservedType = current.type; // never allow type to drift via updates
            await tx.set(`list/${id}`, {
              ...current,
              ...(data as any),
              type: preservedType,
              updated_at: new Date().toISOString(),
            });
          },
          deleteList: async (tx, { id }) => {
            await tx.del(`list/${id}`);
            // Optionally, delete all tasks/items for this list
            for await (const [k] of tx.scan({ prefix: "task/" }) as any) {
              const task = await tx.get(k);
              if (task && (task as any).list_id === id) await tx.del(k);
            }
            for await (const [k] of tx.scan({ prefix: "item/" }) as any) {
              const item = await tx.get(k);
              if (item && (item as any).list_id === id) await tx.del(k);
            }
          },
          createTask: async (tx, { id, list_id, ...data }) => {
            const now = new Date().toISOString();
            await tx.set(`task/${id}`, {
              id,
              list_id,
              ...(data as any),
              created_at: now,
              updated_at: now,
            });
          },
          updateTask: async (tx, { id, ...data }) => {
            const task = await tx.get(`task/${id}`);
            if (!task) return;
            await tx.set(`task/${id}`, {
              ...(task as any),
              ...(data as any),
              updated_at: new Date().toISOString(),
            });
          },
          deleteTask: async (tx, { id }) => {
            await tx.del(`task/${id}`);
          },
          createItem: async (tx, { id, list_id, ...data }) => {
            const now = new Date().toISOString();
            await tx.set(`item/${id}`, {
              id,
              list_id,
              ...(data as any),
              created_at: now,
              updated_at: now,
            });
          },
          updateItem: async (tx, { id, ...data }) => {
            const item = await tx.get(`item/${id}`);
            if (!item) return;
            await tx.set(`item/${id}`, {
              ...(item as any),
              ...(data as any),
              updated_at: new Date().toISOString(),
            });
          },
          deleteItem: async (tx, { id }) => {
            await tx.del(`item/${id}`);
          },
          reorderTasks: async (tx, { list_id, task_ids }) => {
            for (let i = 0; i < task_ids.length; i++) {
              const id = task_ids[i];
              const task = await tx.get(`task/${id}`);
              if (task && (task as any).list_id === list_id) {
                await tx.set(`task/${id}`, { ...(task as any), position: i });
              }
            }
          },
          reorderItems: async (tx, { list_id, item_ids }) => {
            for (let i = 0; i < item_ids.length; i++) {
              const id = item_ids[i];
              const item = await tx.get(`item/${id}`);
              if (item && (item as any).list_id === list_id) {
                await tx.set(`item/${id}`, { ...(item as any), position: i });
              }
            }
          },
        },
        pushURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/push?ns=todo`,
        pullURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/pull?ns=todo`,
        auth: authToken ? `Bearer ${authToken}` : '',
        // Keep manual control of pulls but allow immediate first pull
        pullInterval: null,
      });
      
      // Override pull method to control when pulls are allowed
      const originalPull = r.pull.bind(r);
      r.pull = async () => {
        if (!allowPullsRef.current) {
          console.log('[Replicache] Todo pull BLOCKED (not ready)');
          return Promise.resolve();
        }
        console.log('[Replicache] Todo pull ALLOWED');
        return originalPull();
      };
      
      setRep(r);
      
      // Enable pulls immediately and perform an initial pull
      allowPullsRef.current = true;
      console.log('[Replicache] Todo pulls ENABLED (immediate)');
      r.pull();
    }
    
    // Cleanup function
    return () => {
      if (rep) {
        console.log('[Replicache] Cleaning up Replicache instance for todo');
        rep.close();
      }
    };
  }, [authToken]); // Only depend on authToken, not rep

  // --- Helper: call mutation and then poke ---
  const mutateWithPoke = async <K extends keyof ReplicacheTodoMutators>(
    mutator: K,
    ...args: Parameters<ReplicacheTodoMutators[K]>
  ) => {
    if (!rep) throw new Error("Replicache not initialized");
    console.log('[Replicache] Mutator called:', mutator, args);

    // Normalize variant casing to match server expectations
    const normalizeVariantValue = (value: unknown): Variant => {
      const s = String(value ?? '').toLowerCase();
      if (s === 'outlined' || s === 'filled' || s === 'default') return s as Variant;
      return 'default';
    };
    const normalizeArgs = (input: any) => {
      if (!input || typeof input !== 'object') return input;
      const copy: any = { ...input };
      if ('variant' in copy) {
        copy.variant = normalizeVariantValue(copy.variant);
      }
      return copy;
    };
    const normalizedArgs = (args as any[]).map(normalizeArgs) as Parameters<ReplicacheTodoMutators[K]>;
    
    // Report operation start
    reportOperationStart();
    
    try {
      // @ts-ignore
      const result = await rep.mutate[mutator](...normalizedArgs);
      
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

        // Delay post-push pull slightly to avoid racing server commit
        if (delayedPullTimerRef.current) clearTimeout(delayedPullTimerRef.current);
        delayedPullTimerRef.current = setTimeout(async () => {
          if (!allowPullsRef.current) return;
          console.log('[Replicache] Delayed pull after push (1s)');
          try {
            await rep.pull();
          } catch (e) {
            console.error('[Replicache] Delayed pull failed', e);
          }
        }, 1000);
        
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
      console.log('[Replicache] Resetting todo data');
      try {
        // Close current instance
        rep.close();
        
        // Clear localStorage for this Replicache instance
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('replicache-todo-replicache-flat')) {
            localStorage.removeItem(key);
          }
        });
        
        // Reset state
        setRep(null);
        setLists([]);
        setTasks([]);
        setItems([]);
        
        console.log('[Replicache] Todo data cleared and instance reset');
      } catch (error) {
        console.log('[Replicache] Error clearing todo data:', error);
      }
    }
  };

  useEffect(() => {
    let stop = false;
    let unsubLists: (() => void) | undefined;
    let unsubTasks: (() => void) | undefined;
    let unsubItems: (() => void) | undefined;
    
    if (rep) {
      console.log('[Replicache] Setting up subscriptions');
       unsubLists = rep.subscribe(
         async tx => {
           const arr = await tx.scan({ prefix: "list/" }).values().toArray();
           // Sanitize lists to ensure type is either 'task' or 'shopping'
           const sanitized = (arr as any[]).map((l) => ({
             ...l,
             type: l.type === 'shopping' || l.type === 'task' ? l.type : 'task',
           }));
           return sanitized as unknown as ListResponse[];
         },
         { onData: data => { if (!stop) { setLists(data); console.log('[Replicache] lists onData', data.length); } } }
       );
      unsubTasks = rep.subscribe(
        async tx => {
          const arr = await tx.scan({ prefix: "task/" }).values().toArray();
          return arr as unknown as TaskResponse[];
        },
        { onData: data => { if (!stop) { setTasks(data); console.log('[Replicache] tasks onData', data.length); } } }
      );
      unsubItems = rep.subscribe(
        async tx => {
          const arr = await tx.scan({ prefix: "item/" }).values().toArray();
          return arr as unknown as ShoppingItemResponse[];
        },
        { onData: data => { if (!stop) { setItems(data); console.log('[Replicache] items onData', data.length); } } }
      );
    }
    
    return () => {
      stop = true;
      if (unsubLists) unsubLists();
      if (unsubTasks) unsubTasks();
      if (unsubItems) unsubItems();
      if (delayedPullTimerRef.current) clearTimeout(delayedPullTimerRef.current);
    };
  }, [rep]);

  // --- Use shared SSE instead of creating our own connection ---
  useEffect(() => {
    if (rep) {
      console.log('[Replicache] Setting up shared SSE listener for todo');
      
      const cleanup = sharedSSE.addListener((event) => {
        console.log('[Replicache] Shared SSE message received:', event);
        // Only trigger pull on 'sync' messages, not on 'ping' or 'connected'
        if (event === 'sync') {
          if (allowPullsRef.current) {
            console.log('[Replicache] Triggering pull due to sync message (ALLOWED)');
            // Cancel any pending delayed pull and pull immediately
            if (delayedPullTimerRef.current) {
              clearTimeout(delayedPullTimerRef.current);
              delayedPullTimerRef.current = null;
            }
            rep.pull();
          } else {
            console.log('[Replicache] Sync message received but pulls BLOCKED');
          }
        } else {
          console.log('[Replicache] Non-sync message ignored:', event);
        }
      });
      
      return cleanup;
    }
  }, [rep, sharedSSE]);

  if (!rep) {
    // For unauthenticated users, provide a fallback context
    return (
      <ReplicacheTodoContext.Provider value={{ 
        lists: [], 
        tasks: [], 
        items: [], 
        rep: null, 
        mutateWithPoke: async () => {
          throw new Error("Replicache not initialized - user not authenticated");
        },
        resetReplicache: async () => {
          console.log('[Replicache] Todo context not initialized, clearing localStorage only');
          // Clear localStorage for this Replicache instance even when not authenticated
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('replicache-todo-replicache-flat')) {
              localStorage.removeItem(key);
            }
          });
        },
      }}>
        {children}
      </ReplicacheTodoContext.Provider>
    );
  }

  return (
    <ReplicacheTodoContext.Provider value={{ lists, tasks, items, rep, mutateWithPoke, resetReplicache }}>
      {children}
    </ReplicacheTodoContext.Provider>
  );
}

export function useReplicacheTodo() {
  const context = useContext(ReplicacheTodoContext);
  if (!context) {
    throw new Error("useReplicacheTodo must be used within a ReplicacheTodoProvider");
  }
  return context;
}