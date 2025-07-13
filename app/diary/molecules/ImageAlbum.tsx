'use client'

import { useRef } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageAlbumProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  readOnly?: boolean
}

export function ImageAlbum({ images, onImagesChange, readOnly = false }: ImageAlbumProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newImages: string[] = []
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        newImages.push(result)
        if (newImages.length === files.length) {
          onImagesChange([...images, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (readOnly && images.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Images
          </Button>
          <span className="text-xs text-muted-foreground">
            {images.length} image{images.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt={`Diary image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 