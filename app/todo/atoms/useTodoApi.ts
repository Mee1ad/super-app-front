import { useState, useEffect, useCallback } from 'react';
import { 
  ListWithItems, 
  ListCreate, 
  ListUpdate, 
  TaskCreate, 
  TaskUpdate, 
  ShoppingItemCreate, 
  ShoppingItemUpdate,
  Variant 
} from './types';
import { 
  listsApi, 
  tasksApi, 
  itemsApi, 
  searchApi, 
  getListsWithItems 
} from './api';

export const useTodoApi = () => {
  const [lists, setLists] = useState<ListWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all lists with their items
  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getListsWithItems();
      setLists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadLists();
  }, [loadLists]);

  // List operations
  const createList = useCallback(async (type: "task" | "shopping", title: string, variant: Variant = "default") => {
    try {
      const newList = await listsApi.create({ type, title, variant });
      await loadLists(); // Reload to get the new list with items
      return newList;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create list');
      throw err;
    }
  }, [loadLists]);

  const updateList = useCallback(async (id: string, data: ListUpdate) => {
    try {
      const updatedList = await listsApi.update(id, data);
      setLists(prev => prev.map(list => 
        list.id === id ? { ...list, ...updatedList } : list
      ));
      return updatedList;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update list');
      throw err;
    }
  }, []);

  const deleteList = useCallback(async (id: string) => {
    try {
      await listsApi.delete(id);
      setLists(prev => prev.filter(list => list.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
      throw err;
    }
  }, []);

  // Task operations
  const createTask = useCallback(async (listId: string, data: TaskCreate) => {
    try {
      const newTask = await tasksApi.create(listId, data);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: [...(list.tasks || []), newTask] }
          : list
      ));
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (listId: string, taskId: string, data: TaskUpdate) => {
    try {
      const updatedTask = await tasksApi.update(listId, taskId, data);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: (list.tasks || []).map(task => 
              task.id === taskId ? updatedTask : task
            )}
          : list
      ));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (listId: string, taskId: string) => {
    try {
      await tasksApi.delete(listId, taskId);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: (list.tasks || []).filter(task => task.id !== taskId) }
          : list
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  }, []);

  const toggleTask = useCallback(async (listId: string, taskId: string) => {
    try {
      const updatedTask = await tasksApi.toggle(listId, taskId);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: (list.tasks || []).map(task => 
              task.id === taskId ? updatedTask : task
            )}
          : list
      ));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
      throw err;
    }
  }, []);

  const reorderTasks = useCallback(async (listId: string, taskIds: string[]) => {
    try {
      await tasksApi.reorder(listId, taskIds);
      // Update local state to reflect the new order
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: taskIds.map(id => 
              (list.tasks || []).find(task => task.id === id)
            ).filter(Boolean) as any[] }
          : list
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder tasks');
      throw err;
    }
  }, []);

  // Shopping item operations
  const createItem = useCallback(async (listId: string, data: ShoppingItemCreate) => {
    try {
      const newItem = await itemsApi.create(listId, data);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: [...(list.items || []), newItem] }
          : list
      ));
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (listId: string, itemId: string, data: ShoppingItemUpdate) => {
    try {
      const updatedItem = await itemsApi.update(listId, itemId, data);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: (list.items || []).map(item => 
              item.id === itemId ? updatedItem : item
            )}
          : list
      ));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (listId: string, itemId: string) => {
    try {
      await itemsApi.delete(listId, itemId);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: (list.items || []).filter(item => item.id !== itemId) }
          : list
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  }, []);

  const toggleItem = useCallback(async (listId: string, itemId: string) => {
    try {
      const updatedItem = await itemsApi.toggle(listId, itemId);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: (list.items || []).map(item => 
              item.id === itemId ? updatedItem : item
            )}
          : list
      ));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle item');
      throw err;
    }
  }, []);

  const reorderItems = useCallback(async (listId: string, itemIds: string[]) => {
    try {
      await itemsApi.reorder(listId, itemIds);
      // Update local state to reflect the new order
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: itemIds.map(id => 
              (list.items || []).find(item => item.id === id)
            ).filter(Boolean) as any[] }
          : list
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder items');
      throw err;
    }
  }, []);

  // Search
  const search = useCallback(async (query: string) => {
    try {
      return await searchApi.search(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search');
      throw err;
    }
  }, []);

  return {
    lists,
    loading,
    error,
    loadLists,
    createList,
    updateList,
    deleteList,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
    createItem,
    updateItem,
    deleteItem,
    toggleItem,
    reorderItems,
    search,
  };
}; 