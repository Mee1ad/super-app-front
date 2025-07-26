import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function usePageTransition() {
  const router = useRouter()

  const navigateWithAnimation = useCallback((url: string) => {
    // Add a small delay to allow the tap animation to complete
    setTimeout(() => {
      router.push(url)
    }, 150)
  }, [router])

  return { navigateWithAnimation }
} 