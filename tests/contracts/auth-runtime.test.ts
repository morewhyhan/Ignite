import { describe, expect, it } from 'vitest'
import { authRateLimitEnabled } from '@/server/auth/rate-limit'

describe('Better Auth runtime behavior', () => {
  it('[AC-AUTH-005] enables rate limiting only for the real production environment', () => {
    expect(authRateLimitEnabled('development')).toBe(false)
    expect(authRateLimitEnabled('test')).toBe(false)
    expect(authRateLimitEnabled('production')).toBe(true)
  })
})
