'use client';
import { ListRow } from "../molecules/ListRow";

interface List {
  id: string;
  title: string;
  type: "task" | "shopping";
  tasks?: any[];
  items?: any[];
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
        <ListRow
          key={list.id}
          id={list.id}
          title={list.title}
          type={list.type}
          itemCount={list.type === "task" ? (list.tasks?.length || 0) : (list.items?.length || 0)}
          onUpdateTitle={onUpdateTitle}
          onDelete={onDelete}
          onClick={onListClick}
          isLast={index === lists.length - 1}
        />
      ))}
    </div>
  );
} 