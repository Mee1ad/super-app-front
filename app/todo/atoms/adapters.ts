import { TaskResponse, ShoppingItemResponse } from './types';
import { TaskItemProps } from './TaskItem';
import { ShoppingItemProps } from './ShoppingItem';

// Convert API TaskResponse to component TaskItemProps
export const taskResponseToTaskItemProps = (task: TaskResponse): TaskItemProps => ({
  id: task.id,
  title: task.title,
  description: task.description || undefined,
  checked: task.checked,
  variant: task.variant,
});

// Convert API ShoppingItemResponse to component ShoppingItemProps
export const shoppingItemResponseToShoppingItemProps = (item: ShoppingItemResponse): ShoppingItemProps => ({
  id: item.id,
  title: item.title,
  url: item.url || '',
  price: item.price || '',
  source: item.source || undefined,
  variant: item.variant,
  checked: item.checked,
});

// Convert component TaskItemProps to API TaskCreate
export const taskItemPropsToTaskCreate = (task: TaskItemProps, position: number = 0) => ({
  title: task.title,
  description: task.description || null,
  checked: task.checked || false,
  variant: task.variant || 'default',
  position,
});

// Convert component ShoppingItemProps to API ShoppingItemCreate
export const shoppingItemPropsToShoppingItemCreate = (item: ShoppingItemProps, position: number = 0) => ({
  title: item.title,
  url: item.url || null,
  price: item.price || null,
  source: item.source || null,
  checked: item.checked || false,
  variant: item.variant || 'default',
  position,
}); 