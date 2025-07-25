import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiaryHeader } from './DiaryHeader'

const mockMoods = [
  { id: '1', name: 'Happy', emoji: '😊', color: '#10b981', created_at: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Sad', emoji: '😢', color: '#3b82f6', created_at: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'Angry', emoji: '😠', color: '#ef4444', created_at: '2024-01-01T00:00:00Z' }
]

const defaultProps = {
  selectedMood: 'all',
  moods: mockMoods,
  loading: false,
  onMoodChange: jest.fn()
}

describe('DiaryHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders mobile header with title and description', () => {
    render(<DiaryHeader {...defaultProps} />)
    
    expect(screen.getByText('Diary')).toBeInTheDocument()
    expect(screen.getByText('Capture your thoughts and feelings')).toBeInTheDocument()
  })

  it('renders mood filter select', () => {
    render(<DiaryHeader {...defaultProps} />)
    
    const moodSelects = screen.getAllByRole('combobox')
    expect(moodSelects).toHaveLength(2) // Mobile and desktop versions
    expect(moodSelects[0]).toBeInTheDocument()
  })

  it('calls onMoodChange when mood select changes', () => {
    render(<DiaryHeader {...defaultProps} />)
    
    const moodSelects = screen.getAllByRole('combobox')
    fireEvent.click(moodSelects[0])
    
    const happyOption = screen.getByText('😊 Happy')
    fireEvent.click(happyOption)
    
    expect(defaultProps.onMoodChange).toHaveBeenCalledWith('1')
  })

  it('disables inputs when loading', () => {
    render(<DiaryHeader {...defaultProps} loading={true} />)
    
    const moodSelects = screen.getAllByRole('combobox')
    
    expect(moodSelects[0]).toBeDisabled()
    expect(moodSelects[1]).toBeDisabled()
  })

  it('displays all mood options including "All Moods"', () => {
    render(<DiaryHeader {...defaultProps} />)
    
    const moodSelects = screen.getAllByRole('combobox')
    fireEvent.click(moodSelects[0])
    
    expect(screen.getAllByText('All Moods')).toHaveLength(3) // 2 select triggers + 1 option
    expect(screen.getByText('😊 Happy')).toBeInTheDocument()
    expect(screen.getByText('😢 Sad')).toBeInTheDocument()
    expect(screen.getByText('😠 Angry')).toBeInTheDocument()
  })
}) 