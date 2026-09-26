import type { AppType } from '@/server/api'
import { hc } from 'hono/client'

interface CreateApiClientOptions {
  baseUrl: string
  fetcher?: typeof globalThis.fetch
  credentials?: RequestCredentials
}

/** Builds the shared typed business RPC client behind a platform adapter. */
export function createApiClient({
  baseUrl,
  fetcher = globalThis.fetch,
  credentials = 'include',
}: CreateApiClientOptions) {
  return hc<AppType>(baseUrl, {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetcher(input, {
        ...init,
        credentials,
      }),
  })
}

const webBaseUrl =
  typeof window === 'undefined'
    ? (process.env.APP_URL ?? 'http://localhost:3000')
    : window.location.origin

/** Browser-only adapter used by current module Hooks. Other clients inject their own fetcher. */
export const client = createApiClient({ baseUrl: webBaseUrl })

function getApiErrorMessage(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) return '请求失败'
  if ('error' in payload && typeof payload.error === 'string') return payload.error
  if ('message' in payload && typeof payload.message === 'string') return payload.message
  return '请求失败'
}

export async function readApiJson<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json()
  if (!response.ok) throw new Error(getApiErrorMessage(payload))
  return payload as T
}
