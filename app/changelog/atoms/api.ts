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
import { mockChangelogEntries, mockVersions, mockCurrentVersion } from './mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ChangelogApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch {
      throw new ApiError(
        'Network error',
        0
      );
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  // Get changelog entries with pagination and filtering
  async getChangelogEntries(filters: ChangelogFilters = {}): Promise<ChangelogListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
      if (filters.version) params.append('version', filters.version);
      if (filters.change_type) params.append('change_type', filters.change_type);
      if (filters.status) params.append('status', filters.status);

      const queryString = params.toString();
      const endpoint = `/changelog${queryString ? `?${queryString}` : ''}`;
      
      console.log('Changelog API request:', endpoint);
      
      return await this.request<ChangelogListResponse>(endpoint);
    } catch {
      // Fallback to mock data if API is not available
      console.log('API not available, using mock data');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredEntries = [...mockChangelogEntries];
      
      // Apply filters
      if (filters.version) {
        filteredEntries = filteredEntries.filter(entry => entry.version === filters.version);
      }
      if (filters.change_type) {
        filteredEntries = filteredEntries.filter(entry => entry.change_type === filters.change_type);
      }
      if (filters.status) {
        switch (filters.status) {
          case 'published':
            filteredEntries = filteredEntries.filter(entry => entry.is_published);
            break;
          case 'drafts':
            filteredEntries = filteredEntries.filter(entry => !entry.is_published);
            break;
          case 'all':
            // No filtering needed, show all entries
            break;
        }
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const perPage = filters.per_page || 20;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
      
      return {
        entries: paginatedEntries,
        total: filteredEntries.length,
        page,
        per_page: perPage,
        has_next: endIndex < filteredEntries.length,
        has_prev: page > 1,
      };
    }
  }

  // Get single changelog entry
  async getChangelogEntry(entryId: string): Promise<ChangelogEntry> {
    return this.request<ChangelogEntry>(`/changelog/${entryId}`);
  }

  // Get changelog summary for a version
  async getChangelogSummary(version: string): Promise<ChangelogSummary> {
    return this.request<ChangelogSummary>(`/changelog/summary/${version}`);
  }

  // Get unread changelog entries
  async getUnreadChangelog(userIdentifier: string): Promise<UnreadChangelogResponse> {
    return this.request<UnreadChangelogResponse>(`/changelog/unread?user_identifier=${userIdentifier}`);
  }

  // Mark changelog entry as viewed
  async markAsViewed(data: MarkViewedRequest): Promise<void> {
    return this.request<void>('/changelog/mark-viewed', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Process new commits (AI generation)
  async processCommits(): Promise<ProcessCommitsResponse> {
    return this.request<ProcessCommitsResponse>('/changelog/process-commits', {
      method: 'POST',
    });
  }

  // Publish changelog entry
  async publishChangelog(data: PublishRequest): Promise<void> {
    return this.request<void>('/changelog/publish', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Unpublish changelog entry
  async unpublishChangelog(data: PublishRequest): Promise<void> {
    return this.request<void>('/changelog/unpublish', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update changelog entry
  async updateChangelogEntry(entryId: string, data: ChangelogUpdateRequest): Promise<ChangelogEntry> {
    return this.request<ChangelogEntry>(`/changelog/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete changelog entry
  async deleteChangelogEntry(entryId: string): Promise<void> {
    return this.request<void>(`/changelog/${entryId}`, {
      method: 'DELETE',
    });
  }

  // Get available versions
  async getAvailableVersions(): Promise<VersionsResponse> {
    try {
      return await this.request<VersionsResponse>('/changelog/versions');
    } catch {
      // Fallback to mock data if API is not available
      console.log('API not available, using mock versions data');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        versions: mockVersions,
        total_versions: mockVersions.length,
      };
    }
  }

  // Get current version
  async getCurrentVersion(): Promise<CurrentVersionResponse> {
    try {
      return await this.request<CurrentVersionResponse>('/changelog/current-version');
    } catch {
      // Fallback to mock data if API is not available
      console.log('API not available, using mock current version data');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return mockCurrentVersion;
    }
  }
}

// Export singleton instance
export const changelogApi = new ChangelogApi();

// Export error class for handling
export { ApiError }; 