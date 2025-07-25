"use client";
import { useState, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
      } else {
        // Create new item
        if (type === "task") {
          onCreate(title.trim(), description.trim());
        } else {
          onCreate(title.trim(), undefined, url.trim(), price.trim(), source.trim());
        }
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
    setShowInput(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateItem();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const isEditing = !!editItem;

  return (
    <>
      {/* Full-width input overlay */}
      {showInput && (
        <div className="fixed inset-0 z-[9999] flex items-end" onClick={handleCancel}>
          <div className="w-full bg-white rounded-t-xl p-6 animate-in slide-in-from-bottom-2 duration-300 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit' : 'Add'} {type === 'task' ? 'Task' : 'Shopping Item'}
              </span>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Enter ${type === 'task' ? 'task' : 'item'} title...`}
                  className="w-full px-4 py-3 text-lg border-none outline-none bg-transparent"
                  autoFocus
                />
              </div>

              {type === "task" && (
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter description (optional)..."
                    className="w-full px-4 py-3 text-lg border-none outline-none bg-transparent resize-none"
                    rows={2}
                  />
                </div>
              )}

              {type === "shopping" && (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Enter URL (optional)..."
                      className="w-full px-4 py-3 text-lg border-none outline-none bg-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Price (optional)..."
                        className="w-full px-4 py-3 text-lg border-none outline-none bg-transparent"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Source (optional)..."
                        className="w-full px-4 py-3 text-lg border-none outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <button
                onClick={handleCreateItem}
                disabled={!title.trim()}
                className={cn(
                  "absolute bottom-6 right-6 p-3 rounded-full transition-colors",
                  title.trim() 
                    ? "bg-primary hover:bg-primary/90 text-white" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <Check className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
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