import {
  taskResponseToTaskItemProps,
  shoppingItemResponseToShoppingItemProps,
  taskItemPropsToTaskCreate,
  shoppingItemPropsToShoppingItemCreate,
} from './adapters';
import { TaskResponse, ShoppingItemResponse } from './types';
import { TaskItemProps } from './TaskItem';
import { ShoppingItemProps } from './ShoppingItem';

describe('Todo Adapters', () => {
  describe('taskResponseToTaskItemProps', () => {
    it('should convert TaskResponse to TaskItemProps', () => {
      const taskResponse: TaskResponse = {
        id: '1',
        list_id: 'list1',
        title: 'Test Task',
        description: 'Test Description',
        checked: false,
        variant: 'default',
        position: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const result = taskResponseToTaskItemProps(taskResponse);

      expect(result).toEqual({
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        checked: false,
        variant: 'default',
      });
    });

    it('should handle null description', () => {
      const taskResponse: TaskResponse = {
        id: '1',
        list_id: 'list1',
        title: 'Test Task',
        description: null,
        checked: true,
        variant: 'outlined',
        position: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const result = taskResponseToTaskItemProps(taskResponse);

      expect(result).toEqual({
        id: '1',
        title: 'Test Task',
        description: undefined,
        checked: true,
        variant: 'outlined',
      });
    });
  });

  describe('shoppingItemResponseToShoppingItemProps', () => {
    it('should convert ShoppingItemResponse to ShoppingItemProps', () => {
      const itemResponse: ShoppingItemResponse = {
        id: '1',
        list_id: 'list1',
        title: 'Test Item',
        url: 'https://example.com',
        price: '$10.00',
        source: 'Amazon',
        checked: false,
        variant: 'default',
        position: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const result = shoppingItemResponseToShoppingItemProps(itemResponse);

      expect(result).toEqual({
        id: '1',
        title: 'Test Item',
        url: 'https://example.com',
        price: '$10.00',
        source: 'Amazon',
        variant: 'default',
        checked: false,
      });
    });

    it('should handle null values', () => {
      const itemResponse: ShoppingItemResponse = {
        id: '1',
        list_id: 'list1',
        title: 'Test Item',
        url: null,
        price: null,
        source: null,
        checked: true,
        variant: 'filled',
        position: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const result = shoppingItemResponseToShoppingItemProps(itemResponse);

      expect(result).toEqual({
        id: '1',
        title: 'Test Item',
        url: '',
        price: '',
        source: undefined,
        variant: 'filled',
        checked: true,
      });
    });
  });

  describe('taskItemPropsToTaskCreate', () => {
    it('should convert TaskItemProps to TaskCreate', () => {
      const taskProps: TaskItemProps = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        checked: false,
        variant: 'default',
      };

      const result = taskItemPropsToTaskCreate(taskProps, 5);

      expect(result).toEqual({
        title: 'Test Task',
        description: 'Test Description',
        checked: false,
        variant: 'default',
        position: 5,
      });
    });

    it('should handle undefined description', () => {
      const taskProps: TaskItemProps = {
        id: '1',
        title: 'Test Task',
        checked: true,
        variant: 'outlined',
      };

      const result = taskItemPropsToTaskCreate(taskProps);

      expect(result).toEqual({
        title: 'Test Task',
        description: null,
        checked: true,
        variant: 'outlined',
        position: 0,
      });
    });

    it('should use default values for missing properties', () => {
      const taskProps: TaskItemProps = {
        id: '1',
        title: 'Test Task',
      };

      const result = taskItemPropsToTaskCreate(taskProps, 10);

      expect(result).toEqual({
        title: 'Test Task',
        description: null,
        checked: false,
        variant: 'default',
        position: 10,
      });
    });
  });

  describe('shoppingItemPropsToShoppingItemCreate', () => {
    it('should convert ShoppingItemProps to ShoppingItemCreate', () => {
      const itemProps: ShoppingItemProps = {
        id: '1',
        title: 'Test Item',
        url: 'https://example.com',
        price: '$10.00',
        source: 'Amazon',
        checked: false,
        variant: 'default',
      };

      const result = shoppingItemPropsToShoppingItemCreate(itemProps, 5);

      expect(result).toEqual({
        title: 'Test Item',
        url: 'https://example.com',
        price: '$10.00',
        source: 'Amazon',
        checked: false,
        variant: 'default',
        position: 5,
      });
    });

    it('should handle empty strings', () => {
      const itemProps: ShoppingItemProps = {
        id: '1',
        title: 'Test Item',
        url: '',
        price: '',
        checked: true,
        variant: 'filled',
      };

      const result = shoppingItemPropsToShoppingItemCreate(itemProps);

      expect(result).toEqual({
        title: 'Test Item',
        url: null,
        price: null,
        source: null,
        checked: true,
        variant: 'filled',
        position: 0,
      });
    });

    it('should use default values for missing properties', () => {
      const itemProps: ShoppingItemProps = {
        id: '1',
        title: 'Test Item',
        url: '',
        price: '',
      };

      const result = shoppingItemPropsToShoppingItemCreate(itemProps, 10);

      expect(result).toEqual({
        title: 'Test Item',
        url: null,
        price: null,
        source: null,
        checked: false,
        variant: 'default',
        position: 10,
      });
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity for tasks', () => {
      const originalTask: TaskResponse = {
        id: '1',
        list_id: 'list1',
        title: 'Test Task',
        description: 'Test Description',
        checked: true,
        variant: 'outlined',
        position: 5,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const taskProps = taskResponseToTaskItemProps(originalTask);
      const taskCreate = taskItemPropsToTaskCreate(taskProps, originalTask.position);

      expect(taskCreate).toEqual({
        title: originalTask.title,
        description: originalTask.description,
        checked: originalTask.checked,
        variant: originalTask.variant,
        position: originalTask.position,
      });
    });

    it('should maintain data integrity for shopping items', () => {
      const originalItem: ShoppingItemResponse = {
        id: '1',
        list_id: 'list1',
        title: 'Test Item',
        url: 'https://example.com',
        price: '$10.00',
        source: 'Amazon',
        checked: false,
        variant: 'filled',
        position: 3,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const itemProps = shoppingItemResponseToShoppingItemProps(originalItem);
      const itemCreate = shoppingItemPropsToShoppingItemCreate(itemProps, originalItem.position);

      expect(itemCreate).toEqual({
        title: originalItem.title,
        url: originalItem.url,
        price: originalItem.price,
        source: originalItem.source,
        checked: originalItem.checked,
        variant: originalItem.variant,
        position: originalItem.position,
      });
    });
  });
}); 