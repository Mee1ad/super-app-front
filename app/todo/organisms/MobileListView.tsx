'use client';
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
      {lists.length === 0 ? (
        <div className="w-full flex justify-center mt-20 mb-4">
          <span className="text-lg text-gray-500 font-medium">There is nothing here, lets add some data</span>
        </div>
      ) : (
        <>
          {lists.map((list, index) => (
            <div
              key={list.id}
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
            </div>
          ))}
        </>
      )}
    </div>
  );
} 