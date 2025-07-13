import {
  ListResponse,
  ListCreate,
  ListUpdate,
  TaskResponse,
  TaskCreate,
  TaskUpdate,
  ShoppingItemResponse,
  ShoppingItemCreate,
  ShoppingItemUpdate,
  SearchResponse,
  ListWithItems,
} from './types';
import { handleApiError } from '@/lib/error-handler';

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    // Handle empty responses (like DELETE operations)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text() as T;
    }
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, 'Network error: Unable to connect to the server');
    }
    throw error;
  }
}

// Lists API
export const listsApi = {
  getAll: (): Promise<ListResponse[]> => 
    apiRequest<ListResponse[]>('/api/lists'),

  create: (data: ListCreate): Promise<ListResponse> => 
    apiRequest<ListResponse>('/api/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: ListUpdate): Promise<ListResponse> => 
    apiRequest<ListResponse>(`/api/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<string> => 
    apiRequest<string>(`/api/lists/${id}`, {
      method: 'DELETE',
    }),
};

// Tasks API
export const tasksApi = {
  getByList: (listId: string): Promise<TaskResponse[]> => 
    apiRequest<TaskResponse[]>(`/api/lists/${listId}/tasks`),

  create: (listId: string, data: TaskCreate): Promise<TaskResponse> => 
    apiRequest<TaskResponse>(`/api/lists/${listId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (listId: string, taskId: string, data: TaskUpdate): Promise<TaskResponse> => 
    apiRequest<TaskResponse>(`/api/lists/${listId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (listId: string, taskId: string): Promise<string> => 
    apiRequest<string>(`/api/lists/${listId}/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  toggle: (listId: string, taskId: string): Promise<TaskResponse> => 
    apiRequest<TaskResponse>(`/api/lists/${listId}/tasks/${taskId}/toggle`, {
      method: 'PUT',
    }),

  reorder: (listId: string, itemIds: string[]): Promise<string> => 
    apiRequest<string>(`/api/lists/${listId}/tasks/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ item_ids: itemIds }),
    }),
};

// Shopping Items API
export const itemsApi = {
  getByList: (listId: string): Promise<ShoppingItemResponse[]> => 
    apiRequest<ShoppingItemResponse[]>(`/api/lists/${listId}/items`),

  create: (listId: string, data: ShoppingItemCreate): Promise<ShoppingItemResponse> => 
    apiRequest<ShoppingItemResponse>(`/api/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (listId: string, itemId: string, data: ShoppingItemUpdate): Promise<ShoppingItemResponse> => 
    apiRequest<ShoppingItemResponse>(`/api/lists/${listId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (listId: string, itemId: string): Promise<string> => 
    apiRequest<string>(`/api/lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
    }),

  toggle: (listId: string, itemId: string): Promise<ShoppingItemResponse> => 
    apiRequest<ShoppingItemResponse>(`/api/lists/${listId}/items/${itemId}/toggle`, {
      method: 'PUT',
    }),

  reorder: (listId: string, itemIds: string[]): Promise<string> => 
    apiRequest<string>(`/api/lists/${listId}/items/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ item_ids: itemIds }),
    }),
};

// Search API
export const searchApi = {
  search: (query: string): Promise<SearchResponse> => 
    apiRequest<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`),
};

// Helper function to get lists with their items
export const getListsWithItems = async (): Promise<ListWithItems[]> => {
  try {
    const lists = await listsApi.getAll();
    
    const listsWithItems = await Promise.all(
      lists.map(async (list) => {
        try {
          if (list.type === 'task') {
            const tasks = await tasksApi.getByList(list.id);
            return { ...list, tasks };
          } else {
            const items = await itemsApi.getByList(list.id);
            return { ...list, items };
          }
        } catch (error) {
          // If fetching items fails, return list without items
          console.warn(`Failed to fetch items for list ${list.id}:`, error);
          return list;
        }
      })
    );

    return listsWithItems;
  } catch (error) {
    console.error('Failed to fetch lists with items:', error);
    throw error;
  }
}; 