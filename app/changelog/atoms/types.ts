export type ChangeType = "added" | "changed" | "fixed" | "removed" | "deprecated" | "security";

export type RoleType = "admin" | "editor" | "viewer";

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  role?: Role;
  created_at: string;
  updated_at: string;
}

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  change_type: ChangeType;
  is_breaking: boolean;
  commit_hash: string;
  commit_date: string;
  commit_message: string;
  release_date: string;
  is_published: boolean;
  published_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChangelogSummary {
  version: string;
  release_date: string;
  total_changes: number;
  breaking_changes: number;
  changes_by_type: Record<string, number>;
  entries: ChangelogEntry[];
}

export interface VersionInfo {
  version: string;
  release_date: string;
  total_changes: number;
  breaking_changes: number;
}

export interface UnreadChangelogResponse {
  unread_count: number;
  latest_version?: string;
  entries: ChangelogEntry[];
}

export interface ChangelogListResponse {
  entries: ChangelogEntry[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface VersionsResponse {
  versions: VersionInfo[];
  total_versions: number;
}

export interface CurrentVersionResponse {
  version: string;
  source: string;
}

export interface ProcessCommitsResponse {
  message: string;
  created_count: number;
}

export interface MarkViewedRequest {
  entry_id: string;
  user_identifier: string;
}

export interface PublishRequest {
  entry_id: string;
}

export interface ChangelogUpdateRequest {
  title?: string;
  description?: string;
  version?: string;
  change_type?: ChangeType;
  is_breaking?: boolean;
}

export interface ChangelogFilters {
  page?: number;
  per_page?: number;
  version?: string;
  change_type?: ChangeType;
  include_drafts?: boolean;
  status?: 'published' | 'drafts' | 'all';
}

// Permission constants
export const PERMISSIONS = {
  CHANGELOG_VIEW: "changelog:view",
  CHANGELOG_CREATE: "changelog:create",
  CHANGELOG_UPDATE: "changelog:update",
  CHANGELOG_DELETE: "changelog:delete",
  CHANGELOG_PUBLISH: "changelog:publish",
  CHANGELOG_VIEW_DRAFTS: "changelog:view_drafts",
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Change type colors and icons
export const CHANGE_TYPE_CONFIG = {
  added: {
    label: "Added",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "plus",
  },
  changed: {
    label: "Changed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "edit",
  },
  fixed: {
    label: "Fixed",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "wrench",
  },
  removed: {
    label: "Removed",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: "minus",
  },
  deprecated: {
    label: "Deprecated",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "alert-triangle",
  },
  security: {
    label: "Security",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "shield",
  },
} as const; 