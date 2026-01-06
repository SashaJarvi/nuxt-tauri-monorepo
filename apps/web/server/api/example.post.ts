import { createSuccessResponse, createErrorResponse } from '@repo/ui/app/utils/api'
import { exampleRequestSchema } from '@repo/ui/app/schemas/api'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate using shared schema
  const result = exampleRequestSchema.safeParse(body)
  if (!result.success) {
    return createErrorResponse(
      'VALIDATION_ERROR',
      'Invalid request body',
      result.error.flatten()
    )
  }

  // Process validated data
  const { text } = result.data

  return createSuccessResponse({ processed: text.toUpperCase() })
})
