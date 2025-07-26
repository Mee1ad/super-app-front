"use client";
import { useState, useEffect } from "react";
import { ListTodo, ShoppingCart, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileKeyboardFocusWithBackGesture } from "@/hooks/use-mobile-keyboard-focus";
import { motion } from "framer-motion";

export type AddNewListProps = {
  onCreate: (type: "task" | "shopping", title?: string) => void;
};

export function AddNewList({ onCreate }: AddNewListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [listName, setListName] = useState("");
  const [selectedType, setSelectedType] = useState<"task" | "shopping" | null>(null);
  
  // Prevent scroll when form is open
  useEffect(() => {
    if (showInput || isOpen) {
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
  }, [showInput, isOpen])
  
  const { ref: listNameInputRef, keyboardHeight } = useMobileKeyboardFocusWithBackGesture(
    showInput,
    () => {
      // Auto-close form when keyboard is dismissed on mobile
      if (window.innerWidth <= 768) {
        handleCancel();
      }
    },
    () => {
      // Auto-close form when back gesture is used
      if (window.innerWidth <= 768 && (showInput || isOpen)) {
        handleCancel();
      }
    }
  );

  const options = [
    { value: "task", label: "Task List", icon: ListTodo },
    { value: "shopping", label: "Shopping List", icon: ShoppingCart },
  ];

  const handleOptionSelect = (type: "task" | "shopping") => {
    setSelectedType(type);
    setShowInput(true);
  };

  const handleCreateList = () => {
    if (listName.trim() && selectedType) {
      onCreate(selectedType, listName.trim());
      // Keep form open for adding another list
      setListName("");
      setSelectedType(null);
      setShowInput(false);
      // Don't close the main overlay, keep it open for more lists
    }
  };

  const handleCancel = () => {
    setListName("");
    setSelectedType(null);
    setShowInput(false);
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateList();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <>
      {/* Keyboard-attached form overlay */}
      {showInput && (
        <>
          {/* Dark background overlay */}
          <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={handleCancel} />
          
          {/* Keyboard-attached form */}
          <div className="fixed inset-0 z-[9999] flex items-end" onClick={handleCancel}>
            <div 
              className="w-full bg-white rounded-t-xl animate-in fade-in-0 duration-300 shadow-lg" 
              onClick={(e) => e.stopPropagation()}
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
                      placeholder={`Enter ${selectedType === 'task' ? 'task' : 'shopping'} list name...`}
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
                    aria-label="Close form"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  {/* Add button */}
                  <button
                    onClick={handleCreateList}
                    disabled={!listName.trim()}
                    className={cn(
                      "p-3 rounded-full transition-colors shadow-lg",
                      listName.trim() 
                        ? "bg-primary hover:bg-primary/90 text-white" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    <Check className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Options overlay */}
      {isOpen && !showInput && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}>
          <div className="absolute bottom-20 right-6 mb-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            {options.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center gap-4 bg-white border rounded-lg shadow-lg px-6 py-4 cursor-pointer hover:bg-gray-50 transition-all duration-300 transform",
                    "animate-in fade-in-0",
                    isOpen ? "opacity-100" : "opacity-0"
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both"
                  }}
                  onClick={() => handleOptionSelect(option.value as "task" | "shopping")}
                >
                  <Icon className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {option.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg",
          "flex items-center justify-center",
          isOpen && "rotate-45"
        )}
        style={{ position: 'fixed' }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ 
          duration: 0.4, 
          ease: "easeOut",
          delay: 0.2,
          type: "spring", 
          damping: 25, 
          stiffness: 300
        }}
        aria-label="Add new list"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </motion.button>
    </>
  );
} 