import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function usePageTransition() {
  const router = useRouter()

  const navigateWithAnimation = useCallback((url: string) => {
    // Navigate immediately without delay to prevent loading issues
    router.push(url)
  }, [router])

  return { navigateWithAnimation }
} 