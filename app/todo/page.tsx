'use client';
import React, { useState, useMemo } from "react";
import { AddNewList } from "./molecules/AddNewList";
import { SearchBox } from "./molecules/SearchBox";
import { TaskList } from "./organisms/TaskList";
import { ShoppingList } from "./organisms/ShoppingList";

export default function TodoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [lists, setLists] = useState<any[]>([
    { 
      id: "1", 
      type: "task", 
      title: "Work Tasks", 
      tasks: [
        { id: "task1", title: "Complete project proposal", description: "Finish the Q4 project proposal document", checked: false, variant: "default" },
        { id: "task2", title: "Review code changes", description: "Review pull requests for the new feature", checked: true, variant: "default" },
        { id: "task3", title: "Team meeting", description: "Weekly standup with the development team", checked: false, variant: "default" },
        { id: "task4", title: "Update documentation", description: "Update API documentation for new endpoints", checked: false, variant: "default" }
      ], 
      variant: "default" 
    },
    { 
      id: "2", 
      type: "shopping", 
      title: "Groceries", 
      items: [
        { id: "item1", title: "Organic Bananas", url: "https://example.com/bananas", price: "$2.99", source: "Local Market", variant: "default", checked: false },
        { id: "item2", title: "Whole Grain Bread", url: "https://example.com/bread", price: "$3.49", source: "Bakery", variant: "default", checked: true },
        { id: "item3", title: "Greek Yogurt", url: "https://example.com/yogurt", price: "$4.99", source: "Supermarket", variant: "default", checked: false },
        { id: "item4", title: "Fresh Spinach", url: "https://example.com/spinach", price: "$1.99", source: "Farmers Market", variant: "default", checked: false }
      ], 
      variant: "default" 
    },
    { 
      id: "3", 
      type: "task", 
      title: "Personal Goals", 
      tasks: [
        { id: "task5", title: "Read 30 minutes", description: "Read the new book I started last week", checked: true, variant: "outlined" },
        { id: "task6", title: "Exercise", description: "Go for a 30-minute run in the park", checked: false, variant: "outlined" },
        { id: "task7", title: "Call mom", description: "Weekly check-in call with family", checked: false, variant: "outlined" }
      ], 
      variant: "outlined" 
    },
    { 
      id: "4", 
      type: "shopping", 
      title: "Electronics", 
      items: [
        { id: "item5", title: "Wireless Headphones", url: "https://example.com/headphones", price: "$89.99", source: "Tech Store", variant: "filled", checked: false },
        { id: "item6", title: "USB-C Cable", url: "https://example.com/cable", price: "$12.99", source: "Online Store", variant: "filled", checked: false }
      ], 
      variant: "filled" 
    }
  ]);

  const handleCreateList = (type: "task" | "shopping") => {
    const id = Date.now().toString();
    setLists(prev => [
      ...prev,
      type === "task"
        ? { id, type, title: "New Task List", tasks: [], variant: "default" }
        : { id, type, title: "New Shopping List", items: [], variant: "default" },
    ]);
  };

  const handleUpdateListTitle = (id: string, title: string) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, title } : l));
  };
  const handleDeleteList = (id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
  };

  // Task handlers (simple list)
  const handleTaskUpdate = (listId: string, task: any) => {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, tasks: l.tasks.some((t: any) => t.id === task.id)
            ? l.tasks.map((t: any) => t.id === task.id ? task : t)
            : [task, ...l.tasks] }
        : l
    ));
  };
  const handleTaskDelete = (listId: string, taskId: string) => {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, tasks: l.tasks.filter((t: any) => t.id !== taskId) }
        : l
    ));
  };
  const handleTaskToggle = (listId: string, taskId: string, checked: boolean) => {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, tasks: l.tasks.map((t: any) => t.id === taskId ? { ...t, checked } : t) }
        : l
    ));
  };
  const handleTaskReorder = (listId: string, newTasks: any[]) => {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, tasks: newTasks }
        : l
    ));
  };

  // Shopping handlers (simple list)
  const handleShoppingUpdate = (listId: string, item: any) => {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, items: l.items.some((i: any) => i.id === item.id)
            ? l.items.map((i: any) => i.id === item.id ? { ...i, ...item } : i)
            : [{ ...item, checked: false }, ...l.items] }
        : l
    ));
  };
  const handleShoppingDelete = (listId: string, itemId: string) => {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, items: l.items.filter((i: any) => i.id !== itemId) }
        : l
    ));
  };
  const handleShoppingReorder = (listId: string, newItems: any[]) => {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, items: newItems }
        : l
    ));
  };

  // Filter lists based on search query
  const filteredLists = useMemo(() => {
    if (!searchQuery.trim()) {
      return lists;
    }

    const query = searchQuery.toLowerCase();
    
    return lists.map(list => {
      if (list.type === "task") {
        const filteredTasks = list.tasks.filter((task: any) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
        );
        return { ...list, tasks: filteredTasks };
      } else {
        const filteredItems = list.items.filter((item: any) =>
          item.title.toLowerCase().includes(query) ||
          item.url.toLowerCase().includes(query) ||
          item.price.toLowerCase().includes(query) ||
          (item.source && item.source.toLowerCase().includes(query))
        );
        return { ...list, items: filteredItems };
      }
    }).filter(list => {
      // Only show lists that have matching items
      if (list.type === "task") {
        return list.tasks.length > 0;
      } else {
        return list.items.length > 0;
      }
    });
  }, [lists, searchQuery]);

  return (
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
                tasks={list.tasks}
                variant={list.variant}
                onUpdateTitle={handleUpdateListTitle}
                onDelete={handleDeleteList}
                onTaskUpdate={task => handleTaskUpdate(list.id, task)}
                onTaskDelete={taskId => handleTaskDelete(list.id, taskId)}
                onTaskToggle={(taskId, checked) => handleTaskToggle(list.id, taskId, checked)}
                onTaskReorder={(listId, newTasks) => handleTaskReorder(listId, newTasks)}
              />
            ) : (
              <ShoppingList
                id={list.id}
                title={list.title}
                items={list.items}
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
  );
} 