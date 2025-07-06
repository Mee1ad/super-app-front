'use client'

import React from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  ListTodo,
  Notebook,
  CheckSquare,
  Lightbulb,
  Utensils,
} from "lucide-react";

const navItems = [
  { label: "Todo", icon: ListTodo, href: "/todo" },
  { label: "Food Planner", icon: Utensils, href: "/food-planner" },
  { label: "Ideas", icon: Lightbulb, href: "/ideas" },
  { label: "Diary", icon: Notebook, href: "/diary" },
  { label: "Habit", icon: CheckSquare, href: "/habit" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-md z-30 flex flex-col p-6 border-r border-gray-200">
      <div className="flex items-center mb-8">
        <span className="font-bold text-xl">Super App</span>
      </div>
      <nav className="flex flex-col gap-4">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-3 transition-colors ${
                isActive 
                  ? "text-blue-600 bg-blue-50 rounded-lg px-3 py-2" 
                  : "text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg px-3 py-2"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-base">{label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
} 