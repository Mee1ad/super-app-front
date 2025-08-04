import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useReplicacheIdeas } from './ReplicacheIdeasContext';
import { Idea, IdeaCreate, IdeaUpdate } from './types';

export const useIdeasApi = () => {
  const { ideas, mutateWithPoke } = useReplicacheIdeas();

  // Load ideas (no-op, live via Replicache)
  const loadIdeas = useCallback(async () => {}, []);

  // Create idea
  const createIdea = useCallback(async (data: IdeaCreate) => {
    const id = uuidv4();
    await mutateWithPoke('createIdea', { ...data, id });
    return { id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Idea;
  }, [mutateWithPoke]);

  // Update idea
  const updateIdea = useCallback(async (id: string, data: IdeaUpdate) => {
    await mutateWithPoke('updateIdea', { id, ...data });
  }, [mutateWithPoke]);

  // Delete idea
  const deleteIdea = useCallback(async (id: string) => {
    await mutateWithPoke('deleteIdea', { id });
  }, [mutateWithPoke]);

  return {
    ideas,
    loadIdeas,
    createIdea,
    updateIdea,
    deleteIdea,
  };
}; 