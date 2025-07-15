import { Suspense } from 'react'
import { OAuthCallback } from '../organisms/OAuthCallback'

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OAuthCallback />
    </Suspense>
  )
} 