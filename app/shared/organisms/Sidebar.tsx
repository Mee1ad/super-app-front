import React from "react";
import {
  Home,
  ListTodo,
  Film,
  Book,
  PiggyBank,
  Notebook,
  CheckSquare,
  Lightbulb,
  Inbox,
} from "lucide-react";

const navItems = [
  { label: "Todo", icon: ListTodo, href: "/todo" },
  { label: "Ideas", icon: Lightbulb, href: "/ideas" },
  { label: "Movies", icon: Film, href: "/movies" },
  { label: "Accounting", icon: PiggyBank, href: "/accounting" },
  { label: "Diary", icon: Notebook, href: "/diary" },
  { label: "Books", icon: Book, href: "/books" },
  { label: "Habit", icon: CheckSquare, href: "/habit" },
  { label: "Mind Inbox", icon: Inbox, href: "/mind-inbox" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-md z-30 flex flex-col p-6 border-r border-gray-200">
      <div className="flex items-center mb-8">
        <span className="font-bold text-xl">Super App</span>
      </div>
      <nav className="flex flex-col gap-4">
        {navItems.map(({ label, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="text-base">{label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
} 