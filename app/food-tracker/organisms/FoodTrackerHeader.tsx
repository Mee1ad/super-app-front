'use client';
import { Menu, Trash2, RotateCcw } from 'lucide-react';
import { useSidebar } from '../../shared/organisms/SidebarContext';
import { useReplicacheFood } from '../atoms/ReplicacheFoodContext';

export function FoodTrackerHeader({ onMenu }: { onMenu: () => void }) {
  const { resetReplicache } = useReplicacheFood();

  const handleReset = async () => {
    if (confirm('Are you sure you want to clear all food data? This will remove all entries and reset the app.')) {
      await resetReplicache();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenu}
            className="md:hidden p-2 -ml-2 rounded-md hover:bg-accent"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Food Tracker</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
            aria-label="Reset food data"
            title="Clear all food data and reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}