'use client';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export function FoodTrackerHeader({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border h-14 flex items-center shadow-sm md:rounded-b-xl">
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="h-12 w-12 flex items-center justify-center rounded-full ml-2 md:ml-4 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Open menu"
        onClick={onMenu}
        type="button"
      >
        <Menu className="w-6 h-6 text-muted-foreground" />
      </motion.button>
      <div className="flex-1 flex justify-center items-center">
        <span className="text-lg font-semibold select-none">Food Tracker</span>
      </div>
      {/* Right spacer for symmetry */}
      <div className="w-12 md:w-14" />
    </header>
  );
}