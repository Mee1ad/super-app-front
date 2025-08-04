import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useReplicacheFood } from './ReplicacheFoodContext';
import { FoodEntry, FoodEntryCreate, FoodEntryUpdate } from './types';

export const useFoodApi = () => {
  const { entries, mutateWithPoke } = useReplicacheFood();

  // Load entries (no-op, live via Replicache)
  const loadEntries = useCallback(async () => {}, []);

  // Create food entry
  const createEntry = useCallback(async (data: FoodEntryCreate) => {
    const id = uuidv4();
    const entryData = { id, ...data };
    await mutateWithPoke('createEntry', entryData);
    return { id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as FoodEntry;
  }, [mutateWithPoke]);

  // Update food entry
  const updateEntry = useCallback(async (id: string, data: FoodEntryUpdate) => {
    const updateData = { id, ...data };
    await mutateWithPoke('updateEntry', updateData);
  }, [mutateWithPoke]);

  // Delete food entry
  const deleteEntry = useCallback(async (id: string) => {
    const deleteData = { id };
    await mutateWithPoke('deleteEntry', deleteData);
  }, [mutateWithPoke]);

  return {
    entries,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  };
};