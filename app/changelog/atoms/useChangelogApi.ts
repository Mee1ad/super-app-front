import { useState, useCallback, useEffect } from 'react';
import { changelogApi, ApiError } from './api';
import {
  ChangelogEntry,
  ChangelogListResponse,
  ChangelogSummary,
  ChangelogUpdateRequest,
  ChangelogFilters,
  UnreadChangelogResponse,
  VersionsResponse,
  CurrentVersionResponse,
  ProcessCommitsResponse,
  MarkViewedRequest,
  PublishRequest,
} from './types';

interface UseChangelogApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseChangelogApiReturn<T> extends UseChangelogApiState<T> {
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Generic hook for API operations
function useApiOperation<T>(
  operation: () => Promise<T>,
  dependencies: unknown[] = []
): UseChangelogApiReturn<T> {
  const [state, setState] = useState<UseChangelogApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await operation();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, [operation]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  return {
    ...state,
    refetch: execute,
    setData,
    setError,
    setLoading,
  };
}

// Hook for changelog entries with filters
export function useChangelogEntries(filters: ChangelogFilters = {}) {
  const operation = useCallback(
    () => changelogApi.getChangelogEntries(filters),
    [filters]
  );

  return useApiOperation(operation, [filters]);
}

// Hook for single changelog entry
export function useChangelogEntry(entryId: string | null) {
  const operation = useCallback(
    () => {
      if (!entryId) throw new Error('Entry ID is required');
      return changelogApi.getChangelogEntry(entryId);
    },
    [entryId]
  );

  return useApiOperation(operation, [entryId]);
}

// Hook for changelog summary
export function useChangelogSummary(version: string | null) {
  const operation = useCallback(
    () => {
      if (!version) throw new Error('Version is required');
      return changelogApi.getChangelogSummary(version);
    },
    [version]
  );

  return useApiOperation(operation, [version]);
}

// Hook for unread changelog
export function useUnreadChangelog(userIdentifier: string | null) {
  const operation = useCallback(
    () => {
      if (!userIdentifier) throw new Error('User identifier is required');
      return changelogApi.getUnreadChangelog(userIdentifier);
    },
    [userIdentifier]
  );

  return useApiOperation(operation, [userIdentifier]);
}

// Hook for available versions
export function useAvailableVersions() {
  const operation = useCallback(
    () => changelogApi.getAvailableVersions(),
    []
  );

  return useApiOperation(operation);
}

// Hook for current version
export function useCurrentVersion() {
  const operation = useCallback(
    () => changelogApi.getCurrentVersion(),
    []
  );

  return useApiOperation(operation);
}

// Hook for processing commits
export function useProcessCommits() {
  const [state, setState] = useState<UseChangelogApiState<ProcessCommitsResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await changelogApi.processCommits();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    ...state,
    processCommits: execute,
  };
}

// Hook for changelog mutations
export function useChangelogMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsViewed = useCallback(async (data: MarkViewedRequest) => {
    setLoading(true);
    setError(null);
    try {
      await changelogApi.markAsViewed(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to mark as viewed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishChangelog = useCallback(async (data: PublishRequest) => {
    setLoading(true);
    setError(null);
    try {
      await changelogApi.publishChangelog(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to publish changelog';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unpublishChangelog = useCallback(async (data: PublishRequest) => {
    setLoading(true);
    setError(null);
    try {
      await changelogApi.unpublishChangelog(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to unpublish changelog';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateChangelogEntry = useCallback(async (entryId: string, data: ChangelogUpdateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await changelogApi.updateChangelogEntry(entryId, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to update changelog entry';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteChangelogEntry = useCallback(async (entryId: string) => {
    setLoading(true);
    setError(null);
    try {
      await changelogApi.deleteChangelogEntry(entryId);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to delete changelog entry';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    markAsViewed,
    publishChangelog,
    unpublishChangelog,
    updateChangelogEntry,
    deleteChangelogEntry,
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  currentData: T | null,
  updateFn: (data: T, update: unknown) => T
) {
  const [optimisticData, setOptimisticData] = useState<T | null>(currentData);

  useEffect(() => {
    setOptimisticData(currentData);
  }, [currentData]);

  const applyOptimisticUpdate = useCallback((update: unknown) => {
    if (optimisticData) {
      setOptimisticData(updateFn(optimisticData, update));
    }
  }, [optimisticData, updateFn]);

  const revertOptimisticUpdate = useCallback(() => {
    setOptimisticData(currentData);
  }, [currentData]);

  return {
    optimisticData,
    applyOptimisticUpdate,
    revertOptimisticUpdate,
  };
} 