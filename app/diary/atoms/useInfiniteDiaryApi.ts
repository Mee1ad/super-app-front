import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useReplicacheDiary } from './ReplicacheDiaryContext';
import { DiaryEntry, DiaryEntryCreate, DiaryEntryUpdate } from './types';

export const useInfiniteDiaryApi = () => {
  const { entries, mutateWithPoke } = useReplicacheDiary();

  // Load entries (no-op, live via Replicache)
  const loadEntries = useCallback(async () => {}, []);

  // Create diary entry
  const createEntry = useCallback(async (data: DiaryEntryCreate) => {
    const id = uuidv4();
    try {
      await mutateWithPoke('createEntry', { ...data, id });
      return { id, ...data, images: data.images || [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as DiaryEntry;
    } catch (error) {
      console.error('Failed to create diary entry:', error);
      throw error;
    }
  }, [mutateWithPoke]);

  // Update diary entry
  const updateEntry = useCallback(async (id: string, data: DiaryEntryUpdate) => {
    await mutateWithPoke('updateEntry', { id, ...data });
  }, [mutateWithPoke]);

  // Delete diary entry
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