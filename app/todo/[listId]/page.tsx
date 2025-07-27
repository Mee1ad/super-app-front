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
import { TodoDetailSkeleton } from "../atoms/TodoDetailSkeleton";
import { TaskItemProps } from "../atoms/TaskItem";
import { ShoppingItemProps } from "../atoms/ShoppingItem";
import { AppLayout } from "../../shared/organisms/AppLayout";
import { MobileItemRow } from "../molecules/MobileItemRow";
import { AddNewItem } from "../molecules/AddNewItem";
import { motion, AnimatePresence } from "framer-motion";

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
      console.error('Failed to delete shopping item:', err);
    }
  };

  // Reorder handlers
  const handleTaskReorder = async () => {
    try {
      // For now, we'll just show a message that reorder is available
      // In a full implementation, this would open a reorder interface
      console.log('Reorder tasks for list:', listId);
      // You could implement a drag-and-drop interface or a modal for reordering
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
    }
  };

  const handleShoppingReorder = async () => {
    try {
      // For now, we'll just show a message that reorder is available
      // In a full implementation, this would open a reorder interface
      console.log('Reorder shopping items for list:', listId);
      // You could implement a drag-and-drop interface or a modal for reordering
    } catch (err) {
      console.error('Failed to reorder shopping items:', err);
    }
  };

  const handleItemReorder = () => {
    if (!currentList) return;
    
    if (currentList.type === "task") {
      handleTaskReorder();
    } else {
      handleShoppingReorder();
    }
  };



  // Unified handler for both task and shopping items
  const handleItemUpdate = async (item: TaskItemProps | ShoppingItemProps) => {
    if (currentList?.type === "task") {
      await handleTaskUpdate(item as TaskItemProps);
    } else if (currentList?.type === "shopping") {
      await handleShoppingUpdate(item as ShoppingItemProps);
    }
  };

  const handleItemDelete = async (itemId: string) => {
    if (currentList?.type === "task") {
      await handleTaskDelete(itemId);
    } else if (currentList?.type === "shopping") {
      await handleShoppingDelete(itemId);
    }
  };

  const handleAddItem = (title: string, description?: string, url?: string, price?: string, source?: string) => {
    if (currentList?.type === "task") {
      handleTaskUpdate({ 
        id: '', 
        title, 
        description: description || '', 
        checked: false, 
        variant: currentList.variant || 'default' 
      });
    } else if (currentList?.type === "shopping") {
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
    if (currentList?.type === "task") {
      handleTaskUpdate({ 
        id, 
        title, 
        description: description || '', 
        checked: false, 
        variant: currentList.variant || 'default' 
      });
    } else if (currentList?.type === "shopping") {
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

  return (
    <ErrorBoundary>
      <AppLayout title={currentList?.title || "Todo List"}>
        {(!isClient || loading) ? (
          <TodoDetailSkeleton count={5} />
        ) : !currentList ? (
          <div className="text-center py-8">
            <h1 className="text-xl font-semibold text-gray-900 mb-4">List not found</h1>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lists
            </Button>
          </div>
        ) : (
          <>
            {(() => {
              const items = currentList.type === "task" 
                ? (currentList.tasks || []).map(taskResponseToTaskItemProps)
                : (currentList.items || []).map(shoppingItemResponseToShoppingItemProps);

              return (
                <>
                  {/* Mobile Content */}
                  <div className="flex-1 space-y-6 overflow-x-hidden">
                    {/* Mobile View */}
                    <div className="block md:hidden">
                      <div className="w-full">
                        <AnimatePresence>
                          {items.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ 
                                opacity: 0, 
                                x: -100,
                                scale: 0.95,
                                transition: { duration: 0.2, ease: "easeInOut" }
                              }}
                              transition={{ 
                                duration: 0.3, 
                                delay: index * 0.05,
                                ease: "easeOut"
                              }}
                            >
                              <MobileItemRow
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
                                onReorder={handleItemReorder}
                                isLast={index === items.length - 1}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
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
                    onCancel={() => setEditItem(null)}
                    editItem={editItem}
                  />
                </>
              );
            })()}
          </>
        )}
      </AppLayout>
    </ErrorBoundary>
  );
} 