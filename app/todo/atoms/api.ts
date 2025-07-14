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
import { getAccessToken } from '@/lib/auth-token';

// API base URL - change this for different environments
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api/v1' 
  : '';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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
        ...authHeaders(),
        ...(options.headers || {})
      } as HeadersInit,
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
    apiRequest<ListResponse[]>('/lists'),

  create: (data: ListCreate): Promise<ListResponse> => 
    apiRequest<ListResponse>('/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: ListUpdate): Promise<ListResponse> => 
    apiRequest<ListResponse>(`/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<string> => 
    apiRequest<string>(`/lists/${id}`, {
      method: 'DELETE',
    }),
};

// Tasks API
export const tasksApi = {
  getByList: (listId: string): Promise<TaskResponse[]> => 
    apiRequest<TaskResponse[]>(`/lists/${listId}/tasks`),

  create: (listId: string, data: TaskCreate): Promise<TaskResponse> => 
    apiRequest<TaskResponse>(`/lists/${listId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (listId: string, taskId: string, data: TaskUpdate): Promise<TaskResponse> => 
    apiRequest<TaskResponse>(`/lists/${listId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (listId: string, taskId: string): Promise<string> => 
    apiRequest<string>(`/lists/${listId}/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  toggle: (listId: string, taskId: string): Promise<TaskResponse> => 
    apiRequest<TaskResponse>(`/lists/${listId}/tasks/${taskId}/toggle`, {
      method: 'PUT',
    }),

  reorder: (listId: string, itemIds: string[]): Promise<string> => 
    apiRequest<string>(`/lists/${listId}/tasks/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ item_ids: itemIds }),
    }),
};

// Shopping Items API
export const itemsApi = {
  getByList: (listId: string): Promise<ShoppingItemResponse[]> => 
    apiRequest<ShoppingItemResponse[]>(`/lists/${listId}/items`),

  create: (listId: string, data: ShoppingItemCreate): Promise<ShoppingItemResponse> => 
    apiRequest<ShoppingItemResponse>(`/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (listId: string, itemId: string, data: ShoppingItemUpdate): Promise<ShoppingItemResponse> => 
    apiRequest<ShoppingItemResponse>(`/lists/${listId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (listId: string, itemId: string): Promise<string> => 
    apiRequest<string>(`/lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
    }),

  toggle: (listId: string, itemId: string): Promise<ShoppingItemResponse> => 
    apiRequest<ShoppingItemResponse>(`/lists/${listId}/items/${itemId}/toggle`, {
      method: 'PUT',
    }),

  reorder: (listId: string, itemIds: string[]): Promise<string> => 
    apiRequest<string>(`/lists/${listId}/items/reorder`, {
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