'use client';
import React, { useState } from "react";
import { AddNewList } from "./molecules/AddNewList";
import { TaskList } from "./organisms/TaskList";
import { ShoppingList } from "./organisms/ShoppingList";
import { MobileListView } from "./organisms/MobileListView";
import { useTodoApi } from "./atoms/useTodoApi";
import { ListWithItems } from "./atoms/types";
import { 
  taskResponseToTaskItemProps, 
  shoppingItemResponseToShoppingItemProps,
  taskItemPropsToTaskCreate,
  shoppingItemPropsToShoppingItemCreate
} from "./atoms/adapters";
import { ErrorBoundary } from "./atoms/ErrorBoundary";
import { LoadingSpinner } from "./atoms/LoadingSpinner";
import { TaskItemProps } from "./atoms/TaskItem";
import { ShoppingItemProps } from "./atoms/ShoppingItem";
import { AppLayout } from "../shared/organisms/AppLayout";

export default function TodoPage() {
  const [isClient, setIsClient] = useState(false);
  
  const {
    lists,
    loading,
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
    reorderItems,
  } = useTodoApi();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCreateList = async (type: "task" | "shopping", title?: string) => {
    try {
      const listTitle = title || (type === "task" ? "New Task List" : "New Shopping List");
      await createList(type, listTitle, "default");
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  const handleUpdateListTitle = async (id: string, title: string) => {
    try {
      await updateList(id, { title });
    } catch (err) {
      console.error('Failed to update list:', err);
    }
  };

  const handleDeleteList = async (id: string) => {
    try {
      await deleteList(id);
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  // Task handlers
  const handleTaskUpdate = async (listId: string, task: TaskItemProps) => {
    try {
      if (task.id && task.id.trim() !== '') {
        // Update existing task
        await updateTask(listId, task.id, {
          title: task.title,
          description: task.description,
          checked: task.checked,
          variant: task.variant,
        });
      } else {
        // Create new task
        const taskCreate = taskItemPropsToTaskCreate(task);
        await createTask(listId, taskCreate);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleTaskDelete = async (listId: string, taskId: string) => {
    try {
      await deleteTask(listId, taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleTaskToggle = async (listId: string, taskId: string) => {
    try {
      await toggleTask(listId, taskId);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleTaskReorder = async (listId: string, newTasks: TaskItemProps[]) => {
    try {
      const taskIds = newTasks.map(task => task.id);
      await reorderTasks(listId, taskIds);
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
    }
  };

  // Shopping handlers
  const handleShoppingUpdate = async (listId: string, item: ShoppingItemProps) => {
    try {
      if (item.id && item.id.trim() !== '') {
        // Update existing item
        await updateItem(listId, item.id, {
          title: item.title,
          url: item.url,
          price: item.price,
          source: item.source,
          checked: item.checked,
          variant: item.variant,
        });
      } else {
        // Create new item
        const itemCreate = shoppingItemPropsToShoppingItemCreate(item);
        await createItem(listId, itemCreate);
      }
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleShoppingDelete = async (listId: string, itemId: string) => {
    try {
      await deleteItem(listId, itemId);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleShoppingReorder = async (listId: string, newItems: ShoppingItemProps[]) => {
    try {
      const itemIds = newItems.map(item => item.id);
      await reorderItems(listId, itemIds);
    } catch (err) {
      console.error('Failed to reorder items:', err);
    }
  };



  if (!isClient || loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <AppLayout title="Todo">
        <AddNewList onCreate={handleCreateList} />
        
        {/* Mobile View */}
        <div className="block md:hidden">
          <MobileListView
            lists={lists}
            onUpdateTitle={handleUpdateListTitle}
            onDelete={handleDeleteList}
            onListClick={(listId) => {
              // Navigate to the detail page
              window.location.href = `/todo/${listId}`;
            }}
          />
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {lists.map((list: ListWithItems) => (
            <div key={list.id}>
              {list.type === "task" ? (
                <TaskList
                  id={list.id}
                  title={list.title}
                  tasks={(list.tasks || []).map(taskResponseToTaskItemProps)}
                  variant={list.variant}
                  onUpdateTitle={handleUpdateListTitle}
                  onDelete={handleDeleteList}
                  onTaskUpdate={task => handleTaskUpdate(list.id, task)}
                  onTaskDelete={taskId => handleTaskDelete(list.id, taskId)}
                  onTaskToggle={(taskId) => handleTaskToggle(list.id, taskId)}
                  onTaskReorder={(listId, newTasks) => handleTaskReorder(listId, newTasks)}
                />
              ) : (
                <ShoppingList
                  id={list.id}
                  title={list.title}
                  items={(list.items || []).map(shoppingItemResponseToShoppingItemProps)}
                  variant={list.variant}
                  onUpdateTitle={handleUpdateListTitle}
                  onDelete={handleDeleteList}
                  onItemUpdate={item => handleShoppingUpdate(list.id, item)}
                  onItemDelete={itemId => handleShoppingDelete(list.id, itemId)}
                  onItemReorder={(listId, newItems) => handleShoppingReorder(listId, newItems)}
                />
              )}
            </div>
          ))}
        </div>
      </AppLayout>
    </ErrorBoundary>
  );
} 