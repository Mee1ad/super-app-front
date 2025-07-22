import { renderHook, act } from '@testing-library/react'
import { usePersistentState } from './use-persistent-state'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with default value when no stored value exists', () => {
    const { result } = renderHook(() => usePersistentState('test-key', 'default'))
    
    expect(result.current[0]).toBe('default')
  })

  it('loads stored value from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('"stored-value"')
    
    const { result } = renderHook(() => usePersistentState('test-key', 'default'))
    
    expect(result.current[0]).toBe('stored-value')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
  })

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => usePersistentState('test-key', 'default'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(result.current[0]).toBe('new-value')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', '"new-value"')
  })

  it('handles function updates correctly', () => {
    const { result } = renderHook(() => usePersistentState('test-key', 0))
    
    act(() => {
      result.current[1](prev => prev + 1)
    })
    
    expect(result.current[0]).toBe(1)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', '1')
  })

  it('handles complex objects', () => {
    const defaultObj = { name: 'default', count: 0 }
    const { result } = renderHook(() => usePersistentState('test-key', defaultObj))
    
    act(() => {
      result.current[1]({ name: 'updated', count: 5 })
    })
    
    expect(result.current[0]).toEqual({ name: 'updated', count: 5 })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', '{"name":"updated","count":5}')
  })

  it('handles JSON parse errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json')
    
    const { result } = renderHook(() => usePersistentState('test-key', 'default'))
    
    expect(result.current[0]).toBe('default')
  })

  it('handles localStorage errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })
    
    const { result } = renderHook(() => usePersistentState('test-key', 'default'))
    
    // Should not throw error
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(result.current[0]).toBe('new-value')
  })
}) 