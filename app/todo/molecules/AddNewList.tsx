"use client";
import { useState } from "react";
import { ListTodo, ShoppingCart, Plus, X, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type AddNewListProps = {
  onCreate: (type: "task" | "shopping", title?: string) => void;
};

export function AddNewList({ onCreate }: AddNewListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [listName, setListName] = useState("");
  const [selectedType, setSelectedType] = useState<"task" | "shopping" | null>(null);

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
      setListName("");
      setSelectedType(null);
      setShowInput(false);
      setIsOpen(false);
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
      {/* Full-width input overlay */}
      {showInput && (
        <div className="fixed inset-0 z-[9999] flex items-end" onClick={handleCancel}>
          <div className="w-full bg-white rounded-t-xl p-6 animate-in slide-in-from-bottom-2 duration-300 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setShowInput(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-lg font-medium text-gray-900">
                Create {selectedType === 'task' ? 'Task' : 'Shopping'} List
              </span>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Enter ${selectedType === 'task' ? 'task' : 'shopping'} list name...`}
                className="w-full px-4 py-3 text-lg border-none outline-none bg-transparent"
                autoFocus
              />
              
              <button
                onClick={handleCreateList}
                disabled={!listName.trim()}
                className={cn(
                  "absolute bottom-1 right-1 p-3 rounded-full transition-colors",
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
      )}

      {/* Options overlay */}
      {isOpen && !showInput && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}>
          <div className="absolute bottom-16 right-0 mb-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            {options.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center gap-3 bg-white border rounded-lg shadow-lg px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all duration-300 transform",
                    "animate-in slide-in-from-bottom-2 fade-in-0",
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both"
                  }}
                  onClick={() => handleOptionSelect(option.value as "task" | "shopping")}
                >
                  <Icon className="w-5 h-5 text-gray-600" />
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
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg",
            "flex items-center justify-center transition-all duration-300 transform",
            "hover:scale-110 active:scale-95",
            isOpen && "rotate-45"
          )}
          aria-label="Add new list"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>
    </>
  );
} 