import { toast } from "@/hooks/use-toast"

// Types based on the OpenAPI specification
interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

interface HTTPValidationError {
  detail: ValidationError[]
}

interface ApiError {
  status: number
  message: string
  data?: HTTPValidationError
}

// Error type mapping
const getErrorType = (status: number): 'destructive' | 'warning' | 'info' => {
  if (status >= 400) return 'destructive'; // all errors 400+ are red
  return 'info';
}

// Get user-friendly error title
const getErrorTitle = (status: number): string => {
  switch (status) {
    case 400:
      return 'Bad Request'
    case 401:
      return 'Unauthorized'
    case 403:
      return 'Forbidden'
    case 404:
      return 'Not Found'
    case 422:
      return 'Validation Error'
    case 500:
      return 'Server Error'
    case 502:
      return 'Bad Gateway'
    case 503:
      return 'Service Unavailable'
    default:
      return 'Error'
  }
}

// Format validation errors into readable messages
const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors
    .map(error => {
      const field = error.loc.join('.')
      return `${field}: ${error.msg}`
    })
    .join('\n')
}

// Parse error response
export const parseApiError = async (response: Response): Promise<ApiError> => {
  const status = response.status
  let message = response.statusText
  let data: HTTPValidationError | undefined

  try {
    const responseData = await response.json()
    
    // Check if it's a validation error
    if (responseData.detail && Array.isArray(responseData.detail)) {
      data = responseData as HTTPValidationError
      message = formatValidationErrors(responseData.detail)
    } else if (responseData.message) {
      message = responseData.message
    } else if (responseData.detail) {
      message = responseData.detail
    }
  } catch {
    // If JSON parsing fails, use status text
    message = response.statusText || 'An unexpected error occurred'
  }

  return { status, message, data }
}

// Show error toast
export const showErrorToast = (error: ApiError | Error | string) => {
  let title: string
  let description: string
  let variant: 'destructive' | 'warning' | 'info' = 'destructive'

  if (typeof error === 'string') {
    title = 'Error'
    description = error
  } else if ('status' in error) {
    // ApiError
    title = getErrorTitle(error.status)
    description = error.message
    variant = getErrorType(error.status)
  } else {
    // Standard Error
    title = 'Error'
    description = error.message || 'An unexpected error occurred'
  }

  toast({
    variant,
    title,
    description,
    duration: 5000,
  })
}

// Enhanced error handler for API calls
export const handleApiError = async (response: Response): Promise<never> => {
  const error = await parseApiError(response)
  showErrorToast(error)
  throw error
}

// Show success toast
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    variant: 'success',
    title,
    description,
    duration: 3000,
  })
}

// Show warning toast
export const showWarningToast = (title: string, description?: string) => {
  toast({
    variant: 'warning',
    title,
    description,
    duration: 4000,
  })
}

// Show info toast
export const showInfoToast = (title: string, description?: string) => {
  toast({
    variant: 'info',
    title,
    description,
    duration: 4000,
  })
}

// Utility for wrapping API calls with error handling
export const withErrorHandling = async <T>(
  apiCall: Promise<T>
): Promise<T> => {
  try {
    return await apiCall
  } catch (error) {
    if (error instanceof Error) {
      showErrorToast(error)
    } else {
      showErrorToast('An unexpected error occurred')
    }
    throw error
  }
} 