import { useState, useEffect, useCallback } from 'react';
import { Idea, IdeaCreate, IdeaUpdate } from './types';
import { useReplicacheIdeas } from './ReplicacheIdeasContext';

export function useIdeasApi() {
  const { ideas, rep } = useReplicacheIdeas();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null); // You can implement pagination if needed

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadIdeas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsLoading(false);
  }, []);

  const createIdea = useCallback(async (idea: IdeaCreate): Promise<Idea | null> => {
    setIsCreating(true);
    setError(null);
    try {
      const id = `idea_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await rep.mutate.createIdea({ ...idea, id });
      return { id, ...idea, category_id: idea.category, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Idea;
    } catch (err) {
      setError('Failed to create idea');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [rep]);

  const updateIdea = useCallback(async (id: string, idea: IdeaUpdate): Promise<Idea | null> => {
    setIsUpdating(true);
    setError(null);
    try {
      await rep.mutate.updateIdea({ id, ...idea });
      return null;
    } catch (err) {
      setError('Failed to update idea');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [rep]);

  const deleteIdea = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);
    try {
      await rep.mutate.deleteIdea({ id });
      return true;
    } catch (err) {
      setError('Failed to delete idea');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [rep]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  return {
    ideas,
    meta,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    loadIdeas,
    createIdea,
    updateIdea,
    deleteIdea,
    clearError,
  };
} 