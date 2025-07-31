"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AddNewList } from "./molecules/AddNewList";
import { TaskList } from "./organisms/TaskList";
import { ShoppingList } from "./organisms/ShoppingList";
import { MobileListView } from "./organisms/MobileListView";
import { useReplicacheTodo } from "./atoms/ReplicacheTodoContext";
import { ListResponse, Variant } from "./atoms/types";
import {
  taskResponseToTaskItemProps,
  shoppingItemResponseToShoppingItemProps,
  taskItemPropsToTaskCreate,
  shoppingItemPropsToShoppingItemCreate
} from "./atoms/adapters";
import { ErrorBoundary } from "./atoms/ErrorBoundary";
import { TodoSkeleton } from "./atoms/TodoSkeleton";
import { TaskItemProps } from "./atoms/TaskItem";
import { ShoppingItemProps } from "./atoms/ShoppingItem";
import { AppLayout } from "../shared/organisms/AppLayout";
import { ListPageLayout } from "../shared/organisms/ListPageLayout";
import { motion } from "framer-motion";

export default function TodoPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { lists, tasks, items, rep } = useReplicacheTodo();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Hide scrollbars globally for this page
  React.useEffect(() => {
    if (isClient) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('todo-page-active');
      document.documentElement.classList.add('todo-page-active');
      return () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.classList.remove('todo-page-active');
        document.documentElement.classList.remove('todo-page-active');
      };
    }
  }, [isClient]);

  // CRUD handlers using Replicache
  const handleCreateList = async (type: "task" | "shopping", title?: string) => {
    const id = `list_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const listTitle = title || (type === "task" ? "New Task List" : "New Shopping List");
    await rep.mutate.createList({
      id,
      type,
      title: listTitle,
      variant: "default" as Variant,
    });
  };

  const handleUpdateListTitle = async (id: string, title: string) => {
    await rep.mutate.updateList({ id, title });
  };

  const handleDeleteList = async (id: string) => {
    await rep.mutate.deleteList({ id });
  };

  // Task handlers
  const handleTaskUpdate = async (listId: string, task: TaskItemProps) => {
    if (task.id && task.id.trim() !== '') {
      await rep.mutate.updateTask({
        id: task.id,
        title: task.title,
        description: task.description,
        checked: task.checked,
        variant: task.variant,
      });
    } else {
      const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const taskCreate = taskItemPropsToTaskCreate(task);
      await rep.mutate.createTask({
        ...taskCreate,
        id,
        list_id: listId,
      });
    }
  };

  const handleTaskDelete = async (listId: string, taskId: string) => {
    await rep.mutate.deleteTask({ id: taskId });
  };

  const handleTaskToggle = async (listId: string, taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await rep.mutate.updateTask({ id: taskId, checked: !task.checked });
    }
  };

  const handleTaskReorder = async (listId: string, newTasks: TaskItemProps[]) => {
    const taskIds = newTasks.map(task => task.id);
    await rep.mutate.reorderTasks({ list_id: listId, task_ids: taskIds });
  };

  // Shopping item handlers
  const handleShoppingUpdate = async (listId: string, item: ShoppingItemProps) => {
    if (item.id && item.id.trim() !== '') {
      await rep.mutate.updateItem({
        id: item.id,
        title: item.title,
        url: item.url,
        price: item.price,
        source: item.source,
        checked: item.checked,
        variant: item.variant,
      });
    } else {
      const id = `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const itemCreate = shoppingItemPropsToShoppingItemCreate(item);
      await rep.mutate.createItem({
        ...itemCreate,
        id,
        list_id: listId,
      });
    }
  };

  const handleShoppingDelete = async (listId: string, itemId: string) => {
    await rep.mutate.deleteItem({ id: itemId });
  };

  const handleShoppingReorder = async (listId: string, newItems: ShoppingItemProps[]) => {
    const itemIds = newItems.map(item => item.id);
    await rep.mutate.reorderItems({ list_id: listId, item_ids: itemIds });
  };

  // Compose lists with their tasks/items for UI
  const listsWithItems = lists.map(list => ({
    ...list,
    tasks: list.type === "task" ? tasks.filter(t => t.list_id === list.id).sort((a, b) => a.position - b.position) : [],
    items: list.type === "shopping" ? items.filter(i => i.list_id === list.id).sort((a, b) => a.position - b.position) : [],
  }));

  return (
    <ErrorBoundary>
      <AppLayout title="Todo" className="!container !max-w-none min-h-screen todo-page">
        <ListPageLayout>
          <motion.div
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100vw", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col todo-page"
          >
            {/* Mobile View */}
            <div className="block md:hidden">
              <MobileListView
                lists={listsWithItems}
                onUpdateTitle={handleUpdateListTitle}
                onDelete={handleDeleteList}
                onListClick={(listId) => {
                  const list = listsWithItems.find(l => l.id === listId);
                  if (list) {
                    const searchParams = new URLSearchParams({
                      title: list.title,
                      type: list.type,
                      variant: list.variant || 'default'
                    });
                    router.push(`/todo/${listId}?${searchParams.toString()}`);
                  } else {
                    router.push(`/todo/${listId}`);
                  }
                }}
              />
            </div>

            {/* Desktop View */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {listsWithItems.length === 0 ? (
                <div 
                  className="w-full flex justify-center mt-20 mb-4"
                >
                  <span className="text-lg text-gray-500 font-medium">There is nothing here, lets add some data</span>
                </div>
              ) : (
                listsWithItems.map((list) => (
                  <div key={list.id}>
                    {list.type === "task" ? (
                      <TaskList
                        id={list.id}
                        title={list.title}
                        tasks={list.tasks.map(taskResponseToTaskItemProps)}
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
                        items={list.items.map(shoppingItemResponseToShoppingItemProps)}
                        variant={list.variant}
                        onUpdateTitle={handleUpdateListTitle}
                        onDelete={handleDeleteList}
                        onItemUpdate={item => handleShoppingUpdate(list.id, item)}
                        onItemDelete={itemId => handleShoppingDelete(list.id, itemId)}
                        onItemReorder={(listId, newItems) => handleShoppingReorder(listId, newItems)}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </ListPageLayout>
      </AppLayout>
      {/* FAB positioned outside the layout containers */}
      <AddNewList onCreate={handleCreateList} />
    </ErrorBoundary>
  );
} 