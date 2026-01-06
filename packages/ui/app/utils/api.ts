import type { ApiResponse, ApiError } from '../types/api'

// Create success response (used by server)
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

// Create error response (used by server)
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiError {
  return {
    success: false,
    error: { code, message, details },
  }
}

// Type guard for checking response success
export function isSuccess<T>(
  result: ApiResponse<T> | ApiError
): result is ApiResponse<T> {
  return result.success === true
}

// Type guard for checking response error
export function isError<T>(
  result: ApiResponse<T> | ApiError
): result is ApiError {
  return result.success === false
}
