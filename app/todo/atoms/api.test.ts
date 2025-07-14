import { 
  listsApi, 
  tasksApi, 
  itemsApi, 
  searchApi, 
  getListsWithItems 
} from './api';
import { 
  ListCreate, 
  ListUpdate, 
  TaskCreate, 
  TaskUpdate, 
  ShoppingItemCreate, 
  ShoppingItemUpdate 
} from './types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the error handler
jest.mock('@/lib/error-handler', () => ({
  handleApiError: jest.fn(() => { throw new Error('API Error'); }),
}));

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Helper function to create mock Response objects
const createMockResponse = (data: unknown, contentType: string = 'application/json') => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: {
    get: (name: string) => name === 'content-type' ? contentType : null,
  },
  json: async () => data,
  text: async () => typeof data === 'string' ? data : JSON.stringify(data),
} as unknown as Response);

describe('Todo API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('listsApi', () => {
    it('should get all lists', async () => {
      const mockLists = [
        {
          id: '1',
          type: 'task' as const,
          title: 'Test List',
          variant: 'default' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      mockFetch.mockResolvedValueOnce(createMockResponse(mockLists));

      const result = await listsApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith('/lists', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockLists);
    });

    it('should create a new list', async () => {
      const createData: ListCreate = {
        type: 'task',
        title: 'New List',
        variant: 'default',
      };

      const mockResponse = {
        id: '1',
        type: 'task' as const,
        title: 'New List',
        variant: 'default' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await listsApi.create(createData);

      expect(mockFetch).toHaveBeenCalledWith('/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update a list', async () => {
      const updateData: ListUpdate = {
        title: 'Updated List',
        variant: 'outlined',
      };

      const mockResponse = {
        id: '1',
        type: 'task' as const,
        title: 'Updated List',
        variant: 'outlined' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await listsApi.update('1', updateData);

      expect(mockFetch).toHaveBeenCalledWith('/lists/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should delete a list', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse('List deleted successfully', 'text/plain'));

      const result = await listsApi.delete('1');

      expect(mockFetch).toHaveBeenCalledWith('/lists/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toBe('List deleted successfully');
    });
  });

  describe('tasksApi', () => {
    it('should get tasks by list', async () => {
      const mockTasks = [
        {
          id: '1',
          list_id: 'list1',
          title: 'Test Task',
          description: 'Test Description',
          checked: false,
          variant: 'default' as const,
          position: 0,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      mockFetch.mockResolvedValueOnce(createMockResponse(mockTasks));

      const result = await tasksApi.getByList('list1');

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/tasks', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockTasks);
    });

    it('should create a new task', async () => {
      const createData: TaskCreate = {
        title: 'New Task',
        description: 'New Description',
        checked: false,
        variant: 'default',
        position: 0,
      };

      const mockResponse = {
        id: '1',
        list_id: 'list1',
        title: 'New Task',
        description: 'New Description',
        checked: false,
        variant: 'default' as const,
        position: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await tasksApi.create('list1', createData);

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update a task', async () => {
      const updateData: TaskUpdate = {
        list_id: 'list1',
        title: 'Updated Task',
        description: 'Updated Description',
        checked: true,
        variant: 'outlined',
        position: 1,
      };

      const mockResponse = {
        id: '1',
        list_id: 'list1',
        title: 'Updated Task',
        description: 'Updated Description',
        checked: true,
        variant: 'outlined' as const,
        position: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await tasksApi.update('list1', '1', updateData);

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/tasks/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should delete a task', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse('Task deleted successfully', 'text/plain'));

      const result = await tasksApi.delete('list1', '1');

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/tasks/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toBe('Task deleted successfully');
    });

    it('should toggle a task', async () => {
      const mockResponse = {
        id: '1',
        list_id: 'list1',
        title: 'Test Task',
        description: 'Test Description',
        checked: true,
        variant: 'default' as const,
        position: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await tasksApi.toggle('list1', '1');

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/tasks/1/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should reorder tasks', async () => {
      const itemIds = ['1', '2', '3'];

      mockFetch.mockResolvedValueOnce(createMockResponse('Tasks reordered successfully', 'text/plain'));

      const result = await tasksApi.reorder('list1', itemIds);

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/tasks/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_ids: itemIds }),
      });
      expect(result).toBe('Tasks reordered successfully');
    });
  });

  describe('itemsApi', () => {
    it('should get shopping items by list', async () => {
      const mockItems = [
        {
          id: '1',
          list_id: 'list1',
          title: 'Test Item',
          url: 'https://example.com',
          price: '$10.00',
          source: 'Amazon',
          checked: false,
          variant: 'default' as const,
          position: 0,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      mockFetch.mockResolvedValueOnce(createMockResponse(mockItems));

      const result = await itemsApi.getByList('list1');

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/items', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockItems);
    });

    it('should create a new shopping item', async () => {
      const createData: ShoppingItemCreate = {
        title: 'New Item',
        url: 'https://example.com',
        price: '$20.00',
        source: 'Amazon',
        checked: false,
        variant: 'default',
        position: 0,
      };

      const mockResponse = {
        id: '1',
        list_id: 'list1',
        title: 'New Item',
        url: 'https://example.com',
        price: '$20.00',
        source: 'Amazon',
        checked: false,
        variant: 'default' as const,
        position: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await itemsApi.create('list1', createData);

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update a shopping item', async () => {
      const updateData: ShoppingItemUpdate = {
        list_id: 'list1',
        title: 'Updated Item',
        url: 'https://updated.com',
        price: '$30.00',
        source: 'eBay',
        checked: true,
        variant: 'outlined',
        position: 1,
      };

      const mockResponse = {
        id: '1',
        list_id: 'list1',
        title: 'Updated Item',
        url: 'https://updated.com',
        price: '$30.00',
        source: 'eBay',
        checked: true,
        variant: 'outlined' as const,
        position: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await itemsApi.update('list1', '1', updateData);

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/items/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should delete a shopping item', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse('Item deleted successfully', 'text/plain'));

      const result = await itemsApi.delete('list1', '1');

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/items/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toBe('Item deleted successfully');
    });

    it('should toggle a shopping item', async () => {
      const mockResponse = {
        id: '1',
        list_id: 'list1',
        title: 'Test Item',
        url: 'https://example.com',
        price: '$10.00',
        source: 'Amazon',
        checked: true,
        variant: 'default' as const,
        position: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await itemsApi.toggle('list1', '1');

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/items/1/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should reorder shopping items', async () => {
      const itemIds = ['1', '2', '3'];

      mockFetch.mockResolvedValueOnce(createMockResponse('Items reordered successfully', 'text/plain'));

      const result = await itemsApi.reorder('list1', itemIds);

      expect(mockFetch).toHaveBeenCalledWith('/lists/list1/items/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_ids: itemIds }),
      });
      expect(result).toBe('Items reordered successfully');
    });
  });

  describe('searchApi', () => {
    it('should search across all content', async () => {
      const mockSearchResponse = {
        lists: [
          {
            id: '1',
            type: 'task' as const,
            title: 'Test List',
            variant: 'default' as const,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          }
        ],
        tasks: [
          {
            id: '1',
            list_id: 'list1',
            title: 'Test Task',
            description: 'Test Description',
            checked: false,
            variant: 'default' as const,
            position: 0,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          }
        ],
        shopping_items: [
          {
            id: '1',
            list_id: 'list1',
            title: 'Test Item',
            url: 'https://example.com',
            price: '$10.00',
            source: 'Amazon',
            checked: false,
            variant: 'default' as const,
            position: 0,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          }
        ],
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockSearchResponse));

      const result = await searchApi.search('test');

      expect(mockFetch).toHaveBeenCalledWith('/api/search?q=test', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockSearchResponse);
    });
  });

  describe('getListsWithItems', () => {
    it('should get lists with their items', async () => {
      const mockLists = [
        {
          id: '1',
          type: 'task' as const,
          title: 'Task List',
          variant: 'default' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          type: 'shopping' as const,
          title: 'Shopping List',
          variant: 'default' as const,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      const mockTasks = [
        {
          id: '1',
          list_id: '1',
          title: 'Task 1',
          description: 'Description 1',
          checked: false,
          variant: 'default' as const,
          position: 0,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      const mockItems = [
        {
          id: '1',
          list_id: '2',
          title: 'Item 1',
          url: 'https://example.com',
          price: '$10.00',
          source: 'Amazon',
          checked: false,
          variant: 'default' as const,
          position: 0,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      mockFetch
        .mockResolvedValueOnce(createMockResponse(mockLists))
        .mockResolvedValueOnce(createMockResponse(mockTasks))
        .mockResolvedValueOnce(createMockResponse(mockItems));

      const result = await getListsWithItems();

      expect(result).toEqual([
        { ...mockLists[0], tasks: mockTasks },
        { ...mockLists[1], items: mockItems },
      ]);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors', async () => {
      const { handleApiError } = jest.requireMock('@/lib/error-handler');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null,
        },
        json: async () => ({}),
        text: async () => 'Not Found',
      } as unknown as Response);

      await expect(listsApi.getAll()).rejects.toThrow();

      expect(handleApiError).toHaveBeenCalled();
    });
  });
}); 