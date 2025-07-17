import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImageAlbum } from './ImageAlbum'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} data-testid="next-image" />
  )
}))

describe('ImageAlbum', () => {
  const mockImages = [
    'data:image/jpeg;base64,test1',
    'data:image/jpeg;base64,test2',
    'data:image/jpeg;base64,test3'
  ]
  const mockOnImagesChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders add images button when not read-only', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
      />
    )

    expect(screen.getByText('Add Images')).toBeInTheDocument()
    expect(screen.getByText('3 images selected')).toBeInTheDocument()
  })

  it('does not render add images button when read-only', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
        readOnly={true}
      />
    )

    expect(screen.queryByText('Add Images')).not.toBeInTheDocument()
  })

  it('returns null when read-only and no images', () => {
    const { container } = render(
      <ImageAlbum
        images={[]}
        onImagesChange={mockOnImagesChange}
        readOnly={true}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('disables add images button when disabled', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
        disabled={true}
      />
    )

    const addButton = screen.getByText('Add Images')
    expect(addButton).toBeDisabled()
  })

  it('disables file input when disabled', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
        disabled={true}
      />
    )

    const fileInput = screen.getByRole('button', { name: 'Add Images' })
    fireEvent.click(fileInput)

    // The file dialog should not open when disabled
    expect(mockOnImagesChange).not.toHaveBeenCalled()
  })

  it('renders images in grid layout', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
      />
    )

    const images = screen.getAllByAltText(/Image \d+/)
    expect(images).toHaveLength(3)
  })

  it('renders remove buttons for images when not read-only and not disabled', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
      />
    )

    // The remove buttons are rendered but hidden by default (opacity-0)
    // They become visible on hover
    const removeButtons = document.querySelectorAll('button[class*="bg-red-500"]')
    expect(removeButtons).toHaveLength(3)
  })

  it('does not render remove buttons when read-only', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
        readOnly={true}
      />
    )

    const removeButtons = document.querySelectorAll('button[class*="bg-red-500"]')
    expect(removeButtons).toHaveLength(0)
  })

  it('does not render remove buttons when disabled', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
        disabled={true}
      />
    )

    const removeButtons = document.querySelectorAll('button[class*="bg-red-500"]')
    expect(removeButtons).toHaveLength(0)
  })

  it('calls onImagesChange when remove button is clicked', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
      />
    )

    const removeButtons = document.querySelectorAll('button[class*="bg-red-500"]')
    fireEvent.click(removeButtons[0])

    expect(mockOnImagesChange).toHaveBeenCalledWith([
      'data:image/jpeg;base64,test2',
      'data:image/jpeg;base64,test3'
    ])
  })

  it('handles file selection correctly', async () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
      />
    )

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockOnImagesChange).toHaveBeenCalledWith([
        ...mockImages,
        expect.stringContaining('data:image/jpeg;base64')
      ])
    })
  })

  it('handles multiple file selection', async () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
      />
    )

    const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' })
    const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(fileInput, { target: { files: [file1, file2] } })

    await waitFor(() => {
      expect(mockOnImagesChange).toHaveBeenCalledWith([
        ...mockImages,
        expect.stringContaining('data:image/jpeg;base64'),
        expect.stringContaining('data:image/jpeg;base64')
      ])
    })
  })

  it('shows correct image count text', () => {
    render(
      <ImageAlbum
        images={['single-image']}
        onImagesChange={mockOnImagesChange}
      />
    )

    expect(screen.getByText('1 image selected')).toBeInTheDocument()
  })

  it('shows correct image count text for multiple images', () => {
    render(
      <ImageAlbum
        images={['image1', 'image2']}
        onImagesChange={mockOnImagesChange}
      />
    )

    expect(screen.getByText('2 images selected')).toBeInTheDocument()
  })

  it('shows correct image count text for zero images', () => {
    render(
      <ImageAlbum
        images={[]}
        onImagesChange={mockOnImagesChange}
      />
    )

    expect(screen.getByText('0 images selected')).toBeInTheDocument()
  })

  it('opens file dialog when add button is clicked', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
      />
    )

    const addButton = screen.getByText('Add Images')
    fireEvent.click(addButton)

    // The file input should be triggered
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
  })

  it('accepts image files only', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
      />
    )

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput.accept).toBe('image/*')
  })

  it('allows multiple file selection', () => {
    render(
      <ImageAlbum
        images={mockImages}
        onImagesChange={mockOnImagesChange}
      />
    )

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput.multiple).toBe(true)
  })
}) 