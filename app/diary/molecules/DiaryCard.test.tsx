import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DiaryCard } from './DiaryCard'
import { DiaryEntry, Mood, DiaryEntryUpdate } from '../atoms/types'

// Mock the EditDiaryDialog component
jest.mock('../organisms/EditDiaryDialog', () => ({
  EditDiaryDialog: ({ open, onOpenChange, entry, moods, onUpdate, loading }: any) => (
    <div data-testid="edit-dialog" data-open={open}>
      <button onClick={() => onOpenChange(false)}>Close</button>
      <button onClick={() => onUpdate(entry.id, { title: 'Updated Title' })}>Update</button>
    </div>
  )
}))

const mockEntry: DiaryEntry = {
  id: '1',
  title: 'Test Entry',
  content: 'This is a test diary entry with some content that should be truncated if it gets too long.',
  mood: 'happy',
  date: '2024-12-01',
  images: ['/static/uploads/test1.jpg', '/static/uploads/test2.jpg'],
  created_at: '2024-12-01T10:00:00Z',
  updated_at: '2024-12-01T10:00:00Z'
}

const mockMood: Mood = {
  id: 'happy',
  name: 'Happy',
  emoji: '😊',
  color: '#4CAF50',
  created_at: '2024-12-01T10:00:00Z'
}

const mockMoods: Mood[] = [mockMood]

const mockOnDelete = jest.fn()
const mockOnUpdate = jest.fn()

describe('DiaryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders diary entry information correctly', () => {
    render(
      <DiaryCard
        entry={mockEntry}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('Test Entry')).toBeInTheDocument()
    expect(screen.getByText(/This is a test diary entry/)).toBeInTheDocument()
    expect(screen.getByText('Happy')).toBeInTheDocument()
    expect(screen.getByText('Dec 1, 2024')).toBeInTheDocument()
  })

  it('displays mood emoji with correct color', () => {
    render(
      <DiaryCard
        entry={mockEntry}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const emojiElement = screen.getByText('😊')
    expect(emojiElement).toBeInTheDocument()
    expect(emojiElement).toHaveStyle({ color: '#4CAF50' })
  })

  it('shows image count when entry has images', () => {
    render(
      <DiaryCard
        entry={mockEntry}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('2 images')).toBeInTheDocument()
  })

  it('does not show image count when entry has no images', () => {
    const entryWithoutImages = { ...mockEntry, images: [] }
    
    render(
      <DiaryCard
        entry={entryWithoutImages}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.queryByText(/image/)).not.toBeInTheDocument()
  })

  it('opens edit dialog when card is clicked', () => {
    render(
      <DiaryCard
        entry={mockEntry}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const card = screen.getByText('Test Entry').closest('[data-slot="card"]')
    fireEvent.click(card!)

    const editDialog = screen.getByTestId('edit-dialog')
    expect(editDialog).toHaveAttribute('data-open', 'true')
  })

  it('calls onDelete when delete button is clicked', () => {
    render(
      <DiaryCard
        entry={mockEntry}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete entry/i })
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('prevents card click when delete button is clicked', () => {
    render(
      <DiaryCard
        entry={mockEntry}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete entry/i })
    fireEvent.click(deleteButton)

    // The edit dialog should not open
    const editDialog = screen.getByTestId('edit-dialog')
    expect(editDialog).toHaveAttribute('data-open', 'false')
  })

  it('disables delete button when loading', () => {
    render(
      <DiaryCard
        entry={mockEntry}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        loading={true}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete entry/i })
    expect(deleteButton).toBeDisabled()
  })

  it('passes correct props to EditDiaryDialog', () => {
    render(
      <DiaryCard
        entry={mockEntry}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        loading={true}
      />
    )

    const editDialog = screen.getByTestId('edit-dialog')
    expect(editDialog).toBeInTheDocument()
  })

  it('truncates long content', () => {
    const longEntry = {
      ...mockEntry,
      content: 'A'.repeat(200) // Very long content
    }

    render(
      <DiaryCard
        entry={longEntry}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const contentElement = screen.getByText(/A{150}/)
    expect(contentElement).toBeInTheDocument()
    expect(contentElement.textContent).toContain('...')
  })

  it('formats date correctly', () => {
    const entryWithDifferentDate = {
      ...mockEntry,
      date: '2024-06-15'
    }

    render(
      <DiaryCard
        entry={entryWithDifferentDate}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('Jun 15, 2024')).toBeInTheDocument()
  })

  it('handles single image correctly', () => {
    const entryWithOneImage = {
      ...mockEntry,
      images: ['/static/uploads/single.jpg']
    }

    render(
      <DiaryCard
        entry={entryWithOneImage}
        mood={mockMood}
        moods={mockMoods}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('1 image')).toBeInTheDocument()
  })
}) 