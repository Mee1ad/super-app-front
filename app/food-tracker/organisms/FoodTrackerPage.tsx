'use client';
import { useState } from 'react';
import { ReplicacheFoodProvider } from '../atoms/ReplicacheFoodContext';
import { useFoodApi } from '../atoms/useFoodApi';
import { NewFoodEntry } from '../molecules/NewFoodEntry';
import { Plus, Trash2, Edit } from 'lucide-react';
import { FoodTrackerHeader } from './FoodTrackerHeader';
import { useSidebar } from '../../shared/organisms/SidebarContext';

export default function FoodTrackerPage() {
  const { toggleMobileMenu } = useSidebar();
  return (
    <ReplicacheFoodProvider>
      <FoodTrackerHeader onMenu={toggleMobileMenu} />
      <FoodTrackerPageInner />
    </ReplicacheFoodProvider>
  );
}

function FoodTrackerPageInner() {
  const { entries, createEntry, updateEntry, deleteEntry } = useFoodApi();
  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  // Sort by date/time desc
  const sorted = [...entries].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  return (
    <div className="w-full min-h-screen bg-background flex flex-col relative">
      <div className="flex-1 flex flex-col gap-2 p-4 pb-24">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <span className="text-lg">No food entries yet</span>
            <span className="text-sm">Tap + to add your first meal</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map(entry => (
              <FoodEntryRow
                key={entry.id}
                entry={entry}
                onEdit={() => setEditEntry(entry)}
                onDelete={() => deleteEntry(entry.id)}
              />
            ))}
          </div>
        )}
      </div>
      {/* Floating Add Button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50"
        onClick={() => setShowAdd(true)}
        aria-label="Add food entry"
      >
        <Plus className="h-6 w-6" />
      </button>
      {showAdd && (
        <NewFoodEntry
          onCreate={async entry => {
            await createEntry(entry);
            setShowAdd(false);
          }}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editEntry && (
        <NewFoodEntry
          initial={editEntry}
          onCreate={async entry => {
            await updateEntry(editEntry.id, entry);
            setEditEntry(null);
          }}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  );
}

function FoodEntryRow({ entry, onEdit, onDelete }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-3 rounded-lg bg-card shadow-sm border border-border hover:bg-accent cursor-pointer group"
      onClick={onEdit}
      onContextMenu={e => { e.preventDefault(); onEdit(); }}
      tabIndex={0}
      role="button"
      aria-label={`Edit food entry ${entry.name}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{entry.name}</span>
          {entry.price !== undefined && (
            <span className="text-xs text-muted-foreground">{entry.price} تومان</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>{entry.mealType}</span>
          <span>{entry.date}</span>
          <span>{entry.time}</span>
        </div>
      </div>
      <button
        className="p-2 rounded-full hover:bg-destructive/10 text-destructive"
        onClick={e => { e.stopPropagation(); onDelete(); }}
        aria-label="Delete food entry"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <button
        className="p-2 rounded-full hover:bg-accent text-muted-foreground"
        onClick={e => { e.stopPropagation(); onEdit(); }}
        aria-label="Edit food entry"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
  );
}