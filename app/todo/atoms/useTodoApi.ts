import { useState, useEffect, useCallback } from 'react';
import { 
  ListWithItems, 
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
import { showErrorToast } from '@/lib/error-handler';
import { TaskResponse, ShoppingItemResponse } from './types';
import { useAuth } from '@/app/auth/atoms/useAuth';
import { mockApi } from './mock-data';

export const useTodoApi = () => {
  const [lists, setLists] = useState<ListWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Load all lists with their items
  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      const data = isAuthenticated 
        ? await getListsWithItems()
        : await mockApi.getListsWithItems();
      setLists(data);
    } catch {
      showErrorToast('Failed to load lists');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initialize on mount - wait for auth loading to complete first
  useEffect(() => {
    if (!authLoading) {
      loadLists();
    }
  }, [loadLists, authLoading]);

  // Clear mock data when user logs in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      setLists([]);
      // Reload data from real API when user becomes authenticated
      loadLists();
    }
  }, [isAuthenticated, authLoading, loadLists]);

  // List operations
  const createList = useCallback(async (type: "task" | "shopping", title: string, variant: Variant = "default") => {
    try {
      const newList = isAuthenticated 
        ? await listsApi.create({ type, title, variant })
        : await mockApi.createList({ type, title, variant });
      await loadLists(); // Reload to get the new list with items
      return newList;
    } catch {
      showErrorToast('Failed to create list');
      throw new Error('Failed to create list');
    }
  }, [loadLists, isAuthenticated]);

  const updateList = useCallback(async (id: string, data: ListUpdate) => {
    try {
      const updatedList = isAuthenticated 
        ? await listsApi.update(id, data)
        : await mockApi.updateList(id, data);
      setLists(prev => prev.map(list => 
        list.id === id ? { ...list, ...updatedList } : list
      ));
      return updatedList;
    } catch {
      showErrorToast('Failed to update list');
      throw new Error('Failed to update list');
    }
  }, [isAuthenticated]);

  const deleteList = useCallback(async (id: string) => {
    try {
      if (isAuthenticated) {
        await listsApi.delete(id);
      } else {
        await mockApi.deleteList(id);
      }
      setLists(prev => prev.filter(list => list.id !== id));
      // No success toast
    } catch {
      showErrorToast('Failed to delete list');
      throw new Error('Failed to delete list');
    }
  }, [isAuthenticated]);

  // Task operations
  const createTask = useCallback(async (listId: string, data: TaskCreate) => {
    try {
      const newTask = isAuthenticated 
        ? await tasksApi.create(listId, data)
        : await mockApi.createTask(listId, data);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: [...(list.tasks || []), newTask] }
          : list
      ));
      return newTask;
    } catch {
      showErrorToast('Failed to create task');
      throw new Error('Failed to create task');
    }
  }, [isAuthenticated]);

  const updateTask = useCallback(async (listId: string, taskId: string, data: TaskUpdate) => {
    try {
      const updatedTask = isAuthenticated 
        ? await tasksApi.update(listId, taskId, { ...data, list_id: listId })
        : await mockApi.updateTask(listId, taskId, { ...data, list_id: listId });
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: (list.tasks || []).map(task => 
              task.id === taskId ? updatedTask : task
            )}
          : list
      ));
      return updatedTask;
    } catch {
      showErrorToast('Failed to update task');
      throw new Error('Failed to update task');
    }
  }, [isAuthenticated]);

  const deleteTask = useCallback(async (listId: string, taskId: string) => {
    try {
      if (isAuthenticated) {
        await tasksApi.delete(listId, taskId);
      } else {
        await mockApi.deleteTask(listId, taskId);
      }
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: (list.tasks || []).filter(task => task.id !== taskId) }
          : list
      ));
      // No success toast
    } catch {
      showErrorToast('Failed to delete task');
      throw new Error('Failed to delete task');
    }
  }, [isAuthenticated]);

  const toggleTask = useCallback(async (listId: string, taskId: string) => {
    try {
      const updatedTask = isAuthenticated 
        ? await tasksApi.toggle(listId, taskId)
        : await mockApi.toggleTask(listId, taskId);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: (list.tasks || []).map(task => 
              task.id === taskId ? updatedTask : task
            )}
          : list
      ));
      return updatedTask;
    } catch {
      showErrorToast('Failed to toggle task');
      throw new Error('Failed to toggle task');
    }
  }, [isAuthenticated]);

  const reorderTasks = useCallback(async (listId: string, taskIds: string[]) => {
    try {
      if (isAuthenticated) {
        await tasksApi.reorder(listId, taskIds);
      } else {
        await mockApi.reorderTasks(listId, taskIds);
      }
      // Update local state to reflect the new order
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: taskIds.map(id => 
              (list.tasks || []).find(task => task.id === id)
            ).filter(Boolean) as TaskResponse[] }
          : list
      ));
    } catch {
      showErrorToast('Failed to reorder tasks');
      throw new Error('Failed to reorder tasks');
    }
  }, [isAuthenticated]);

  // Shopping item operations
  const createItem = useCallback(async (listId: string, data: ShoppingItemCreate) => {
    try {
      const newItem = isAuthenticated 
        ? await itemsApi.create(listId, data)
        : await mockApi.createItem(listId, data);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: [...(list.items || []), newItem] }
          : list
      ));
      return newItem;
    } catch {
      showErrorToast('Failed to create item');
      throw new Error('Failed to create item');
    }
  }, [isAuthenticated]);

  const updateItem = useCallback(async (listId: string, itemId: string, data: ShoppingItemUpdate) => {
    try {
      const updatedItem = isAuthenticated 
        ? await itemsApi.update(listId, itemId, { ...data, list_id: listId })
        : await mockApi.updateItem(listId, itemId, { ...data, list_id: listId });
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: (list.items || []).map(item => 
              item.id === itemId ? updatedItem : item
            )}
          : list
      ));
      return updatedItem;
    } catch {
      showErrorToast('Failed to update item');
      throw new Error('Failed to update item');
    }
  }, [isAuthenticated]);

  const deleteItem = useCallback(async (listId: string, itemId: string) => {
    try {
      if (isAuthenticated) {
        await itemsApi.delete(listId, itemId);
      } else {
        await mockApi.deleteItem(listId, itemId);
      }
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: (list.items || []).filter(item => item.id !== itemId) }
          : list
      ));
      // No success toast
    } catch {
      showErrorToast('Failed to delete item');
      throw new Error('Failed to delete item');
    }
  }, [isAuthenticated]);

  const toggleItem = useCallback(async (listId: string, itemId: string) => {
    try {
      const updatedItem = isAuthenticated 
        ? await itemsApi.toggle(listId, itemId)
        : await mockApi.toggleItem(listId, itemId);
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: (list.items || []).map(item => 
              item.id === itemId ? updatedItem : item
            )}
          : list
      ));
      return updatedItem;
    } catch {
      showErrorToast('Failed to toggle item');
      throw new Error('Failed to toggle item');
    }
  }, [isAuthenticated]);

  const reorderItems = useCallback(async (listId: string, itemIds: string[]) => {
    try {
      if (isAuthenticated) {
        await itemsApi.reorder(listId, itemIds);
      } else {
        await mockApi.reorderItems(listId, itemIds);
      }
      // Update local state to reflect the new order
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: itemIds.map(id => 
              (list.items || []).find(item => item.id === id)
            ).filter(Boolean) as ShoppingItemResponse[] }
          : list
      ));
    } catch {
      showErrorToast('Failed to reorder items');
      throw new Error('Failed to reorder items');
    }
  }, [isAuthenticated]);

  // Search
  const search = useCallback(async (query: string) => {
    try {
      return isAuthenticated 
        ? await searchApi.search(query)
        : await mockApi.search(query);
    } catch {
      showErrorToast('Failed to search');
      throw new Error('Failed to search');
    }
  }, [isAuthenticated]);

  return {
    lists,
    loading,
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