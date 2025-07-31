"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

// Flat Replicache keys: list/{id}, task/{id}, item/{id}

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

const rep = new Replicache<ReplicacheTodoMutators>({
  name: "todo-replicache-flat",
  mutators: {
    createList: async (tx, { id, ...data }) => {
      const now = new Date().toISOString();
      await tx.set(`list/${id}`, {
        id,
        ...data,
        created_at: now,
        updated_at: now,
      });
    },
    updateList: async (tx, { id, ...data }) => {
      const list = await tx.get<ListResponse>(`list/${id}`);
      if (!list) return;
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
        const task = await tx.get<TaskResponse>(k);
        if (task?.list_id === id) await tx.del(k);
      }
      for await (const [k] of tx.scan({ prefix: "item/" })) {
        const item = await tx.get<ShoppingItemResponse>(k);
        if (item?.list_id === id) await tx.del(k);
      }
    },
    createTask: async (tx, { id, list_id, ...data }) => {
      const now = new Date().toISOString();
      await tx.set(`task/${id}`, {
        id,
        list_id,
        ...data,
        created_at: now,
        updated_at: now,
      });
    },
    updateTask: async (tx, { id, ...data }) => {
      const task = await tx.get<TaskResponse>(`task/${id}`);
      if (!task) return;
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
      await tx.set(`item/${id}`, {
        id,
        list_id,
        ...data,
        created_at: now,
        updated_at: now,
      });
    },
    updateItem: async (tx, { id, ...data }) => {
      const item = await tx.get<ShoppingItemResponse>(`item/${id}`);
      if (!item) return;
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
        const task = await tx.get<TaskResponse>(`task/${id}`);
        if (task && task.list_id === list_id) {
          await tx.set(`task/${id}`, { ...task, position: i });
        }
      }
    },
    reorderItems: async (tx, { list_id, item_ids }) => {
      for (let i = 0; i < item_ids.length; i++) {
        const id = item_ids[i];
        const item = await tx.get<ShoppingItemResponse>(`item/${id}`);
        if (item && item.list_id === list_id) {
          await tx.set(`item/${id}`, { ...item, position: i });
        }
      }
    },
  },
});

// Context
interface ReplicacheTodoContextValue {
  lists: ListResponse[];
  tasks: TaskResponse[];
  items: ShoppingItemResponse[];
  rep: typeof rep;
}

const ReplicacheTodoContext = createContext<ReplicacheTodoContextValue | null>(null);

export function ReplicacheTodoProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<ListResponse[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [items, setItems] = useState<ShoppingItemResponse[]>([]);

  useEffect(() => {
    let stop = false;
    const unsubLists = rep.subscribe(
      async tx => {
        const arr = await tx.scan({ prefix: "list/" }).values().toArray();
        return arr as ListResponse[];
      },
      { onData: data => { if (!stop) setLists(data); } }
    );
    const unsubTasks = rep.subscribe(
      async tx => {
        const arr = await tx.scan({ prefix: "task/" }).values().toArray();
        return arr as TaskResponse[];
      },
      { onData: data => { if (!stop) setTasks(data); } }
    );
    const unsubItems = rep.subscribe(
      async tx => {
        const arr = await tx.scan({ prefix: "item/" }).values().toArray();
        return arr as ShoppingItemResponse[];
      },
      { onData: data => { if (!stop) setItems(data); } }
    );
    return () => {
      stop = true;
      unsubLists();
      unsubTasks();
      unsubItems();
    };
  }, []);

  return (
    <ReplicacheTodoContext.Provider value={{ lists, tasks, items, rep }}>
      {children}
    </ReplicacheTodoContext.Provider>
  );
}

export function useReplicacheTodo() {
  const ctx = useContext(ReplicacheTodoContext);
  if (!ctx) throw new Error("useReplicacheTodo must be used within ReplicacheTodoProvider");
  return ctx;
}