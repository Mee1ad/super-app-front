"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Replicache, MutatorDefs, WriteTransaction } from "replicache";
import { getAccessToken } from "@/lib/auth-token";

// Types
export type Todo = {
  id: string;
  text: string;
};

type AddTodoArgs = { id: string; text: string };
type UpdateTodoArgs = { id: string; text: string };
type DeleteTodoArgs = { id: string };

interface TodoMutators extends MutatorDefs {
  addTodo: (tx: WriteTransaction, args: AddTodoArgs) => Promise<void>;
  updateTodo: (tx: WriteTransaction, args: UpdateTodoArgs) => Promise<void>;
  deleteTodo: (tx: WriteTransaction, args: DeleteTodoArgs) => Promise<void>;
}

interface ReplicacheTodosContextValue {
  todos: Todo[];
  rep: Replicache<TodoMutators> | null;
  mutateWithPoke: <K extends keyof TodoMutators>(mutator: K, ...args: Parameters<TodoMutators[K]>) => Promise<any>;
}

const ReplicacheTodosContext = createContext<ReplicacheTodosContextValue | null>(null);

export function ReplicacheTodosProvider({ children }: { children: ReactNode }) {
  const [rep, setRep] = useState<Replicache<TodoMutators> | null>(null);
  useEffect(() => {
    if (!rep && typeof window !== "undefined") {
      const pushURL = `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/push`;
      const pullURL = `${process.env.NEXT_PUBLIC_BASE_API_URL}/replicache/pull`;
      const r = new Replicache<TodoMutators>({
        name: "test-replicache-todo",
        mutators: {
          addTodo: async (tx, { id, text }) => {
            await tx.set(id, { text });
          },
          updateTodo: async (tx, { id, text }) => {
            await tx.set(id, { text });
          },
          deleteTodo: async (tx, { id }) => {
            await tx.del(id);
          },
        },
        pushURL,
        pullURL,
        auth: localStorage.getItem('auth_access_token') ? `Bearer ${localStorage.getItem('auth_access_token')}` : '',
      });
      setRep(r);
    }
  }, [rep]);

  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("lastTodos") ?? "[]");
    } catch {
      return [];
    }
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // --- Helper: call mutation and then poke ---
  const mutateWithPoke = async <K extends keyof TodoMutators>(
    mutator: K,
    ...args: Parameters<TodoMutators[K]>
  ) => {
    if (!rep) throw new Error("Replicache not initialized");
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
    if (rep) {
      // Note: Replicache v15+ uses different event handling
      // These properties may not exist in the current version
    }
  }, [rep]);

  useEffect(() => {
    let stop = false;
    let unsub: (() => void) | undefined;
    if (rep) {
      unsub = rep.subscribe(
        async tx => {
          const list = await tx.scan({ prefix: "todo/" }).entries().toArray();
          return list.map(([k, v]) => ({ id: k as string, ...(v as { text: string }) }));
        },
        {
          onData: (data: Todo[]) => {
            if (!stop) setTodos(data);
            localStorage.setItem("lastTodos", JSON.stringify(data));
          },
        }
      );
    }
    return () => {
      stop = true;
      if (unsub) unsub();
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

  return (
    <ReplicacheTodosContext.Provider value={{ todos, rep, mutateWithPoke }}>
      {children}
    </ReplicacheTodosContext.Provider>
  );
}

export function useReplicacheTodos() {
  const ctx = useContext(ReplicacheTodosContext);
  if (!ctx) throw new Error("useReplicacheTodos must be used within ReplicacheTodosProvider");
  return ctx;
}