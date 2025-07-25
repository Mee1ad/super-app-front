'use client'

import React from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Open menu"
            type="button"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
} 