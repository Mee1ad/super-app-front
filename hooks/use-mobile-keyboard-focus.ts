import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook to detect phone back gestures and trigger a callback
 * This is useful for closing forms when user uses the back gesture
 */
export function useBackGesture(onBack?: () => void) {
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // When back gesture is used, popstate event is triggered
      if (onBack) {
        onBack()
      }
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Also handle beforeunload for additional back gesture detection
      if (onBack) {
        onBack()
      }
    }

    // Listen for back gesture events
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // For Android back button (if available)
    if ('navigation' in window) {
      (window as any).navigation?.addEventListener('navigate', (event: any) => {
        if (event.navigationType === 'back') {
          if (onBack) {
            onBack()
          }
        }
      })
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      if ('navigation' in window) {
        (window as any).navigation?.removeEventListener('navigate', handlePopState)
      }
    }
  }, [onBack])
}

/**
 * Hook to automatically focus an input on mobile devices when the component mounts
 * This is useful for triggering the mobile keyboard immediately
 */
export function useMobileKeyboardFocus() {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Only auto-focus on mobile devices
    const isMobile = window.innerWidth <= 768
    
    if (isMobile && ref.current) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        ref.current?.focus()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [])

  return ref
}

/**
 * Hook to conditionally focus an input on mobile devices
 * This is useful for triggering the mobile keyboard when a dialog opens
 */
export function useConditionalMobileKeyboardFocus(condition: boolean) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Only auto-focus on mobile devices when condition is true
    const isMobile = window.innerWidth <= 768
    
    if (isMobile && condition && ref.current) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        ref.current?.focus()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [condition])

  return ref
}

/**
 * Hook to detect mobile keyboard appearance and return keyboard height
 * This is useful for adjusting form position to prevent keyboard overlap
 */
export function useMobileKeyboardDetection() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      // On mobile, when keyboard appears, viewport height decreases
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const windowHeight = window.innerHeight
      const keyboardHeight = windowHeight - viewportHeight
      
      // Only apply keyboard offset on mobile devices
      if (window.innerWidth <= 768 && keyboardHeight > 150) {
        setKeyboardHeight(keyboardHeight)
      } else {
        setKeyboardHeight(0)
      }
    }

    // Use visualViewport API if available (better for mobile keyboard detection)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => window.visualViewport?.removeEventListener('resize', handleResize)
    } else {
      // Fallback to window resize
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return keyboardHeight
}

/**
 * Hook to detect mobile keyboard dismissal and trigger a callback
 * This is useful for automatically closing forms when keyboard is dismissed
 */
export function useMobileKeyboardDismissal(onDismiss?: () => void) {
  const [wasKeyboardOpen, setWasKeyboardOpen] = useState(false)
  const dismissalTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    const handleResize = () => {
      // On mobile, when keyboard appears, viewport height decreases
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const windowHeight = window.innerHeight
      const keyboardHeight = windowHeight - viewportHeight
      
      // Check if keyboard is currently open
      const isKeyboardOpen = window.innerWidth <= 768 && keyboardHeight > 150
      
      // Clear any existing dismissal timeout
      if (dismissalTimeoutRef.current) {
        clearTimeout(dismissalTimeoutRef.current)
      }
      
      // If keyboard was open and now it's closed, trigger dismissal
      if (wasKeyboardOpen && !isKeyboardOpen && onDismiss) {
        // Small delay to ensure the dismissal is intentional
        dismissalTimeoutRef.current = setTimeout(() => {
          onDismiss()
        }, 300)
      }
      
      setWasKeyboardOpen(isKeyboardOpen)
    }

    const handleBlur = () => {
      // When input loses focus, keyboard is likely to close
      if (wasKeyboardOpen && onDismiss) {
        // Clear any existing timeout
        if (dismissalTimeoutRef.current) {
          clearTimeout(dismissalTimeoutRef.current)
        }
        
        // Trigger dismissal after a short delay
        dismissalTimeoutRef.current = setTimeout(() => {
          onDismiss()
        }, 200)
      }
    }

    const handleFocus = () => {
      // Clear dismissal timeout when input is focused again
      if (dismissalTimeoutRef.current) {
        clearTimeout(dismissalTimeoutRef.current)
      }
    }

    // Use visualViewport API if available (better for mobile keyboard detection)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    } else {
      // Fallback to window resize
      window.addEventListener('resize', handleResize)
    }

    // Listen for input focus/blur events on all inputs
    const inputs = document.querySelectorAll('input, textarea')
    inputs.forEach(input => {
      input.addEventListener('blur', handleBlur)
      input.addEventListener('focus', handleFocus)
    })

    // Initial call
    handleResize()

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
      
      inputs.forEach(input => {
        input.removeEventListener('blur', handleBlur)
        input.removeEventListener('focus', handleFocus)
      })
      
      if (dismissalTimeoutRef.current) {
        clearTimeout(dismissalTimeoutRef.current)
      }
    }
  }, [wasKeyboardOpen, onDismiss])

  return wasKeyboardOpen
}

/**
 * Hook that combines mobile keyboard focus and keyboard detection
 * Returns both the ref for the input and the keyboard height for positioning
 */
export function useMobileKeyboardFocusWithDetection(condition: boolean = true) {
  const ref = useConditionalMobileKeyboardFocus(condition)
  const keyboardHeight = useMobileKeyboardDetection()

  return { ref, keyboardHeight }
}

/**
 * Hook that combines mobile keyboard focus, detection, and dismissal
 * Returns the ref, keyboard height, and handles automatic form closing
 */
export function useMobileKeyboardFocusWithDismissal(
  condition: boolean = true, 
  onDismiss?: () => void
) {
  const ref = useConditionalMobileKeyboardFocus(condition)
  const keyboardHeight = useMobileKeyboardDetection()
  const isKeyboardOpen = useMobileKeyboardDismissal(onDismiss)

  return { ref, keyboardHeight, isKeyboardOpen }
}

/**
 * Hook that combines mobile keyboard focus, detection, dismissal, and back gesture
 * Returns the ref, keyboard height, and handles automatic form closing
 */
export function useMobileKeyboardFocusWithBackGesture(
  condition: boolean = true, 
  onDismiss?: () => void,
  onBack?: () => void
) {
  const ref = useConditionalMobileKeyboardFocus(condition)
  const keyboardHeight = useMobileKeyboardDetection()
  const isKeyboardOpen = useMobileKeyboardDismissal(onDismiss)
  
  // Add back gesture detection
  useBackGesture(onBack)

  return { ref, keyboardHeight, isKeyboardOpen }
} 