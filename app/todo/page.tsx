'use client';
import React, { useState, useMemo } from "react";
import { AddNewList } from "./molecules/AddNewList";
import { SearchBox } from "./molecules/SearchBox";
import { TaskList } from "./organisms/TaskList";
import { ShoppingList } from "./organisms/ShoppingList";
import { useTodoApi } from "./atoms/useTodoApi";
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

export default function TodoPage() {
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleCreateList = async (type: "task" | "shopping") => {
    try {
      const title = type === "task" ? "New Task List" : "New Shopping List";
      await createList(type, title, "default");
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

  // Filter lists based on search query
  const filteredLists = useMemo(() => {
    if (!searchQuery.trim()) {
      return lists;
    }

    const query = searchQuery.toLowerCase();
    
    return lists.map(list => {
      if (list.type === "task") {
        const filteredTasks = (list.tasks || []).filter((task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
        );
        return { ...list, tasks: filteredTasks };
      } else {
        const filteredItems = (list.items || []).filter((item) =>
          item.title.toLowerCase().includes(query) ||
          (item.url && item.url.toLowerCase().includes(query)) ||
          (item.price && item.price.toLowerCase().includes(query)) ||
          (item.source && item.source.toLowerCase().includes(query))
        );
        return { ...list, items: filteredItems };
      }
    }).filter(list => {
      // Only show lists that have matching items
      if (list.type === "task") {
        return (list.tasks || []).length > 0;
      } else {
        return (list.items || []).length > 0;
      }
    });
  }, [lists, searchQuery]);

  if (!isClient || loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <SearchBox onSearch={setSearchQuery} />
          <AddNewList onCreate={handleCreateList} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLists.map(list => (
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
      </div>
    </ErrorBoundary>
  );
} 