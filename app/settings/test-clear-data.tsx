'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { clearAllReplicacheStorage, getReplicacheStorageSize, formatStorageSize } from '@/lib/replicache-utils';
import { useReplicacheTodo } from '../todo/atoms/ReplicacheTodoContext';
import { useReplicacheFood } from '../food-tracker/atoms/ReplicacheFoodContext';
import { useReplicacheDiary } from '../diary/atoms/ReplicacheDiaryContext';
import { useReplicacheIdeas } from '../ideas/atoms/ReplicacheIdeasContext';

export function TestClearData() {
  const [isClearing, setIsClearing] = useState(false);
  const [storageSize, setStorageSize] = useState<string>('0 B');
  const [logs, setLogs] = useState<string[]>([]);

  // Get Replicache contexts
  const { resetReplicache: resetTodo } = useReplicacheTodo();
  const { resetReplicache: resetFood } = useReplicacheFood();
  const { resetReplicache: resetDiary } = useReplicacheDiary();
  const { resetReplicache: resetIdeas } = useReplicacheIdeas();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const updateStorageSize = () => {
    const size = getReplicacheStorageSize();
    setStorageSize(formatStorageSize(size));
  };

  const handleTestClear = async () => {
    setIsClearing(true);
    setLogs([]);
    
    try {
      addLog('Starting clear all data test...');
      
      // Update storage size before clearing
      updateStorageSize();
      addLog(`Storage size before clear: ${storageSize}`);
      
      // Clear all Replicache instances
      addLog('Clearing Replicache instances...');
      await Promise.all([
        resetTodo().then(() => addLog('Todo data cleared')),
        resetFood().then(() => addLog('Food data cleared')),
        resetDiary().then(() => addLog('Diary data cleared')),
        resetIdeas().then(() => addLog('Ideas data cleared'))
      ]);

      // Use the comprehensive utility function
      addLog('Clearing all Replicache storage...');
      await clearAllReplicacheStorage();
      addLog('All Replicache storage cleared');

      // Update storage size after clearing
      updateStorageSize();
      addLog(`Storage size after clear: ${storageSize}`);
      
      addLog('✅ Clear all data test completed successfully!');
      
    } catch (error) {
      addLog(`❌ Error during clear test: ${error}`);
      console.error('[Test] Error clearing data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Test Clear All Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Current Storage Size:</span>
          <span className="font-medium">{storageSize}</span>
        </div>
        
        <Button 
          onClick={handleTestClear} 
          disabled={isClearing}
          variant="destructive"
        >
          {isClearing ? 'Testing Clear...' : 'Test Clear All Data'}
        </Button>
        
        {logs.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Test Logs:</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 