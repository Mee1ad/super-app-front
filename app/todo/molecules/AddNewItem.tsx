"use client";
import { useState, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileKeyboardFocusWithBackGesture } from "@/hooks/use-mobile-keyboard-focus";
import { motion } from "framer-motion";

export type AddNewItemProps = {
  type: "task" | "shopping";
  onCreate: (title: string, description?: string, url?: string, price?: string, source?: string) => void;
  onUpdate?: (id: string, title: string, description?: string, url?: string, price?: string, source?: string) => void;
  editItem?: {
    id: string;
    title: string;
    description?: string;
    url?: string;
    price?: string;
    source?: string;
  } | null;
};

export function AddNewItem({ type, onCreate, onUpdate, editItem }: AddNewItemProps) {
  const [showInput, setShowInput] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [source, setSource] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [showSourceInput, setShowSourceInput] = useState(false);
  
  // Prevent scroll when form is open
  useEffect(() => {
    if (showInput) {
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
  }, [showInput])
  
  const { ref: titleInputRef, keyboardHeight } = useMobileKeyboardFocusWithBackGesture(
    showInput, 
    () => {
      // Auto-close form when keyboard is dismissed on mobile
      if (window.innerWidth <= 768) {
        handleCancel();
      }
    },
    () => {
      // Auto-close form when back gesture is used
      if (window.innerWidth <= 768 && showInput) {
        handleCancel();
      }
    }
  );

  // Update form when editItem changes
  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDescription(editItem.description || "");
      setUrl(editItem.url || "");
      setPrice(editItem.price || "");
      setSource(editItem.source || "");
      
      // Auto-show input fields if there's data
      setShowUrlInput(!!editItem.url);
      setShowPriceInput(!!editItem.price);
      setShowSourceInput(!!editItem.source);
      
      setShowInput(true);
    } else {
      // Reset form when not editing
      setTitle("");
      setDescription("");
      setUrl("");
      setPrice("");
      setSource("");
      setShowUrlInput(false);
      setShowPriceInput(false);
      setShowSourceInput(false);
      setShowInput(false);
    }
  }, [editItem]);

  const handleCreateItem = () => {
    if (title.trim()) {
      if (editItem) {
        // Update existing item
        onUpdate?.(editItem.id, title, description, url, price, source);
      } else {
        // Create new item
        onCreate(title, description, url, price, source);
      }
      handleCancel();
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setPrice("");
    setSource("");
    setShowUrlInput(false);
    setShowPriceInput(false);
    setShowSourceInput(false);
    setShowInput(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleCreateItem();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateItem();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleFormClick = (e: React.MouseEvent) => {
    // Only prevent propagation, don't prevent default to allow input interaction
    e.stopPropagation();
  };

  const handleFormTouch = (e: React.TouchEvent) => {
    // Only prevent propagation, don't prevent default to allow input interaction
    e.stopPropagation();
  };

  const isEditing = !!editItem;

  return (
    <>
      {/* Full-width input overlay */}
      {showInput && (
        <>
          {/* Dark background overlay */}
          <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={handleCancel} />
          
          <div className="fixed inset-0 z-[9999] flex items-end" onClick={handleCancel}>
            <div 
              className="w-full bg-white rounded-t-xl animate-in fade-in-0 duration-300 shadow-lg" 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleFormClick}
              onTouchStart={handleFormTouch}
              style={{
                transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'none',
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="flex flex-col h-full">
                {/* Form content area */}
                <div className="flex flex-col gap-2 p-6 flex-1" onMouseDown={handleFormClick} onTouchStart={handleFormTouch}>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Title"
                      className="w-full text-base border-none outline-none bg-transparent"
                      autoFocus
                      ref={titleInputRef}
                    />
                  </div>

                  {/* For task: description and action buttons in one row */}
                  {type === "task" && (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Description"
                        className="flex-1 text-base border-none outline-none bg-transparent"
                      />
                      {/* Close button */}
                      <button
                        onClick={handleCancel}
                        onMouseDown={handleFormClick}
                        onTouchStart={handleFormTouch}
                        className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors shadow-lg flex-shrink-0"
                        aria-label="Close form"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      {/* Add button */}
                      <button
                        onClick={handleCreateItem}
                        onMouseDown={handleFormClick}
                        onTouchStart={handleFormTouch}
                        disabled={!title.trim()}
                        className={cn(
                          "p-3 rounded-full transition-colors shadow-lg flex-shrink-0",
                          title.trim() 
                            ? "bg-primary hover:bg-primary/90 text-white" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                      >
                        <Check className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  {/* For shopping: keep previous layout */}
                  {type === "shopping" && (
                    <div className="flex flex-col gap-4">
                      {showUrlInput && (
                        <div className="relative">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="URL"
                            className="w-full text-base border-none outline-none bg-transparent"
                          />
                        </div>
                      )}
                      {(showPriceInput || showSourceInput) && (
                        <div className="grid grid-cols-2 gap-4">
                          {showSourceInput && (
                            <div className="relative">
                              <input
                                type="text"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Source"
                                className="w-full text-base border-none outline-none bg-transparent"
                              />
                            </div>
                          )}
                          {showPriceInput && (
                            <div className="relative">
                              <input
                                type="text"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Price"
                                className="w-full text-base border-none outline-none bg-transparent"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons for shopping type positioned at bottom of form overlay */}
                {type === "shopping" && (
                  <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
                    {/* Shopping item toggle buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`px-3 py-2 rounded-md border-2 text-sm font-medium transition-all duration-200 touch-manipulation ${
                          showUrlInput 
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                            : 'border-blue-600 text-blue-600 active:bg-blue-600 active:text-white active:scale-95'
                        }`}
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        onMouseDown={handleFormClick}
                        onTouchStart={handleFormTouch}
                      >
                        URL
                      </button>
                      
                      <button
                        type="button"
                        className={`px-3 py-2 rounded-md border-2 text-sm font-medium transition-all duration-200 touch-manipulation ${
                          showPriceInput 
                            ? 'border-green-600 bg-green-600 text-white shadow-md' 
                            : 'border-green-600 text-green-600 active:bg-green-600 active:text-white active:scale-95'
                        }`}
                        onClick={() => setShowPriceInput(!showPriceInput)}
                        onMouseDown={handleFormClick}
                        onTouchStart={handleFormTouch}
                      >
                        Price
                      </button>
                      
                      <button
                        type="button"
                        className={`px-3 py-2 rounded-md border-2 text-sm font-medium transition-all duration-200 touch-manipulation ${
                          showSourceInput 
                            ? 'border-purple-600 bg-purple-600 text-white shadow-md' 
                            : 'border-purple-600 text-purple-600 active:bg-purple-600 active:text-white active:scale-95'
                        }`}
                        onClick={() => setShowSourceInput(!showSourceInput)}
                        onMouseDown={handleFormClick}
                        onTouchStart={handleFormTouch}
                      >
                        Source
                      </button>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancel}
                        onMouseDown={handleFormClick}
                        onTouchStart={handleFormTouch}
                        className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors shadow-lg"
                        aria-label="Close form"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCreateItem}
                        onMouseDown={handleFormClick}
                        onTouchStart={handleFormTouch}
                        disabled={!title.trim()}
                        className={cn(
                          "p-3 rounded-full transition-colors shadow-lg",
                          title.trim() 
                            ? "bg-primary hover:bg-primary/90 text-white" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                      >
                        <Check className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Action Button - Only show when not editing */}
      {!isEditing && (
        <motion.button
          type="button"
          onClick={() => setShowInput(true)}
          className={cn(
            "fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg",
            "flex items-center justify-center"
          )}
          aria-label={`Add ${type === 'task' ? 'task' : 'shopping item'}`}
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
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}
    </>
  );
}