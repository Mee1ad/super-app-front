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
            // @ts-ignore
            await tx.set(`list/${id}`, {
              id,
              ...data,
              created_at: now,
              updated_at: now,
            });
          },
          updateList: async (tx, { id, ...data }) => {
            // @ts-ignore
            const list = await tx.get(`list/${id}`);
            if (!list) return;
            // @ts-ignore
            await tx.set(`list/${id}`, {
              ...list,
              ...data,
              updated_at: new Date().toISOString(),
            });
          },
          deleteList: async (tx, { id }) => {
            await tx.del(`list/${id}`);
            // Optionally, delete all tasks/items for this list
            for await (const [k] of tx.scan({ prefix: "task/" })) {
              // @ts-ignore
              const task = await tx.get(k);
              if (task?.list_id === id) await tx.del(k);
            }
            for await (const [k] of tx.scan({ prefix: "item/" })) {
              // @ts-ignore
              const item = await tx.get(k);
              if (item?.list_id === id) await tx.del(k);
            }
          },
          createTask: async (tx, { id, list_id, ...data }) => {
            const now = new Date().toISOString();
            // @ts-ignore
            await tx.set(`task/${id}`, {
              id,
              list_id,
              ...data,
              created_at: now,
              updated_at: now,
            });
          },
          updateTask: async (tx, { id, ...data }) => {
            // @ts-ignore
            const task = await tx.get(`task/${id}`);
            if (!task) return;
            // @ts-ignore
            await tx.set(`task/${id}`, {
              ...task,
              ...data,
              updated_at: new Date().toISOString(),
            });
          },
          deleteTask: async (tx, { id }) => {
            await tx.del(`task/${id}`);
          },
          createItem: async (tx, { id, list_id, ...data }) => {
            const now = new Date().toISOString();
            // @ts-ignore
            await tx.set(`item/${id}`, {
              id,
              list_id,
              ...data,
              created_at: now,
              updated_at: now,
            });
          },
          updateItem: async (tx, { id, ...data }) => {
            // @ts-ignore
            const item = await tx.get(`item/${id}`);
            if (!item) return;
            // @ts-ignore
            await tx.set(`item/${id}`, {
              ...item,
              ...data,
              updated_at: new Date().toISOString(),
            });
          },
          deleteItem: async (tx, { id }) => {
            await tx.del(`item/${id}`);
          },
          reorderTasks: async (tx, { list_id, task_ids }) => {
            for (let i = 0; i < task_ids.length; i++) {
              const id = task_ids[i];
              // @ts-ignore
              const task = await tx.get(`task/${id}`);
              if (task && task.list_id === list_id) {
                // @ts-ignore
                await tx.set(`task/${id}`, { ...task, position: i });
              }
            }
          },
          reorderItems: async (tx, { list_id, item_ids }) => {
            for (let i = 0; i < item_ids.length; i++) {
              const id = item_ids[i];
              // @ts-ignore
              const item = await tx.get(`item/${id}`);
              if (item && item.list_id === list_id) {
                // @ts-ignore
                await tx.set(`item/${id}`, { ...item, position: i });
              }
            }
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
          console.log('[Replicache] Todo pull BLOCKED (not ready)');
          return Promise.resolve();
        }
        console.log('[Replicache] Todo pull ALLOWED');
        return originalPull();
      };
      
      setRep(r);
      
      // Only enable pulls after a longer delay and manual trigger
      setTimeout(() => {
        allowPullsRef.current = true;
        console.log('[Replicache] Todo pulls ENABLED');
        // Manually trigger one pull after enabling
        r.pull();
      }, 3000);
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
          return arr as unknown as ListResponse[];
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
        }
      }}>
        {children}
      </ReplicacheTodoContext.Provider>
    );
  }

  return (
    <ReplicacheTodoContext.Provider value={{ lists, tasks, items, rep, mutateWithPoke }}>
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