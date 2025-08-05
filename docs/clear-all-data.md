# Clear All Data Functionality

## Overview

The "Clear All Data" feature in the settings page allows users to completely reset all local Replicache storage for all apps in the Super App. This functionality is designed to provide users with a way to start fresh with their data.

## Implementation Details

### Components Involved

1. **Settings Page** (`app/settings/page.tsx`)
   - Main UI for the clear data functionality
   - Shows storage size and clear button
   - Handles user confirmation and feedback

2. **Replicache Contexts**
   - `app/todo/atoms/ReplicacheTodoContext.tsx` - Todo data
   - `app/food-tracker/atoms/ReplicacheFoodContext.tsx` - Food tracker data
   - `app/diary/atoms/ReplicacheDiaryContext.tsx` - Diary data
   - `app/ideas/atoms/ReplicacheIdeasContext.tsx` - Ideas data

3. **Utility Functions** (`lib/replicache-utils.ts`)
   - `clearAllReplicacheStorage()` - Comprehensive storage clearing
   - `getReplicacheStorageSize()` - Calculate storage usage
   - `formatStorageSize()` - Format bytes to human-readable format

### How It Works

1. **User Confirmation**: When the user clicks "Clear All Data", a confirmation dialog appears warning about the permanent nature of the action.

2. **Reset Replicache Instances**: Each Replicache context has a `resetReplicache()` function that:
   - Closes the current Replicache instance
   - Clears localStorage keys specific to that instance
   - Resets the component state to empty arrays

3. **Comprehensive Storage Clear**: The utility function `clearAllReplicacheStorage()` performs additional cleanup:
   - Clears all localStorage keys starting with `replicache-`
   - Clears any sessionStorage keys starting with `replicache-`
   - Attempts to clear IndexedDB databases containing "replicache"

4. **User Feedback**: 
   - Shows loading state during the process
   - Displays success message
   - Reloads the page to ensure clean state

### Storage Keys Cleared

The following localStorage keys are cleared:
- `replicache-todo-replicache-flat*`
- `replicache-food-tracker-replicache*`
- `replicache-diary-replicache*`
- `replicache-ideas-replicache*`
- Any other keys starting with `replicache-`

### Safety Features

1. **Confirmation Dialog**: Users must confirm the action before proceeding
2. **Error Handling**: Comprehensive error handling with user feedback
3. **Loading States**: Visual feedback during the clearing process
4. **Page Reload**: Ensures clean state after clearing

### Testing

A test component is available at `app/settings/test-clear-data.tsx` for development and debugging purposes.

## Usage

1. Navigate to Settings page
2. Scroll to the "Data Management" section
3. Click "Clear All Data"
4. Confirm the action in the dialog
5. Wait for the process to complete
6. The page will reload automatically

## Notes

- This action is irreversible
- All local data will be permanently deleted
- The app will reload after clearing to ensure a clean state
- Storage size is displayed to help users understand their data usage 