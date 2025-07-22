import { useState, useEffect } from 'react'

/**
 * Custom hook for persistent state that survives page navigation
 * @param key - localStorage key for persistence
 * @param defaultValue - default value if no stored value exists
 * @returns [value, setValue] - state value and setter function
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue)
  const [isClient, setIsClient] = useState(false)

  // Initialize state from localStorage on client side
  useEffect(() => {
    setIsClient(true)
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        setValue(JSON.parse(stored))
      }
    } catch (error) {
      console.warn(`Failed to load persistent state for key "${key}":`, error)
    }
  }, [key])

  // Update localStorage when value changes
  const setPersistentValue = (newValue: T | ((prev: T) => T)) => {
    setValue(prevValue => {
      const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prevValue) : newValue
      
      // Only update localStorage on client side
      if (isClient) {
        try {
          localStorage.setItem(key, JSON.stringify(nextValue))
        } catch (error) {
          console.warn(`Failed to save persistent state for key "${key}":`, error)
        }
      }
      
      return nextValue
    })
  }

  return [value, setPersistentValue]
} 