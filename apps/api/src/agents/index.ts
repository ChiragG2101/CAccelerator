import { Agent } from '@strands-agents/sdk'

import { env } from '../config/env.js'
import { createOpenAIModel } from './config/openai.config.js'

export function createAgent() {
  return new Agent({
    model: createOpenAIModel({
      apiKey: env.OPENAI_API_KEY,
      modelId: env.OPENAI_MODEL,
    }),
    printer: false,
  })
}
