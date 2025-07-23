'use client';
import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
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
import { NewTask } from "../molecules/NewTask";
import { NewShopping } from "../molecules/NewShopping";

export default function TodoListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.listId as string;
  const [showAdd, setShowAdd] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const {
    lists,
    loading,
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
        setShowAdd(false);
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
        setShowAdd(false);
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{currentList.title}</h1>
            <p className="text-sm text-gray-500">
              {currentList.type === "task" ? "Task List" : "Shopping List"}
            </p>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden">
          <div className="w-full">
            {items.map((item, index) => (
              <MobileItemRow
                key={item.id}
                item={item}
                type={currentList.type}
                onUpdate={currentList.type === "task" ? handleTaskUpdate : handleShoppingUpdate}
                onDelete={currentList.type === "task" ? handleTaskDelete : handleShoppingDelete}
                onToggle={currentList.type === "task" ? handleTaskToggle : undefined}
                isLast={index === items.length - 1}
              />
            ))}
          </div>
          
          {/* Add Item Button */}
          <div className="mt-6 text-center">
            {!showAdd ? (
              <Button 
                variant="ghost" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                onClick={() => setShowAdd(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {currentList.type === "task" ? "Task" : "Item"}
              </Button>
            ) : (
              <div className="p-4 border rounded-lg bg-gray-50">
                {currentList.type === "task" ? (
                  <NewTask
                    onCreate={(title, description) => {
                      handleTaskUpdate({ 
                        id: '', 
                        title, 
                        description, 
                        checked: false, 
                        variant: currentList.variant || 'default' 
                      });
                    }}
                  />
                ) : (
                  <NewShopping
                    onCreate={(title, url, price, source) => {
                      handleShoppingUpdate({ 
                        id: '', 
                        title, 
                        url, 
                        price, 
                        source, 
                        variant: currentList.variant || 'default' 
                      });
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop View - Keep existing card layout */}
        <div className="hidden md:block">
          <div className="text-center py-8">
            <p className="text-gray-500">Desktop view not implemented for detail page</p>
          </div>
        </div>
      </AppLayout>
    </ErrorBoundary>
  );
} 