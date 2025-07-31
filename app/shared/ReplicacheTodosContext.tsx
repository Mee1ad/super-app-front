"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Replicache, MutatorDefs, WriteTransaction } from "replicache";

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

// Replicache instance (singleton)
const rep = new Replicache<TodoMutators>({
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
});

// Context
const ReplicacheTodosContext = createContext<{
  todos: Todo[];
  rep: typeof rep;
} | null>(null);

export function ReplicacheTodosProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("lastTodos") ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let stop = false;
    let unsub: (() => void) | undefined;
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
    return () => {
      stop = true;
      if (unsub) unsub();
    };
  }, []);

  return (
    <ReplicacheTodosContext.Provider value={{ todos, rep }}>
      {children}
    </ReplicacheTodosContext.Provider>
  );
}

export function useReplicacheTodos() {
  const ctx = useContext(ReplicacheTodosContext);
  if (!ctx) throw new Error("useReplicacheTodos must be used within ReplicacheTodosProvider");
  return ctx;
}