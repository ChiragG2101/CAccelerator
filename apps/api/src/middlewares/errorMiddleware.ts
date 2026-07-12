import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

export const errorMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
  const status = Number(error?.status ?? (error instanceof ZodError ? 400 : 500))
  const code = String(error?.code ?? (status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'))
  const message = status >= 500 ? 'Internal server error' : String(error?.message ?? 'Request failed')
  if (status >= 500) console.error(`[${req.requestId}]`, error)
  res.status(status).json({ error: { code, message, ...(error?.fieldErrors ? { fieldErrors: error.fieldErrors } : {}) }, requestId: req.requestId })
}
