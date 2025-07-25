import { render, screen, fireEvent } from '@testing-library/react'
import { DiaryEntryForm } from './DiaryEntryForm'
import { DiaryEntry, Mood } from '../atoms/types'

// Mock Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack
  })
}))

// Mock the diary API
jest.mock('../atoms/api', () => ({
  diaryApi: {
    createDiaryEntry: jest.fn(),
    updateDiaryEntry: jest.fn()
  }
}))

const mockMoods: Mood[] = [
  {
    id: 'happy',
    name: 'Happy',
    emoji: '😊',
    color: '#4CAF50',
    created_at: '2024-12-01T10:00:00Z'
  },
  {
    id: 'sad',
    name: 'Sad',
    emoji: '😢',
    color: '#2196F3',
    created_at: '2024-12-01T10:00:00Z'
  }
]

const mockEntry: DiaryEntry = {
  id: '1',
  title: 'Test Entry',
  content: 'This is a test diary entry.',
  mood: 'happy',
  date: '2024-12-01',
  images: [],
  created_at: '2024-12-01T10:00:00Z',
  updated_at: '2024-12-01T10:00:00Z'
}

const mockOnUpdate = jest.fn()
const mockOnCancel = jest.fn()

describe('DiaryEntryForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Create Mode', () => {
    it('renders create form with correct title', () => {
      render(
        <DiaryEntryForm
          mode="create"
          moods={mockMoods}
        />
      )

      expect(screen.getByText('New Entry')).toBeInTheDocument()
    })

    it('shows date picker button in create mode', () => {
      render(
        <DiaryEntryForm
          mode="create"
          moods={mockMoods}
        />
      )

      expect(screen.getByText('Dec')).toBeInTheDocument() // Date button shows current month
    })

    it('shows "Save Entry" button in create mode', () => {
      render(
        <DiaryEntryForm
          mode="create"
          moods={mockMoods}
        />
      )

      expect(screen.getByText('Save Entry')).toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    it('renders edit form with correct title', () => {
      render(
        <DiaryEntryForm
          mode="edit"
          entry={mockEntry}
          moods={mockMoods}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Edit Entry')).toBeInTheDocument()
    })

    it('does not show date picker button in edit mode', () => {
      render(
        <DiaryEntryForm
          mode="edit"
          entry={mockEntry}
          moods={mockMoods}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
        />
      )

      // Date button should not be present in edit mode
      expect(screen.queryByText('Dec')).not.toBeInTheDocument()
    })

    it('shows "Update Entry" button in edit mode', () => {
      render(
        <DiaryEntryForm
          mode="edit"
          entry={mockEntry}
          moods={mockMoods}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Update Entry')).toBeInTheDocument()
    })

    it('pre-fills form with entry data', () => {
      render(
        <DiaryEntryForm
          mode="edit"
          entry={mockEntry}
          moods={mockMoods}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
        />
      )

      // The form should show the entry title and content
      expect(screen.getByDisplayValue('Test Entry')).toBeInTheDocument()
      expect(screen.getByDisplayValue('This is a test diary entry.')).toBeInTheDocument()
    })
  })

  describe('Common Functionality', () => {
    it('shows mood picker when mood button is clicked', () => {
      render(
        <DiaryEntryForm
          mode="create"
          moods={mockMoods}
        />
      )

      const moodButton = screen.getByText('Mood')
      fireEvent.click(moodButton)

      expect(screen.getByText('How are you feeling?')).toBeInTheDocument()
    })

    it('shows image picker when image button is clicked', () => {
      render(
        <DiaryEntryForm
          mode="create"
          moods={mockMoods}
        />
      )

      const imageButton = screen.getByText('Image')
      fireEvent.click(imageButton)

      expect(screen.getByText('Add Images')).toBeInTheDocument()
    })

    it('disables save button when form is incomplete', () => {
      render(
        <DiaryEntryForm
          mode="create"
          moods={mockMoods}
        />
      )

      const saveButton = screen.getByText('Save Entry')
      expect(saveButton).toBeDisabled()
    })
  })
}) 