'use client';
import { Edit, Trash2, Check, Move } from "lucide-react";
import { TaskItemProps } from "../atoms/TaskItem";
import { ShoppingItemProps } from "../atoms/ShoppingItem";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { motion } from "framer-motion";

interface MobileItemRowProps {
  item: TaskItemProps | ShoppingItemProps;
  type: "task" | "shopping";
  onUpdate: (item: TaskItemProps | ShoppingItemProps) => void;
  onDelete: (id: string) => void;
  onToggle?: (id: string) => void;
  onEdit?: (item: TaskItemProps | ShoppingItemProps) => void;
  onReorder?: () => void;
  isLast?: boolean;
}

export function MobileItemRow({ 
  item, 
  type, 
  onUpdate, 
  onDelete, 
  onToggle,
  onEdit,
  onReorder,
  isLast = false 
}: MobileItemRowProps) {

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleEdit = () => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = () => {
    onDelete(item.id);
  };

  const handleReorder = () => {
    if (onReorder) {
      onReorder();
    }
  };



  const isChecked = type === "task" 
    ? (item as TaskItemProps).checked 
    : (item as ShoppingItemProps).checked;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          className={cn(
            "flex items-center gap-4 py-3 bg-white border-b border-gray-100 w-full",
            isLast && "rounded-b-lg"
          )}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            // Don't trigger edit if clicking on checkbox or price area
            const target = e.target as HTMLElement;
            const isCheckbox = target.closest('button');
            const isPrice = target.closest('.text-right');
            
            if (!isCheckbox && !isPrice && onEdit) {
              onEdit(item);
            }
          }}
          role="button"
          tabIndex={0}
          style={{ cursor: "pointer" }}
        >
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
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <h3 className={`text-base font-medium truncate ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {type === "shopping" && (item as ShoppingItemProps).url ? (
                      <a 
                        href={(item as ShoppingItemProps).url.startsWith('http') ? (item as ShoppingItemProps).url : `https://${(item as ShoppingItemProps).url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${isChecked ? 'line-through text-gray-500' : 'text-blue-600 hover:underline'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  {type === "task" && (item as TaskItemProps).description && (
                    <p className={`text-sm truncate ${isChecked ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                      {(item as TaskItemProps).description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {type === "shopping" && (item as ShoppingItemProps).price && (
                <div className="text-right">
                  <motion.p 
                    className={`text-lg font-semibold ${isChecked ? 'line-through text-gray-400' : 'text-gray-900'} cursor-pointer`}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEdit) {
                        onEdit(item);
                      }
                    }}
                  >
                    {(item as ShoppingItemProps).price}
                  </motion.p>
                </div>
              )}
            </div>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="p-2">
        <ContextMenuItem onClick={handleEdit}>
          <Edit className="w-4 h-4 mr-2" /> Edit
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleReorder}>
          <Move className="w-4 h-4 mr-2" /> Reorder
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} variant="destructive">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
} 