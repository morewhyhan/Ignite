import type { AppType } from '@/server/api'
import { hc } from 'hono/client'

const baseUrl =
  typeof window === 'undefined'
    ? (process.env.APP_URL ?? 'http://localhost:3000')
    : window.location.origin

export const client = hc<AppType>(baseUrl, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    globalThis.fetch(input, {
      ...init,
      credentials: 'include',
    }),
})

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
