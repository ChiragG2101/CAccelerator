import { env } from '../../config/env.js'

export interface LinkupSearchResult {
  title: string
  url: string
  snippet?: string
}

export interface LinkupWebpageResult {
  url: string
  title?: string
  content: string
}

export interface LinkupClient {
  searchResults(input: { query: string }): Promise<LinkupSearchResult[]>
  fetchWebpage(input: { url: string }): Promise<LinkupWebpageResult>
}

export class HttpLinkupClient implements LinkupClient {
  async searchResults(input: { query: string }): Promise<LinkupSearchResult[]> {
    const response = await fetch(`${env.LINKUP_BASE_URL}/search/results`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ query: input.query }),
    })

    if (!response.ok) {
      throw new Error(`Linkup search failed: ${response.status} ${response.statusText}`)
    }

    const payload = (await response.json()) as {
      results?: Array<{ title?: string; url?: string; snippet?: string }>
      data?: Array<{ title?: string; url?: string; snippet?: string }>
    }

    const rows = payload.results ?? payload.data ?? []

    return rows
      .filter((item) => item.title && item.url)
      .map((item) => ({
        title: item.title as string,
        url: item.url as string,
        snippet: item.snippet,
      }))
  }

  async fetchWebpage(input: { url: string }): Promise<LinkupWebpageResult> {
    const endpoints = ['/fetch/webpage', '/web/fetch']

    let lastError: Error | null = null

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${env.LINKUP_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: this.buildHeaders(),
          body: JSON.stringify({ url: input.url }),
        })

        if (!response.ok) {
          lastError = new Error(`Linkup fetch failed: ${response.status} ${response.statusText}`)
          continue
        }

        const payload = (await response.json()) as {
          url?: string
          title?: string
          content?: string
          markdown?: string
          text?: string
          data?: { content?: string; markdown?: string; text?: string; title?: string; url?: string }
        }

        const content = payload.content ?? payload.markdown ?? payload.text ?? payload.data?.content ?? payload.data?.markdown ?? payload.data?.text

        if (!content) {
          throw new Error('Linkup fetch returned empty content')
        }

        return {
          url: payload.url ?? payload.data?.url ?? input.url,
          title: payload.title ?? payload.data?.title,
          content,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
      }
    }

    throw lastError ?? new Error('Linkup fetch failed')
  }

  private buildHeaders() {
    if (!env.LINKUP_API_KEY) {
      throw new Error('LINKUP_API_KEY is not configured')
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.LINKUP_API_KEY}`,
    }
  }
}
