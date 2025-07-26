import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { useMobileKeyboardFocus, useConditionalMobileKeyboardFocus } from './use-mobile-keyboard-focus'

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
}

// Mock setTimeout
const mockSetTimeout = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('useMobileKeyboardFocus', () => {
  beforeEach(() => {
    // Reset window.innerWidth to desktop size
    mockInnerWidth(1024)
  })

  it('should not focus on desktop devices', () => {
    mockInnerWidth(1024)
    
    const { result } = renderHook(() => useMobileKeyboardFocus())
    
    expect(result.current.current).toBeNull()
  })

  it('should focus on mobile devices', async () => {
    mockInnerWidth(375) // Mobile width
    
    const { result, rerender } = renderHook(() => useMobileKeyboardFocus())
    
    // Create a mock input element
    const mockInput = document.createElement('input')
    const mockFocus = jest.fn()
    mockInput.focus = mockFocus
    
    // Attach the ref to the mock input before effect runs
    act(() => {
      result.current.current = mockInput
    })
    
    // Rerender to trigger the effect
    rerender()
    
    // Wait for the focus to be called
    await act(async () => {
      await mockSetTimeout(150) // Wait longer than the default 100ms delay
    })
    
    expect(mockFocus).toHaveBeenCalled()
  })

  it('should respect the enabled option', async () => {
    mockInnerWidth(375) // Mobile width
    
    const { result, rerender } = renderHook(() => useMobileKeyboardFocus({ enabled: false }))
    
    // Create a mock input element
    const mockInput = document.createElement('input')
    const mockFocus = jest.fn()
    mockInput.focus = mockFocus
    
    act(() => {
      result.current.current = mockInput
    })
    rerender()
    
    // Wait for the focus to be called
    await act(async () => {
      await mockSetTimeout(150)
    })
    
    expect(mockFocus).not.toHaveBeenCalled()
  })

  it('should respect custom mobile breakpoint', async () => {
    mockInnerWidth(900) // Between default 768 and custom 1000
    
    const { result, rerender } = renderHook(() => useMobileKeyboardFocus({ mobileBreakpoint: 1000 }))
    
    // Create a mock input element
    const mockInput = document.createElement('input')
    const mockFocus = jest.fn()
    mockInput.focus = mockFocus
    
    act(() => {
      result.current.current = mockInput
    })
    rerender()
    
    // Wait for the focus to be called
    await act(async () => {
      await mockSetTimeout(150)
    })
    
    expect(mockFocus).toHaveBeenCalled()
  })
})

describe('useConditionalMobileKeyboardFocus', () => {
  beforeEach(() => {
    mockInnerWidth(375) // Mobile width
  })

  it('should focus when condition is true', async () => {
    const { result, rerender } = renderHook(() => useConditionalMobileKeyboardFocus(true))
    
    // Create a mock input element
    const mockInput = document.createElement('input')
    const mockFocus = jest.fn()
    mockInput.focus = mockFocus
    
    act(() => {
      result.current.current = mockInput
    })
    rerender()
    
    // Wait for the focus to be called
    await act(async () => {
      await mockSetTimeout(150)
    })
    
    expect(mockFocus).toHaveBeenCalled()
  })

  it('should not focus when condition is false', async () => {
    const { result, rerender } = renderHook(() => useConditionalMobileKeyboardFocus(false))
    
    // Create a mock input element
    const mockInput = document.createElement('input')
    const mockFocus = jest.fn()
    mockInput.focus = mockFocus
    
    act(() => {
      result.current.current = mockInput
    })
    rerender()
    
    // Wait for the focus to be called
    await act(async () => {
      await mockSetTimeout(150)
    })
    
    expect(mockFocus).not.toHaveBeenCalled()
  })

  it('should focus when condition changes from false to true', async () => {
    const { result, rerender } = renderHook(
      ({ condition }) => useConditionalMobileKeyboardFocus(condition),
      { initialProps: { condition: false } }
    )
    
    // Create a mock input element
    const mockInput = document.createElement('input')
    const mockFocus = jest.fn()
    mockInput.focus = mockFocus
    
    act(() => {
      result.current.current = mockInput
    })
    rerender({ condition: true })
    
    // Wait for the focus to be called
    await act(async () => {
      await mockSetTimeout(150)
    })
    
    expect(mockFocus).toHaveBeenCalled()
  })
}) 