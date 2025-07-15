import { ListWithItems, TaskResponse, ShoppingItemResponse, ListResponse, TaskCreate, TaskUpdate, ShoppingItemCreate, ShoppingItemUpdate } from './types';
import { mockTasks, mockShoppingItems, generateId } from '@/app/api/todo/mock-data';

// Mock lists for non-authenticated users
export const mockLists: ListResponse[] = [
  {
    id: "demo-list-1",
    type: "task",
    title: "My Tasks",
    variant: "default",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "demo-list-2",
    type: "shopping",
    title: "Shopping List",
    variant: "default",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z"
  }
];

// Mock lists with items for non-authenticated users
export const mockListsWithItems: ListWithItems[] = [
  {
    ...mockLists[0],
    tasks: mockTasks
  },
  {
    ...mockLists[1],
    items: mockShoppingItems
  }
];

// Mock data storage for demo mode
let demoLists = [...mockListsWithItems];

// Mock API functions for demo mode
export const mockApi = {
  // List operations
  getListsWithItems: async (): Promise<ListWithItems[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...demoLists];
  },

  createList: async (data: { type: "task" | "shopping", title: string, variant: string }): Promise<ListResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newList: ListResponse = {
      id: generateId(),
      type: data.type,
      title: data.title,
      variant: data.variant as "default" | "outlined" | "filled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const newListWithItems: ListWithItems = {
      ...newList,
      tasks: data.type === 'task' ? [] : undefined,
      items: data.type === 'shopping' ? [] : undefined
    };
    
    demoLists.push(newListWithItems);
    return newList;
  },

  updateList: async (id: string, data: { title?: string | null, variant?: string | null }): Promise<ListResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const listIndex = demoLists.findIndex(list => list.id === id);
    if (listIndex === -1) throw new Error('List not found');
    
    const updatedList = { 
      ...demoLists[listIndex], 
      title: data.title ?? demoLists[listIndex].title,
      variant: (data.variant as "default" | "outlined" | "filled") || demoLists[listIndex].variant,
      updated_at: new Date().toISOString() 
    };
    demoLists[listIndex] = updatedList;
    return updatedList;
  },

  deleteList: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    demoLists = demoLists.filter(list => list.id !== id);
  },

  // Task operations
  createTask: async (listId: string, data: TaskCreate): Promise<TaskResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newTask: TaskResponse = {
      id: generateId(),
      list_id: listId,
      title: data.title,
      description: data.description || null,
      checked: data.checked || false,
      variant: data.variant || 'default',
      position: data.position || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const listIndex = demoLists.findIndex(list => list.id === listId && list.type === 'task');
    if (listIndex !== -1) {
      demoLists[listIndex].tasks = [...(demoLists[listIndex].tasks || []), newTask];
    }
    
    return newTask;
  },

  updateTask: async (listId: string, taskId: string, data: TaskUpdate): Promise<TaskResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const listIndex = demoLists.findIndex(list => list.id === listId && list.type === 'task');
    if (listIndex === -1) throw new Error('List not found');
    
    const taskIndex = demoLists[listIndex].tasks?.findIndex(task => task.id === taskId);
    if (taskIndex === undefined || taskIndex === -1) throw new Error('Task not found');
    
    const updatedTask: TaskResponse = { 
      ...demoLists[listIndex].tasks![taskIndex], 
      ...(data.title !== undefined && data.title !== null && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.checked !== undefined && data.checked !== null && { checked: data.checked }),
      ...(data.variant !== undefined && data.variant !== null && { variant: data.variant }),
      ...(data.position !== undefined && data.position !== null && { position: data.position }),
      updated_at: new Date().toISOString() 
    };
    demoLists[listIndex].tasks![taskIndex] = updatedTask;
    
    return updatedTask;
  },

  deleteTask: async (listId: string, taskId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const listIndex = demoLists.findIndex(list => list.id === listId && list.type === 'task');
    if (listIndex !== -1 && demoLists[listIndex].tasks) {
      demoLists[listIndex].tasks = demoLists[listIndex].tasks!.filter(task => task.id !== taskId);
    }
  },

  toggleTask: async (listId: string, taskId: string): Promise<TaskResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const listIndex = demoLists.findIndex(list => list.id === listId && list.type === 'task');
    if (listIndex === -1) throw new Error('List not found');
    
    const taskIndex = demoLists[listIndex].tasks?.findIndex(task => task.id === taskId);
    if (taskIndex === undefined || taskIndex === -1) throw new Error('Task not found');
    
    const updatedTask = { 
      ...demoLists[listIndex].tasks![taskIndex], 
      checked: !demoLists[listIndex].tasks![taskIndex].checked,
      updated_at: new Date().toISOString() 
    };
    demoLists[listIndex].tasks![taskIndex] = updatedTask;
    
    return updatedTask;
  },

  reorderTasks: async (listId: string, taskIds: string[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const listIndex = demoLists.findIndex(list => list.id === listId && list.type === 'task');
    if (listIndex !== -1 && demoLists[listIndex].tasks) {
      const reorderedTasks = taskIds.map(id => 
        demoLists[listIndex].tasks!.find(task => task.id === id)
      ).filter(Boolean) as TaskResponse[];
      demoLists[listIndex].tasks = reorderedTasks;
    }
  },

  // Shopping item operations
  createItem: async (listId: string, data: ShoppingItemCreate): Promise<ShoppingItemResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newItem: ShoppingItemResponse = {
      id: generateId(),
      list_id: listId,
      title: data.title,
      url: data.url || null,
      price: data.price || null,
      source: data.source || null,
      checked: data.checked || false,
      variant: data.variant || 'default',
      position: data.position || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const listIndex = demoLists.findIndex(list => list.id === listId && list.type === 'shopping');
    if (listIndex !== -1) {
      demoLists[listIndex].items = [...(demoLists[listIndex].items || []), newItem];
    }
    
    return newItem;
  },

  updateItem: async (listId: string, itemId: string, data: ShoppingItemUpdate): Promise<ShoppingItemResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const listIndex = demoLists.findIndex(list => list.id === listId && list.type === 'shopping');
    if (listIndex === -1) throw new Error('List not found');
    
    const itemIndex = demoLists[listIndex].items?.findIndex(item => item.id === itemId);
    if (itemIndex === undefined || itemIndex === -1) throw new Error('Item not found');
    
    const updatedItem: ShoppingItemResponse = { 
      ...demoLists[listIndex].items![itemIndex], 
      ...(data.title !== undefined && data.title !== null && { title: data.title }),
      ...(data.url !== undefined && { url: data.url }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.source !== undefined && { source: data.source }),
      ...(data.checked !== undefined && data.checked !== null && { checked: data.checked }),
      ...(data.variant !== undefined && data.variant !== null && { variant: data.variant }),
      ...(data.position !== undefined && data.position !== null && { position: data.position }),
      updated_at: new Date().toISOString() 
    };
    demoLists[listIndex].items![itemIndex] = updatedItem;
    
    return updatedItem;
  },

  deleteItem: async (listId: string, itemId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const listIndex = demoLists.findIndex(list => list.id === listId && list.type === 'shopping');
    if (listIndex !== -1 && demoLists[listIndex].items) {
      demoLists[listIndex].items = demoLists[listIndex].items!.filter(item => item.id !== itemId);
    }
  },

  toggleItem: async (listId: string, itemId: string): Promise<ShoppingItemResponse> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const listIndex = demoLists.findIndex(list => list.id === listId && list.type === 'shopping');
    if (listIndex === -1) throw new Error('List not found');
    
    const itemIndex = demoLists[listIndex].items?.findIndex(item => item.id === itemId);
    if (itemIndex === undefined || itemIndex === -1) throw new Error('Item not found');
    
    const updatedItem = { 
      ...demoLists[listIndex].items![itemIndex], 
      checked: !demoLists[listIndex].items![itemIndex].checked,
      updated_at: new Date().toISOString() 
    };
    demoLists[listIndex].items![itemIndex] = updatedItem;
    
    return updatedItem;
  },

  reorderItems: async (listId: string, itemIds: string[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const listIndex = demoLists.findIndex(list => list.id === listId && list.type === 'shopping');
    if (listIndex !== -1 && demoLists[listIndex].items) {
      const reorderedItems = itemIds.map(id => 
        demoLists[listIndex].items!.find(item => item.id === id)
      ).filter(Boolean) as ShoppingItemResponse[];
      demoLists[listIndex].items = reorderedItems;
    }
  },

  // Search
  search: async (query: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const queryLower = query.toLowerCase();
    
    const matchingLists = demoLists.filter(list => 
      list.title.toLowerCase().includes(queryLower)
    );
    
    const matchingTasks = demoLists
      .filter(list => list.type === 'task')
      .flatMap(list => list.tasks || [])
      .filter(task => 
        task.title.toLowerCase().includes(queryLower) ||
        (task.description && task.description.toLowerCase().includes(queryLower))
      );
    
    const matchingItems = demoLists
      .filter(list => list.type === 'shopping')
      .flatMap(list => list.items || [])
      .filter(item => 
        item.title.toLowerCase().includes(queryLower) ||
        (item.url && item.url.toLowerCase().includes(queryLower)) ||
        (item.price && item.price.toLowerCase().includes(queryLower)) ||
        (item.source && item.source.toLowerCase().includes(queryLower))
      );
    
    return {
      lists: matchingLists,
      tasks: matchingTasks,
      shopping_items: matchingItems
    };
  }
}; 