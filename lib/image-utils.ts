/**
 * Utility function to get the full URL for an image
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns The full URL for the image
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return ''
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  
  // If it's a relative path, prepend the backend URL
  // In development, backend runs on localhost:8000
  // In production, this should be configured via environment variables
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  return `${backendUrl}${imageUrl}`
} 