'use client'

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ListTodo,
  Notebook,
  CheckSquare,
  Lightbulb,
  Utensils,
  Settings,
  GitCommit,
  Menu,
  X,
} from "lucide-react";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { GoogleLoginButton } from "@/app/auth/molecules/GoogleLoginButton";
import { UserMenu } from "@/app/auth/organisms/UserMenu";
import { useAuth } from "@/app/auth/atoms/useAuth";
import { PERMISSIONS } from "@/lib/permissions";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  requiresPermission?: string;
}

const navItems: NavItem[] = [
  { label: "Todo", icon: ListTodo, href: "/todo" },
  { label: "Food Planner", icon: Utensils, href: "/food-planner" },
  { label: "Ideas", icon: Lightbulb, href: "/ideas" },
  { label: "Diary", icon: Notebook, href: "/diary" },
  { label: "Habit", icon: CheckSquare, href: "/habit" },
  { label: "Changelog", icon: GitCommit, href: "/changelog", requiresPermission: PERMISSIONS.CHANGELOG_VIEW },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, hasPermission, loading: authLoading } = useAuth();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Filter navigation items based on permissions
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiresPermission) return true;
    // Only apply permission filtering after client-side hydration and auth loading is complete
    if (!isClient || authLoading) return false;
    return isAuthenticated && hasPermission(item.requiresPermission);
  });

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <span className="font-bold text-xl">Super App</span>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex flex-col gap-4 flex-1">
        {filteredNavItems.map(({ label, icon: Icon, href }) => {
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
      {/* Bottom section with Roadmap, Feedback, Settings and Login */}
      <div className="pt-4 mt-auto">
        <div className="flex gap-2 mb-4">
          <button className="flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg px-2 py-2 transition-colors w-1/2">
            <span className="text-sm font-medium">Roadmap</span>
          </button>
          <div className="w-px bg-gray-200"></div>
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg px-2 py-2 transition-colors w-1/2"
          >
            <span className="text-sm font-medium">Feedback</span>
          </button>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex gap-2 justify-center items-center min-h-[48px]">
            <a
              href="/settings"
              className="flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg px-2 py-2 transition-colors w-1/2"
            >
              <Settings className="w-5 h-5" />
            </a>
            <div className="w-px bg-gray-200"></div>
            <div className="w-1/2 flex items-center justify-center">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <GoogleLoginButton 
                  className="flex items-center gap-2 text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors w-full justify-center"
                  variant="ghost"
                  size="default"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium">Sign in</span>
                </GoogleLoginButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 bg-white shadow-md rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-white shadow-md z-50 flex flex-col p-6 border-r border-gray-200 transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:z-30
        w-64
      `}>
        <SidebarContent />
      </aside>

      <FeedbackDialog 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
} 