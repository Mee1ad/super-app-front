import { changelogApi, ApiError } from './api';
import { mockChangelogEntries, mockVersions, mockCurrentVersion } from './mock-data';

// Mock fetch globally
global.fetch = jest.fn();

describe('ChangelogApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('getChangelogEntries', () => {
    it('should fetch changelog entries with default filters', async () => {
      const mockResponse = {
        entries: mockChangelogEntries,
        total: mockChangelogEntries.length,
        page: 1,
        per_page: 20,
        has_next: false,
        has_prev: false,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await changelogApi.getChangelogEntries();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch changelog entries with custom filters', async () => {
      const filters = {
        page: 2,
        per_page: 10,
        version: '2.1.0',
        change_type: 'added' as const,
        include_drafts: true,
      };

      const mockResponse = {
        entries: mockChangelogEntries.slice(0, 2),
        total: 2,
        page: 2,
        per_page: 10,
        has_next: false,
        has_prev: true,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await changelogApi.getChangelogEntries(filters);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog?page=2&per_page=10&version=2.1.0&change_type=added&include_drafts=true',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      });

      await expect(changelogApi.getChangelogEntries()).rejects.toThrow(ApiError);
    });
  });

  describe('getChangelogEntry', () => {
    it('should fetch a single changelog entry', async () => {
      const entry = mockChangelogEntries[0];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => entry,
      });

      const result = await changelogApi.getChangelogEntry('1');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog/1',
        expect.any(Object)
      );
      expect(result).toEqual(entry);
    });
  });

  describe('getAvailableVersions', () => {
    it('should fetch available versions', async () => {
      const mockResponse = {
        versions: mockVersions,
        total_versions: mockVersions.length,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await changelogApi.getAvailableVersions();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog/versions',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentVersion', () => {
    it('should fetch current version', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCurrentVersion,
      });

      const result = await changelogApi.getCurrentVersion();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog/current-version',
        expect.any(Object)
      );
      expect(result).toEqual(mockCurrentVersion);
    });
  });

  describe('processCommits', () => {
    it('should process commits successfully', async () => {
      const mockResponse = {
        message: 'Successfully processed 5 commits',
        created_count: 5,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await changelogApi.processCommits();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog/process-commits',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('publishChangelog', () => {
    it('should publish a changelog entry', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await changelogApi.publishChangelog({ entry_id: '1' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog/publish',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ entry_id: '1' }),
        })
      );
    });
  });

  describe('unpublishChangelog', () => {
    it('should unpublish a changelog entry', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await changelogApi.unpublishChangelog({ entry_id: '1' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog/unpublish',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ entry_id: '1' }),
        })
      );
    });
  });

  describe('updateChangelogEntry', () => {
    it('should update a changelog entry', async () => {
      const updateData = {
        title: 'Updated title',
        description: 'Updated description',
      };

      const updatedEntry = { ...mockChangelogEntries[0], ...updateData };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedEntry,
      });

      const result = await changelogApi.updateChangelogEntry('1', updateData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(updatedEntry);
    });
  });

  describe('deleteChangelogEntry', () => {
    it('should delete a changelog entry', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await changelogApi.deleteChangelogEntry('1');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('markAsViewed', () => {
    it('should mark an entry as viewed', async () => {
      const data = {
        entry_id: '1',
        user_identifier: 'user123',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await changelogApi.markAsViewed(data);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/changelog/mark-viewed',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });
  });

  describe('authentication', () => {
    it('should include auth token in requests when available', async () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', 'test-token');
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      await changelogApi.getChangelogEntries();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should not include auth token when not available', async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      await changelogApi.getChangelogEntries();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(changelogApi.getChangelogEntries()).rejects.toThrow(ApiError);
    });

    it('should handle 401 unauthorized errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid token' }),
      });

      await expect(changelogApi.getChangelogEntries()).rejects.toThrow(ApiError);
    });

    it('should handle 403 forbidden errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'Insufficient permissions' }),
      });

      await expect(changelogApi.getChangelogEntries()).rejects.toThrow(ApiError);
    });
  });
}); 