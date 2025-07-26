'use client';
import { motion } from 'framer-motion';
import { ListRow } from "../molecules/ListRow";

interface List {
  id: string;
  title: string;
  type: "task" | "shopping";
  tasks?: unknown[];
  items?: unknown[];
}

interface MobileListViewProps {
  lists: List[];
  onUpdateTitle?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  onListClick?: (id: string) => void;
}

export function MobileListView({ lists, onUpdateTitle, onDelete, onListClick }: MobileListViewProps) {
  return (
    <div className="w-full">
      {lists.map((list, index) => (
        <motion.div
          key={list.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.1 }}
        >
          <ListRow
            id={list.id}
            title={list.title}
            type={list.type}
            itemCount={list.type === "task" ? (list.tasks?.length || 0) : (list.items?.length || 0)}
            onUpdateTitle={onUpdateTitle}
            onDelete={onDelete}
            onClick={onListClick}
            isLast={index === lists.length - 1}
          />
        </motion.div>
      ))}
    </div>
  );
} 