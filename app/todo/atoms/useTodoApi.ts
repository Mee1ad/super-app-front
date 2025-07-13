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
import { showSuccessToast, showErrorToast } from '@/lib/error-handler';
import { TaskResponse, ShoppingItemResponse } from './types';

export const useTodoApi = () => {
  const [lists, setLists] = useState<ListWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all lists with their items
  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getListsWithItems();
      setLists(data);
    } catch {
      showErrorToast('Failed to load lists');
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
      showSuccessToast('List Created', `${type === 'task' ? 'Task' : 'Shopping'} list "${title}" created successfully`);
      return newList;
    } catch {
      showErrorToast('Failed to create list');
      throw new Error('Failed to create list');
    }
  }, [loadLists]);

  const updateList = useCallback(async (id: string, data: ListUpdate) => {
    try {
      const updatedList = await listsApi.update(id, data);
      setLists(prev => prev.map(list => 
        list.id === id ? { ...list, ...updatedList } : list
      ));
      showSuccessToast('List Updated', 'List updated successfully');
      return updatedList;
    } catch {
      showErrorToast('Failed to update list');
      throw new Error('Failed to update list');
    }
  }, []);

  const deleteList = useCallback(async (id: string) => {
    try {
      await listsApi.delete(id);
      setLists(prev => prev.filter(list => list.id !== id));
      showSuccessToast('List Deleted', 'List deleted successfully');
    } catch {
      showErrorToast('Failed to delete list');
      throw new Error('Failed to delete list');
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
      showSuccessToast('Task Created', `Task "${data.title}" created successfully`);
      return newTask;
    } catch {
      showErrorToast('Failed to create task');
      throw new Error('Failed to create task');
    }
  }, []);

  const updateTask = useCallback(async (listId: string, taskId: string, data: TaskUpdate) => {
    try {
      const updatedTask = await tasksApi.update(listId, taskId, { ...data, list_id: listId });
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'task'
          ? { ...list, tasks: (list.tasks || []).map(task => 
              task.id === taskId ? updatedTask : task
            )}
          : list
      ));
      showSuccessToast('Task Updated', 'Task updated successfully');
      return updatedTask;
    } catch {
      showErrorToast('Failed to update task');
      throw new Error('Failed to update task');
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
      showSuccessToast('Task Deleted', 'Task deleted successfully');
    } catch {
      showErrorToast('Failed to delete task');
      throw new Error('Failed to delete task');
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
      const status = updatedTask.checked ? 'completed' : 'incomplete';
      showSuccessToast('Task Updated', `Task marked as ${status}`);
      return updatedTask;
    } catch {
      showErrorToast('Failed to toggle task');
      throw new Error('Failed to toggle task');
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
            ).filter(Boolean) as TaskResponse[] }
          : list
      ));
      showSuccessToast('Tasks Reordered', 'Tasks reordered successfully');
    } catch {
      showErrorToast('Failed to reorder tasks');
      throw new Error('Failed to reorder tasks');
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
      showSuccessToast('Item Added', `Shopping item "${data.title}" added successfully`);
      return newItem;
    } catch {
      showErrorToast('Failed to create item');
      throw new Error('Failed to create item');
    }
  }, []);

  const updateItem = useCallback(async (listId: string, itemId: string, data: ShoppingItemUpdate) => {
    try {
      const updatedItem = await itemsApi.update(listId, itemId, { ...data, list_id: listId });
      setLists(prev => prev.map(list => 
        list.id === listId && list.type === 'shopping'
          ? { ...list, items: (list.items || []).map(item => 
              item.id === itemId ? updatedItem : item
            )}
          : list
      ));
      showSuccessToast('Item Updated', 'Shopping item updated successfully');
      return updatedItem;
    } catch {
      showErrorToast('Failed to update item');
      throw new Error('Failed to update item');
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
      showSuccessToast('Item Deleted', 'Shopping item deleted successfully');
    } catch {
      showErrorToast('Failed to delete item');
      throw new Error('Failed to delete item');
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
      const status = updatedItem.checked ? 'purchased' : 'not purchased';
      showSuccessToast('Item Updated', `Item marked as ${status}`);
      return updatedItem;
    } catch {
      showErrorToast('Failed to toggle item');
      throw new Error('Failed to toggle item');
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
            ).filter(Boolean) as ShoppingItemResponse[] }
          : list
      ));
      showSuccessToast('Items Reordered', 'Shopping items reordered successfully');
    } catch {
      showErrorToast('Failed to reorder items');
      throw new Error('Failed to reorder items');
    }
  }, []);

  // Search
  const search = useCallback(async (query: string) => {
    try {
      return await searchApi.search(query);
    } catch {
      showErrorToast('Failed to search');
      throw new Error('Failed to search');
    }
  }, []);

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