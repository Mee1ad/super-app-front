'use client'

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo,
  Notebook,
  CheckSquare,
  Lightbulb,
  Utensils,
  Settings,
  GitCommit,
} from "lucide-react";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { GoogleLoginButton } from "@/app/auth/molecules/GoogleLoginButton";
import { UserMenu } from "@/app/auth/organisms/UserMenu";
import { useAuth } from "@/app/auth/atoms/useAuth";
import { PERMISSIONS } from "@/lib/permissions";
import { useSidebar } from "./SidebarContext";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  requiresPermission?: string;
}

const navItems: NavItem[] = [
  { label: "Todo", icon: ListTodo, href: "/todo" },
  { label: "Food Tracker", icon: Utensils, href: "/food-tracker" },
  { label: "Ideas", icon: Lightbulb, href: "/ideas" },
  { label: "Diary", icon: Notebook, href: "/diary" },
  { label: "Changelog", icon: GitCommit, href: "/changelog", requiresPermission: PERMISSIONS.CHANGELOG_VIEW },
];

// Animation variants for sidebar
const sidebarVariants = {
  hidden: { x: -320, opacity: 0 }, // Adjusted for wider mobile sidebar (w-72 = 288px + buffer)
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      duration: 0.3
    }
  },
  exit: { 
    x: -320, 
    opacity: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      duration: 0.2
    }
  }
};

// Animation variants for backdrop
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export function Sidebar() {
  const pathname = usePathname();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  const { isAuthenticated, hasPermission, loading: authLoading } = useAuth();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  const maxSidebarWidth = 288; // w-72 = 288px for mobile, w-64 = 256px for desktop

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobileMenuOpen) return;
    setTouchStart(e.targetTouches[0].clientX);
    setTouchCurrent(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setTouchCurrent(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!isDragging || touchStart === null || touchCurrent === null) {
      setIsDragging(false);
      setTouchStart(null);
      setTouchCurrent(null);
      return;
    }
    const distance = touchStart - touchCurrent;
    if (distance > minSwipeDistance) {
      setIsMobileMenuOpen(false);
    }
    setIsDragging(false);
    setTouchStart(null);
    setTouchCurrent(null);
  };

  // Calculate sidebar translateX for drag
  let sidebarTranslate = 0;
  if (isDragging && touchStart !== null && touchCurrent !== null) {
    const delta = touchCurrent - touchStart;
    sidebarTranslate = Math.max(Math.min(delta, 0), -maxSidebarWidth); // Clamp between 0 and -sidebar width
  }

  // Apply styles only after client-side hydration to prevent hydration mismatch
  useEffect(() => {
    if (sidebarRef.current && isClient) {
      if (isDragging) {
        sidebarRef.current.style.transform = `translateX(${sidebarTranslate}px)`;
        sidebarRef.current.style.transition = 'none';
      } else {
        sidebarRef.current.style.transform = '';
        sidebarRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
      }
    }
  }, [isDragging, sidebarTranslate, isClient]);

  // Filter navigation items based on permissions
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiresPermission) return true;
    // Only apply permission filtering after client-side hydration and auth loading is complete
    if (!isClient || authLoading) return false;
    return isAuthenticated && hasPermission(item.requiresPermission);
  });

  // Don't render until after client-side hydration to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  const SidebarContent = () => (
    <>
      <div className="mb-8" />
      <nav className="flex flex-col gap-4 flex-1 sidebar-nav">
        {filteredNavItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-3 transition-colors w-full ${
                isActive 
                  ? "text-blue-600 bg-blue-50 rounded-lg px-3 py-2" 
                  : "text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg px-3 py-2"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-base flex-1">{label}</span>
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
      {/* Backdrop overlay with Framer Motion */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar with Framer Motion */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            ref={sidebarRef}
            className="fixed left-0 top-0 h-full bg-white shadow-md z-50 flex flex-col p-4 md:p-6 border-r border-gray-200 w-72 md:w-64 md:translate-x-0 md:z-30"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            drag="x"
            dragConstraints={{ left: -288, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(event, info: { offset: { x: number } }) => {
              if (info.offset.x < -50) {
                setIsMobileMenuOpen(false);
              }
            }}
          >
            <div 
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              className="flex flex-col h-full"
            >
              <SidebarContent />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <FeedbackDialog 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
} 