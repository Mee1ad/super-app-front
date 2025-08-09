'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReplicacheTodo } from '@/app/todo/atoms/ReplicacheTodoContext';
import { useReplicacheDiary } from '@/app/diary/atoms/ReplicacheDiaryContext';
import { useReplicacheIdeas } from '@/app/ideas/atoms/ReplicacheIdeasContext';
import { useReplicacheFood } from '@/app/food-tracker/atoms/ReplicacheFoodContext';

export default function TestClearData() {
  const [isClearing, setIsClearing] = useState(false);
  const { resetReplicache: resetTodo, rep: todoRep } = useReplicacheTodo();
  const { resetReplicache: resetDiary } = useReplicacheDiary();
  const { resetReplicache: resetIdeas } = useReplicacheIdeas();
  const { resetReplicache: resetFood } = useReplicacheFood();

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await Promise.all([
        resetTodo(),
        resetDiary(),
        resetIdeas(),
        resetFood(),
      ]);
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearTodoMutations = async () => {
    setIsClearing(true);
    try {
      if (todoRep) {
        // Force a push to clear any pending mutations
        await todoRep.push();
        console.log('Todo mutations cleared successfully');
      } else {
        console.log('Todo Replicache not initialized');
      }
    } catch (error) {
      console.error('Error clearing todo mutations:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clear Data (Debug)</CardTitle>
          <CardDescription>
            Clear all Replicache data for debugging purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleClearAllData} 
              disabled={isClearing}
              variant="destructive"
            >
              {isClearing ? 'Clearing...' : 'Clear All Data'}
            </Button>
            <Button 
              onClick={handleClearTodoMutations} 
              disabled={isClearing}
              variant="outline"
            >
              {isClearing ? 'Clearing...' : 'Force Push Todo Mutations'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Use "Force Push Todo Mutations" to clear accumulated mutations. Use "Clear All Data" for a complete reset.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 