// Google OAuth Types
export interface GoogleAuthUrlResponse {
  auth_url: string
  client_id: string
  redirect_uri: string
}

export interface GoogleLoginRequest {
  code: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
}

export interface User {
  id: string
  email: string
  username: string
  name: string
  picture?: string
  is_active: boolean
  is_superuser: boolean
  role?: Role
  created_at: string
  updated_at: string
}

export interface GoogleLoginResponse {
  user: {
    id: string
    email: string
    username: string
    is_active: boolean
    is_superuser: boolean
    role_name: string
  }
  tokens: {
    access_token: string
    refresh_token: string
    expires_in: number
  }
}

export interface AuthState {
  isAuthenticated: boolean
  user: {
    id: string
    email: string
    username: string
    is_active: boolean
    is_superuser: boolean
    role_name: string
  } | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
} 