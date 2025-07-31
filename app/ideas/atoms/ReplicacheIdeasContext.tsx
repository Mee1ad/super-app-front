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

const rep = new Replicache<ReplicacheIdeasMutators>({
  name: "ideas-replicache",
  mutators: {
    createIdea: async (tx, { id, title, description, category, tags }) => {
      const now = new Date().toISOString();
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
    updateIdea: async (tx, { id, ...data }) => {
      const idea = await tx.get<Idea>(`idea/${id}`);
      if (!idea) return;
      await tx.set(`idea/${id}`, {
        ...idea,
        ...data,
        category_id: data.category || idea.category_id,
        updated_at: new Date().toISOString(),
      });
    },
    deleteIdea: async (tx, { id }) => {
      await tx.del(`idea/${id}`);
    },
  },
});

interface ReplicacheIdeasContextValue {
  ideas: Idea[];
  rep: typeof rep;
}

const ReplicacheIdeasContext = createContext<ReplicacheIdeasContextValue | null>(null);

export function ReplicacheIdeasProvider({ children }: { children: ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    let stop = false;
    const unsubIdeas = rep.subscribe(
      async tx => {
        const arr = await tx.scan({ prefix: "idea/" }).values().toArray();
        return arr as Idea[];
      },
      { onData: data => { if (!stop) setIdeas(data); } }
    );
    return () => {
      stop = true;
      unsubIdeas();
    };
  }, []);

  return (
    <ReplicacheIdeasContext.Provider value={{ ideas, rep }}>
      {children}
    </ReplicacheIdeasContext.Provider>
  );
}

export function useReplicacheIdeas() {
  const ctx = useContext(ReplicacheIdeasContext);
  if (!ctx) throw new Error("useReplicacheIdeas must be used within ReplicacheIdeasProvider");
  return ctx;
}