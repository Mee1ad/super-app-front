import { useCallback } from 'react';
import { useReplicacheFood } from './ReplicacheFoodContext';
import { FoodEntry, FoodEntryCreate, FoodEntryUpdate } from './types';

export const useFoodApi = () => {
  const { entries, rep } = useReplicacheFood();

  // Load entries (no-op, live via Replicache)
  const loadEntries = useCallback(async () => {}, []);

  // Create food entry
  const createEntry = useCallback(async (data: FoodEntryCreate) => {
    const id = `food_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await rep.mutate.createEntry({ ...data, id });
    return { id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as FoodEntry;
  }, [rep]);

  // Update food entry
  const updateEntry = useCallback(async (id: string, data: FoodEntryUpdate) => {
    await rep.mutate.updateEntry({ id, ...data });
  }, [rep]);

  // Delete food entry
  const deleteEntry = useCallback(async (id: string) => {
    await rep.mutate.deleteEntry({ id });
  }, [rep]);

  return {
    entries,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  };
};