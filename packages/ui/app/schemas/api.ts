import { z } from 'zod'

// Shared validation schemas - used on client AND server

export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  timestamp: z.string().datetime(),
})

// Example: shared request validation
export const exampleRequestSchema = z.object({
  text: z.string().min(1).max(10000),
})

// Export inferred types from schemas
export type HealthResponseSchema = z.infer<typeof healthResponseSchema>
export type ExampleRequestSchema = z.infer<typeof exampleRequestSchema>
