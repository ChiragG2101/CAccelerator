import { Agent } from '@strands-agents/sdk'

import { env } from '../config/env.js'
import { createOpenAIModel } from './config/openai.config.js'

export function createAgent() {
  const apiKey = env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required to create an agent')
  }

  return new Agent({
    model: createOpenAIModel({
      apiKey,
      modelId: env.OPENAI_MODEL,
    }),
    printer: false,
  })
}