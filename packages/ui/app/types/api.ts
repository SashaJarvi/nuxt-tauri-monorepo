// Generic API response wrapper
export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResult<T> = ApiResponse<T> | ApiError

// Common endpoint types
export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
}
