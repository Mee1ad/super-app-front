import { useCallback } from 'react';
import { useReplicacheFood } from './ReplicacheFoodContext';
import { FoodEntry, FoodEntryCreate, FoodEntryUpdate } from './types';

export const useFoodApi = () => {
  const { entries, mutateWithPoke } = useReplicacheFood();

  // Load entries (no-op, live via Replicache)
  const loadEntries = useCallback(async () => {}, []);

  // Create food entry
  const createEntry = useCallback(async (data: FoodEntryCreate) => {
    const id = `food_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await mutateWithPoke('createEntry', { ...data, id });
    return { id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as FoodEntry;
  }, [mutateWithPoke]);

  // Update food entry
  const updateEntry = useCallback(async (id: string, data: FoodEntryUpdate) => {
    await mutateWithPoke('updateEntry', { id, ...data });
  }, [mutateWithPoke]);

  // Delete food entry
  const deleteEntry = useCallback(async (id: string) => {
    await mutateWithPoke('deleteEntry', { id });
  }, [mutateWithPoke]);

  return {
    entries,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  };
};