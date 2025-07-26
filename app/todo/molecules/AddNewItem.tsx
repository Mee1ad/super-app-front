"use client";
import { useState, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileKeyboardFocusWithBackGesture } from "@/hooks/use-mobile-keyboard-focus";

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
      setShowInput(true);
    } else {
      // Reset form when not editing
      setTitle("");
      setDescription("");
      setUrl("");
      setPrice("");
      setSource("");
      setShowInput(false);
    }
  }, [editItem]);

  const handleCreateItem = () => {
    if (title.trim()) {
      if (editItem && onUpdate) {
        // Update existing item
        onUpdate(editItem.id, title.trim(), description.trim(), url.trim(), price.trim(), source.trim());
        handleCancel();
      } else {
        // Create new item
        if (type === "task") {
          onCreate(title.trim(), description.trim());
        } else {
          onCreate(title.trim(), undefined, url.trim(), price.trim(), source.trim());
        }
        // Keep form open for adding another item
        setTitle("");
        setDescription("");
        setUrl("");
        setPrice("");
        setSource("");
        setShowUrlInput(false);
        setShowPriceInput(false);
        setShowSourceInput(false);
        // Re-focus the title input for quick entry
        setTimeout(() => {
          titleInputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setPrice("");
    setSource("");
    setShowInput(false);
    setShowUrlInput(false);
    setShowPriceInput(false);
    setShowSourceInput(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // For shopping items, check if there are active input fields to navigate through
      if (type === "shopping") {
        const currentTarget = e.target as HTMLInputElement;
        const isTitleInput = currentTarget.placeholder?.includes('title');
        const isUrlInput = currentTarget.placeholder?.includes('URL');
        const isPriceInput = currentTarget.placeholder?.includes('Price');
        const isSourceInput = currentTarget.placeholder?.includes('Source');
        
        // Navigate to next visible input field
        if (isTitleInput && showUrlInput) {
          // Move to URL input
          const urlInput = document.querySelector('input[placeholder*="URL"]') as HTMLInputElement;
          if (urlInput) urlInput.focus();
        } else if (isUrlInput && showPriceInput) {
          // Move to Price input
          const priceInput = document.querySelector('input[placeholder*="Price"]') as HTMLInputElement;
          if (priceInput) priceInput.focus();
        } else if (isPriceInput && showSourceInput) {
          // Move to Source input
          const sourceInput = document.querySelector('input[placeholder*="Source"]') as HTMLInputElement;
          if (sourceInput) sourceInput.focus();
        } else if (isSourceInput) {
          // Last input field, submit the form
          handleCreateItem();
        } else if (isTitleInput && !showUrlInput && showPriceInput) {
          // Skip URL, go to Price
          const priceInput = document.querySelector('input[placeholder*="Price"]') as HTMLInputElement;
          if (priceInput) priceInput.focus();
        } else if (isTitleInput && !showUrlInput && !showPriceInput && showSourceInput) {
          // Skip URL and Price, go to Source
          const sourceInput = document.querySelector('input[placeholder*="Source"]') as HTMLInputElement;
          if (sourceInput) sourceInput.focus();
        } else {
          // No more visible inputs, submit the form
          handleCreateItem();
        }
      } else {
        // For tasks, just submit the form
        handleCreateItem();
      }
    }
  };

  const handleFormClick = (e: React.MouseEvent) => {
    // Prevent keyboard from closing when clicking inside the form
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFormTouch = (e: React.TouchEvent) => {
    // Prevent keyboard from closing when touching inside the form
    e.preventDefault();
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
              className="w-full bg-white rounded-t-xl animate-in slide-in-from-bottom-2 duration-300 shadow-lg" 
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
                      placeholder={`Enter ${type === 'task' ? 'task' : 'item'} title...`}
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
                        placeholder="Enter description (optional)..."
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
                            placeholder="Enter URL (optional)..."
                            className="w-full text-base border-none outline-none bg-transparent"
                          />
                        </div>
                      )}
                      {(showPriceInput || showSourceInput) && (
                        <div className="grid grid-cols-2 gap-4">
                          {showPriceInput && (
                            <div className="relative">
                              <input
                                type="text"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Price (optional)..."
                                className="w-full text-base border-none outline-none bg-transparent"
                              />
                            </div>
                          )}
                          {showSourceInput && (
                            <div className="relative">
                              <input
                                type="text"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Source (optional)..."
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
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className={cn(
              "w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg",
              "flex items-center justify-center transition-all duration-300 transform",
              "hover:scale-110 active:scale-95"
            )}
            aria-label={`Add ${type === 'task' ? 'task' : 'shopping item'}`}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
} 