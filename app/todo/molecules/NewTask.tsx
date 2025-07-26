'use client';

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileKeyboardFocusWithBackGesture } from "@/hooks/use-mobile-keyboard-focus";

export type NewTaskProps = {
  onCreate: (title: string, description?: string) => void;
  onClose?: () => void;
};

export function NewTask({ onCreate, onClose }: NewTaskProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Prevent scroll when form is open (always open in this component)
  useEffect(() => {
    // Store current scroll position
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    
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
  }, [])
  
  const { ref: titleInputRef, keyboardHeight } = useMobileKeyboardFocusWithBackGesture(
    true,
    () => {
      // Auto-close form when keyboard is dismissed on mobile
      if (window.innerWidth <= 768) {
        handleClose();
      }
    },
    () => {
      // Auto-close form when back gesture is used
      if (window.innerWidth <= 768) {
        handleClose();
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), description.trim() || undefined);
      // Keep form open for adding another task
      setTitle("");
      setDescription("");
      // Re-focus the title input for quick entry
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (title.trim()) {
        onCreate(title.trim(), description.trim() || undefined);
        setTitle("");
        setDescription("");
        // Re-focus the title input for quick entry
        setTimeout(() => {
          titleInputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    onClose?.();
  };

  return (
    <>
      {/* Dark background overlay */}
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={handleClose} />
      
      {/* Keyboard-attached form */}
      <div className="fixed inset-0 z-[9999] flex items-end" onClick={handleClose}>
        <div 
          className="w-full bg-white rounded-t-xl p-6 animate-in slide-in-from-bottom-2 duration-300 shadow-lg" 
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'none',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter task title..."
                className="w-full text-base border-none outline-none bg-transparent"
                autoFocus
                ref={titleInputRef}
              />
            </div>

            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.shiftKey) {
                    // Allow Shift+Enter for new line in description
                    return;
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (title.trim()) {
                      onCreate(title.trim(), description.trim() || undefined);
                      setTitle("");
                      setDescription("");
                      // Re-focus the title input for quick entry
                      setTimeout(() => {
                        titleInputRef.current?.focus();
                      }, 100);
                    }
                  }
                }}
                placeholder="Enter description (optional)..."
                className="w-full text-base border-none outline-none bg-transparent resize-none"
                rows={2}
              />
            </div>
          </div>
          
          {/* Action buttons positioned at bottom of form overlay */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors shadow-lg"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Add button */}
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className={cn(
                "p-3 rounded-full transition-colors shadow-lg",
                title.trim() 
                  ? "bg-primary hover:bg-primary/90 text-white" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
              aria-label="Submit form"
            >
              <Check className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 