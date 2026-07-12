import { OpenAIModel } from '@strands-agents/sdk/models/openai'

export interface OpenAIConfig {
  apiKey: string
  modelId: string
}

export function createOpenAIModel({ apiKey, modelId }: OpenAIConfig) {
  return new OpenAIModel({
    api: 'responses',
    apiKey,
    modelId,
  })
}
