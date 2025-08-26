"use client";
import React, { useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { useReplicacheTodo } from "../atoms/ReplicacheTodoContext";
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
  const params = useParams() as { listId?: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const listId = params?.listId ?? '';
  const [isClient, setIsClient] = useState(false);
  const [editItem, setEditItem] = useState<{
    id: string;
    title: string;
    description?: string;
    url?: string;
    price?: string;
    source?: string;
  } | null>(null);

  const { lists, tasks, items, rep, mutateWithPoke } = useReplicacheTodo();

  // Get list data from URL search params to avoid refetching
  const listTitle = searchParams.get('title') || "Todo List";

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Find the current list
  const currentList = useMemo(() => {
    return lists.find(list => list.id === listId);
  }, [lists, listId]);

  // Use currentList title if available, otherwise use URL param title
  const displayTitle = currentList?.title || listTitle;

  const handleBack = () => {
    router.push('/todo');
  };

  // Task handlers
  const handleTaskUpdate = async (task: TaskItemProps) => {
    if (task.id && task.id.trim() !== '') {
      await mutateWithPoke('updateTask', {
        id: task.id,
        title: task.title,
        description: task.description,
        checked: task.checked,
        variant: task.variant,
      });
    } else {
      const id = uuidv4();
      const taskCreate = taskItemPropsToTaskCreate(task);
      await mutateWithPoke('createTask', {
        ...taskCreate,
        id,
        list_id: listId,
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    await mutateWithPoke('deleteTask', { id: taskId });
  };

  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await mutateWithPoke('updateTask', { id: taskId, checked: !task.checked });
    }
  };

  // Shopping handlers
  const handleShoppingUpdate = async (item: ShoppingItemProps) => {
    if (item.id && item.id.trim() !== '') {
      await mutateWithPoke('updateItem', {
        id: item.id,
        title: item.title,
        url: item.url,
        price: item.price,
        source: item.source,
        checked: item.checked,
        variant: item.variant,
      });
    } else {
      const id = uuidv4();
      const itemCreate = shoppingItemPropsToShoppingItemCreate(item);
      await mutateWithPoke('createItem', {
        ...itemCreate,
        id,
        list_id: listId,
      });
    }
  };

  const handleShoppingDelete = async (itemId: string) => {
    await mutateWithPoke('deleteItem', { id: itemId });
  };

  // Reorder handlers (not implemented in UI, but available)
  const handleTaskReorder = async (newTasks: TaskItemProps[]) => {
    const taskIds = newTasks.map(task => task.id);
    await mutateWithPoke('reorderTasks', { list_id: listId, task_ids: taskIds });
  };
  const handleShoppingReorder = async (newItems: ShoppingItemProps[]) => {
    const itemIds = newItems.map(item => item.id);
    await mutateWithPoke('reorderItems', { list_id: listId, item_ids: itemIds });
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
        checked: false,
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
        checked: false,
        variant: currentList.variant || 'default'
      });
    }
    setEditItem(null);
  };

  // Compose items for the current list
  const itemsForList = useMemo(() => {
    if (!currentList) return [];
    if (currentList.type === "task") {
      return tasks.filter(t => t.list_id === listId).sort((a, b) => a.position - b.position).map(taskResponseToTaskItemProps);
    } else {
      return items.filter(i => i.list_id === listId).sort((a, b) => a.position - b.position).map(shoppingItemResponseToShoppingItemProps);
    }
  }, [currentList, tasks, items, listId]);

  if (!isClient || !currentList) {
    return (
      <ErrorBoundary>
        <AppLayout 
          customHeader={
            <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Go back"
                  type="button"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                  {displayTitle}
                </h1>
              </div>
            </div>
          }
        >
          {/* No skeleton, just show nothing or a not found message */}
        </AppLayout>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppLayout 
        customHeader={
          <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Go back"
                type="button"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                {displayTitle}
              </h1>
            </div>
          </div>
        }
      >
        <motion.div
          initial={{ x: "100vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100vw", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ height: "100%" }}
        >
          <div className="flex-1 space-y-6 overflow-x-hidden">
            {/* Mobile View */}
            <div className="block md:hidden">
              <div className="w-full">
                {itemsForList.map((item, index) => (
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
                    onReorder={currentList.type === "task" ? handleTaskReorder : handleShoppingReorder}
                    isLast={index === itemsForList.length - 1}
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
        </motion.div>
        {/* Floating Action Button for adding items - moved outside motion.div */}
        <AddNewItem 
          type={currentList.type} 
          onCreate={handleAddItem}
          onUpdate={handleUpdateItem}
          onCancel={() => setEditItem(null)}
          editItem={editItem}
        />
      </AppLayout>
    </ErrorBoundary>
  );
} 