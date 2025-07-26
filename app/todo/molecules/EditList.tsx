"use client";
import { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileKeyboardFocusWithBackGesture } from "@/hooks/use-mobile-keyboard-focus";
import { motion, AnimatePresence } from "framer-motion";

export type EditListProps = {
  currentTitle: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
  isOpen: boolean;
};

export function EditList({ currentTitle, onSave, onCancel, isOpen }: EditListProps) {
  const [listName, setListName] = useState(currentTitle);
  
  // Update listName when currentTitle changes
  useEffect(() => {
    setListName(currentTitle);
  }, [currentTitle]);
  
  // Prevent scroll when form is open
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    
    // Cleanup on unmount
    return () => {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
  }, [isOpen])
  
  const { ref: listNameInputRef, keyboardHeight } = useMobileKeyboardFocusWithBackGesture(
    isOpen,
    () => {
      // Auto-close form when keyboard is dismissed on mobile
      if (window.innerWidth <= 768) {
        handleCancel();
      }
    },
    () => {
      // Auto-close form when back gesture is used
      if (window.innerWidth <= 768 && isOpen) {
        handleCancel();
      }
    }
  );

  const handleSave = () => {
    if (listName.trim() && listName.trim() !== currentTitle) {
      onSave(listName.trim());
    }
  };

  const handleCancel = () => {
    setListName(currentTitle);
    onCancel();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark background overlay */}
          <motion.div 
            className="fixed inset-0 bg-black/40 z-[9998]" 
            onClick={handleCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Keyboard-attached form */}
          <div className="fixed inset-0 z-[9999] flex items-end" onClick={handleCancel}>
            <motion.div 
              className="w-full bg-white rounded-t-xl shadow-lg" 
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'none',
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="flex flex-col h-full">
                {/* Form content area */}
                <div className="flex flex-col gap-2 p-6 flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Enter list name..."
                      className="w-full text-base border-none outline-none bg-transparent"
                      autoFocus
                      ref={listNameInputRef}
                    />
                  </div>
                </div>
                
                {/* Action buttons positioned at bottom of form overlay */}
                <div className="flex items-center justify-end gap-3 p-6">
                  {/* Close button */}
                  <button
                    onClick={handleCancel}
                    className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors shadow-lg"
                    aria-label="Cancel edit"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  {/* Save button */}
                  <button
                    onClick={handleSave}
                    disabled={!listName.trim() || listName.trim() === currentTitle}
                    className={cn(
                      "p-3 rounded-full transition-colors shadow-lg",
                      listName.trim() && listName.trim() !== currentTitle
                        ? "bg-primary hover:bg-primary/90 text-white" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    <Check className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
} 