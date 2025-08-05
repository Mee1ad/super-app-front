'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChangelogDialog } from '@/components/ui/changelog-dialog';
import { ErrorDemo } from '@/components/ui/error-demo';
import { useReplicacheTodo } from '../todo/atoms/ReplicacheTodoContext';
import { useReplicacheFood } from '../food-tracker/atoms/ReplicacheFoodContext';
import { useReplicacheDiary } from '../diary/atoms/ReplicacheDiaryContext';
import { useReplicacheIdeas } from '../ideas/atoms/ReplicacheIdeasContext';
import { clearAllReplicacheStorage, getReplicacheStorageSize, formatStorageSize } from '@/lib/replicache-utils';
import { 
  Settings, 
  CheckSquare, 
  Lightbulb, 
  Heart, 
  Target,
  Database,
  Trash2,
  Download,
  Upload,
  Eye,
  Bell,
} from 'lucide-react';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [storageSize, setStorageSize] = useState<string>('0 B');

  // Get Replicache contexts
  const { resetReplicache: resetTodo } = useReplicacheTodo();
  const { resetReplicache: resetFood } = useReplicacheFood();
  const { resetReplicache: resetDiary } = useReplicacheDiary();
  const { resetReplicache: resetIdeas } = useReplicacheIdeas();

  // Calculate storage size on mount
  useEffect(() => {
    const size = getReplicacheStorageSize();
    setStorageSize(formatStorageSize(size));
  }, []);

  const handleClearAllData = async () => {
    console.log('[Settings] Clear All Data button clicked');
    
    // Simple test to verify button click is working
    alert('Button clicked! Testing clear data functionality...');
    
    if (!confirm('Are you sure you want to clear all data? This will permanently delete all your todos, food entries, diary entries, and ideas. This action cannot be undone.')) {
      console.log('[Settings] User cancelled the clear operation');
      return;
    }

    console.log('[Settings] User confirmed clear operation, starting...');
    setIsClearingData(true);
    
    try {
      console.log('[Settings] Clearing all Replicache data...');
      
      // Try to clear all Replicache instances, but don't fail if they're not initialized
      const clearPromises = [];
      
      try {
        console.log('[Settings] Attempting to clear Todo data...');
        clearPromises.push(resetTodo());
      } catch (error) {
        console.log('[Settings] Todo context not initialized, skipping...', error);
      }
      
      try {
        console.log('[Settings] Attempting to clear Food data...');
        clearPromises.push(resetFood());
      } catch (error) {
        console.log('[Settings] Food context not initialized, skipping...', error);
      }
      
      try {
        console.log('[Settings] Attempting to clear Diary data...');
        clearPromises.push(resetDiary());
      } catch (error) {
        console.log('[Settings] Diary context not initialized, skipping...', error);
      }
      
      try {
        console.log('[Settings] Attempting to clear Ideas data...');
        clearPromises.push(resetIdeas());
      } catch (error) {
        console.log('[Settings] Ideas context not initialized, skipping...', error);
      }

      // Wait for any successful clears
      if (clearPromises.length > 0) {
        console.log('[Settings] Waiting for Replicache clears to complete...');
        await Promise.allSettled(clearPromises);
      }

      // Always use the comprehensive utility function to clear localStorage
      console.log('[Settings] Running comprehensive storage clear...');
      await clearAllReplicacheStorage();

      console.log('[Settings] All data cleared successfully');
      
      // Show success message
      alert('All data has been cleared successfully. The app will now reload to ensure a clean state.');
      
      // Reload the page to ensure clean state
      console.log('[Settings] Reloading page...');
      window.location.reload();
      
    } catch (error) {
      console.error('[Settings] Error clearing data:', error);
      alert('There was an error clearing the data. Please try again.');
    } finally {
      setIsClearingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Customize your Super App experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* General Settings */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Global Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4 md:h-5 md:w-5" />
                  Global Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-base font-medium">Dark Mode</span>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="h-px bg-gray-200" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-base font-medium">Notifications</span>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders and updates
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="h-px bg-gray-200" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-base font-medium">Auto Save</span>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your data
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoSave(!autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSave ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Todo App Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-blue-500" />
                  Todo & Shopping Lists
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Default Task Priority</span>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Default List View</span>
                  <Select defaultValue="grid">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid Layout</SelectItem>
                      <SelectItem value="list">List Layout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-base font-medium">Show Completed Items</span>
                    <p className="text-sm text-muted-foreground">
                      Display completed tasks and items
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>



            {/* Ideas Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Daily Ideas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Default Categories</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Project</Badge>
                    <Badge variant="secondary">Article</Badge>
                    <Badge variant="secondary">Shopping</Badge>
                    <Badge variant="secondary">Learning</Badge>
                    <Badge variant="secondary">Personal</Badge>
                    <Badge variant="secondary">Work</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Default View</span>
                  <Select defaultValue="grid">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid Layout</SelectItem>
                      <SelectItem value="list">List Layout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Diary Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Diary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Default Mood Options</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">😊 Happy</Badge>
                    <Badge variant="secondary">🤩 Excited</Badge>
                    <Badge variant="secondary">😌 Calm</Badge>
                    <Badge variant="secondary">😔 Sad</Badge>
                    <Badge variant="secondary">😠 Angry</Badge>
                    <Badge variant="secondary">😐 Neutral</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-base font-medium">Daily Reminders</span>
                    <p className="text-sm text-muted-foreground">
                      Remind me to write in my diary
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Habit Tracker Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Habit Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Streak Calculation</span>
                  <Select defaultValue="consecutive">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consecutive">Consecutive Days</SelectItem>
                      <SelectItem value="total">Total Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-base font-medium">Habit Reminders</span>
                    <p className="text-sm text-muted-foreground">
                      Get daily reminders for habits
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>Storage Used:</span>
                  <span className="font-medium">{storageSize}</span>
                </div>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" 
                  onClick={handleClearAllData} 
                  disabled={isClearingData}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isClearingData ? 'Clearing All Data...' : 'Clear All Data'}
                </Button>
                {isClearingData && (
                  <p className="text-xs text-muted-foreground text-center">
                    This may take a moment...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Analytics</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Crash Reports</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Usage Data</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Error Handling Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Error Handling Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ErrorDemo />
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About Super App</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Version 1.0.0
                </p>
                <p className="text-sm text-muted-foreground">
                  A comprehensive productivity toolkit
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm"
                  onClick={() => setIsChangelogOpen(true)}
                >
                  View Changelog
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <ChangelogDialog 
        isOpen={isChangelogOpen} 
        onClose={() => setIsChangelogOpen(false)} 
      />
    </div>
  );
} 