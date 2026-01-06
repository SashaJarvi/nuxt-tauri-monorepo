import { createSuccessResponse } from '@repo/ui/app/utils/api'
import type { HealthResponse } from '@repo/ui/app/types/api'

export default defineEventHandler(() => {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }
  return createSuccessResponse(response)
})
