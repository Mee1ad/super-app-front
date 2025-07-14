// Google OAuth Types
export interface GoogleAuthUrlResponse {
  auth_url: string
  client_id: string
  redirect_uri: string
}

export interface GoogleLoginRequest {
  code: string
}

export interface GoogleLoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    name: string
    picture?: string
  }
}

export interface AuthState {
  isAuthenticated: boolean
  user: {
    id: string
    email: string
    name: string
    picture?: string
  } | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
} 