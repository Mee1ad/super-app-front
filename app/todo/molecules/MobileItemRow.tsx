'use client';
import { Edit, Trash2, Check, ExternalLink } from "lucide-react";
import { TaskItemProps } from "../atoms/TaskItem";
import { ShoppingItemProps } from "../atoms/ShoppingItem";

interface MobileItemRowProps {
  item: TaskItemProps | ShoppingItemProps;
  type: "task" | "shopping";
  onUpdate: (item: TaskItemProps | ShoppingItemProps) => void;
  onDelete: (id: string) => void;
  onToggle?: (id: string) => void;
  onEdit?: (item: TaskItemProps | ShoppingItemProps) => void;
  isLast?: boolean;
}

export function MobileItemRow({ 
  item, 
  type, 
  onUpdate, 
  onDelete, 
  onToggle,
  onEdit,
  isLast = false 
}: MobileItemRowProps) {

  const handleToggle = () => {
    if (onToggle) {
      onToggle(item.id);
    } else {
      // For shopping items without onToggle, update directly
      if (type === "shopping") {
        const shoppingItem = item as ShoppingItemProps;
        onUpdate({
          ...shoppingItem,
          checked: !shoppingItem.checked,
        });
      }
    }
  };

  const getItemIcon = () => {
    return type === "task" ? "📝" : "🛍️";
  };

  const isChecked = type === "task" 
    ? (item as TaskItemProps).checked 
    : (item as ShoppingItemProps).checked;

  return (
    <>
      <div className="flex items-center justify-between py-4 px-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={handleToggle}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isChecked 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {isChecked && <Check className="w-3 h-3" />}
          </button>
          
          <span className="text-lg">{getItemIcon()}</span>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <h3 className={`text-base font-medium truncate ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {item.title}
              </h3>
              {type === "task" && (item as TaskItemProps).description && (
                <p className={`text-sm truncate ${isChecked ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                  {(item as TaskItemProps).description}
                </p>
              )}
              {type === "shopping" && (
                <div className="flex flex-col gap-1">
                  {(item as ShoppingItemProps).url && (
                    <div className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                      <a 
                        href={(item as ShoppingItemProps).url.startsWith('http') ? (item as ShoppingItemProps).url : `https://${(item as ShoppingItemProps).url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm truncate ${isChecked ? 'line-through text-gray-400' : 'text-blue-600 hover:underline'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(item as ShoppingItemProps).url}
                      </a>
                    </div>
                  )}
                  {(item as ShoppingItemProps).price && (
                    <p className={`text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                      ${(item as ShoppingItemProps).price}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Edit 
            data-testid="edit-item-icon"
            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" 
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) {
                onEdit(item);
              }
            }} 
          />
          <Trash2 
            data-testid="delete-item-icon"
            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-600 transition-colors" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }} 
          />
        </div>
      </div>
      {!isLast && <div className="border-b border-gray-200" />}
    </>
  );
} 