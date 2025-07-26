'use client';
import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodoApi } from "../atoms/useTodoApi";
import { 
  taskResponseToTaskItemProps, 
  shoppingItemResponseToShoppingItemProps,
  taskItemPropsToTaskCreate,
  shoppingItemPropsToShoppingItemCreate
} from "../atoms/adapters";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { LoadingSpinner } from "../atoms/LoadingSpinner";
import { TaskItemProps } from "../atoms/TaskItem";
import { ShoppingItemProps } from "../atoms/ShoppingItem";
import { AppLayout } from "../../shared/organisms/AppLayout";
import { MobileItemRow } from "../molecules/MobileItemRow";
import { AddNewItem } from "../molecules/AddNewItem";

export default function TodoListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.listId as string;
  const [isClient, setIsClient] = useState(false);
  const [editItem, setEditItem] = useState<{
    id: string;
    title: string;
    description?: string;
    url?: string;
    price?: string;
    source?: string;
  } | null>(null);
  
  const {
    lists,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    createItem,
    updateItem,
    deleteItem,
  } = useTodoApi();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Find the current list
  const currentList = useMemo(() => {
    return lists.find(list => list.id === listId);
  }, [lists, listId]);

  const handleBack = () => {
    router.push('/todo');
  };

  // Task handlers
  const handleTaskUpdate = async (task: TaskItemProps) => {
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

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(listId, taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    try {
      await toggleTask(listId, taskId);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // Shopping handlers
  const handleShoppingUpdate = async (item: ShoppingItemProps) => {
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

  const handleShoppingDelete = async (itemId: string) => {
    try {
      await deleteItem(listId, itemId);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  if (!isClient || loading) {
    return <LoadingSpinner />;
  }

  if (!currentList) {
    return <div>List not found</div>;
  }

  // Unified handler for both task and shopping items
  const handleItemUpdate = async (item: TaskItemProps | ShoppingItemProps) => {
    if (currentList.type === "task") {
      await handleTaskUpdate(item as TaskItemProps);
    } else {
      await handleShoppingUpdate(item as ShoppingItemProps);
    }
  };

  const handleItemDelete = async (itemId: string) => {
    if (currentList.type === "task") {
      await handleTaskDelete(itemId);
    } else {
      await handleShoppingDelete(itemId);
    }
  };

  const handleAddItem = (title: string, description?: string, url?: string, price?: string, source?: string) => {
    if (currentList.type === "task") {
      handleTaskUpdate({ 
        id: '', 
        title, 
        description: description || '', 
        checked: false, 
        variant: currentList.variant || 'default' 
      });
    } else {
      handleShoppingUpdate({ 
        id: '', 
        title, 
        url: url || '', 
        price: price || '', 
        source: source || '', 
        variant: currentList.variant || 'default' 
      });
    }
  };

  const handleUpdateItem = (id: string, title: string, description?: string, url?: string, price?: string, source?: string) => {
    if (currentList.type === "task") {
      handleTaskUpdate({ 
        id, 
        title, 
        description: description || '', 
        checked: false, 
        variant: currentList.variant || 'default' 
      });
    } else {
      handleShoppingUpdate({ 
        id, 
        title, 
        url: url || '', 
        price: price || '', 
        source: source || '', 
        variant: currentList.variant || 'default' 
      });
    }
    setEditItem(null);
  };

  if (!currentList) {
    return (
      <ErrorBoundary>
        <AppLayout>
          <div className="text-center py-8">
            <h1 className="text-xl font-semibold text-gray-900 mb-4">List not found</h1>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lists
            </Button>
          </div>
        </AppLayout>
      </ErrorBoundary>
    );
  }

  const items = currentList.type === "task" 
    ? (currentList.tasks || []).map(taskResponseToTaskItemProps)
    : (currentList.items || []).map(shoppingItemResponseToShoppingItemProps);

  return (
    <ErrorBoundary>
      <AppLayout>
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border overflow-x-hidden">
          <div className="px-4 py-3 overflow-x-hidden">
            <div className="flex items-center justify-between w-full overflow-x-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="scale-150" strokeWidth={2.5} />
              </Button>
              <div className="text-center flex-1 min-w-0 relative px-4">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {currentList.title}
                </h1>
              </div>
              <div className="w-8"></div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 px-6 py-4 space-y-6 overflow-x-hidden">
          {/* Mobile View */}
          <div className="block md:hidden">
            <div className="w-full">
              {items.map((item, index) => (
                <MobileItemRow
                  key={item.id}
                  item={item}
                  type={currentList.type}
                  onUpdate={handleItemUpdate}
                  onDelete={handleItemDelete}
                  onToggle={currentList.type === "task" ? handleTaskToggle : undefined}
                  onEdit={(item) => {
                    setEditItem({
                      id: item.id,
                      title: item.title,
                      description: currentList.type === "task" ? (item as TaskItemProps).description : undefined,
                      url: currentList.type === "shopping" ? (item as ShoppingItemProps).url : undefined,
                      price: currentList.type === "shopping" ? (item as ShoppingItemProps).price : undefined,
                      source: currentList.type === "shopping" ? (item as ShoppingItemProps).source : undefined,
                    });
                  }}
                  isLast={index === items.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Desktop View - Keep existing card layout */}
          <div className="hidden md:block">
            <div className="text-center py-8">
              <p className="text-gray-500">Desktop view not implemented for detail page</p>
            </div>
          </div>
        </div>

        {/* Floating Action Button for adding items */}
        <AddNewItem 
          type={currentList.type} 
          onCreate={handleAddItem}
          onUpdate={handleUpdateItem}
          editItem={editItem}
        />
      </AppLayout>
    </ErrorBoundary>
  );
} 