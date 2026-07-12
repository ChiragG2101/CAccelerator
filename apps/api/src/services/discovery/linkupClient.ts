import { env } from '../../config/env.js'

export interface LinkupSearchResult {
  title: string
  url: string
  snippet?: string
}

export interface LinkupClient {
  searchResults(input: { query: string }): Promise<LinkupSearchResult[]>
}

export class HttpLinkupClient implements LinkupClient {
  async searchResults(input: { query: string }): Promise<LinkupSearchResult[]> {
    if (!env.LINKUP_API_KEY) {
      throw new Error('LINKUP_API_KEY is not configured')
    }

    const response = await fetch(`${env.LINKUP_BASE_URL}/search/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.LINKUP_API_KEY}`,
      },
      body: JSON.stringify({ query: input.query }),
    })

    if (!response.ok) {
      throw new Error(`Linkup search failed: ${response.status} ${response.statusText}`)
    }

    const payload = (await response.json()) as { results?: Array<{ title?: string; url?: string; snippet?: string }> }

    return (payload.results ?? [])
      .filter((item) => item.title && item.url)
      .map((item) => ({
        title: item.title as string,
        url: item.url as string,
        snippet: item.snippet,
      }))
  }
}
