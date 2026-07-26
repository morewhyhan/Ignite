import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const schema = readFileSync(resolve(process.cwd(), 'prisma', 'schema.prisma'), 'utf8')

function model(name: string) {
  const match = schema.match(new RegExp(`model ${name} \\{([\\s\\S]*?)\\n\\}`))
  if (!match) throw new Error(`Prisma model ${name} was not found`)
  return match[1]
}

describe('Better Auth Prisma schema contract', () => {
  it('keeps the user name required', () => {
    expect(model('user')).toMatch(/^\s*name\s+String(?!\?)/m)
  })

  it('keeps the current user image field', () => {
    expect(model('user')).toMatch(/^\s*image\s+String\?/m)
  })

  it('keeps the current Better Auth account token fields', () => {
    const account = model('account')

    expect(account).toMatch(/^\s*accessTokenExpiresAt\s+DateTime\?/m)
    expect(account).toMatch(/^\s*refreshTokenExpiresAt\s+DateTime\?/m)
    expect(account).toMatch(/^\s*scope\s+String\?/m)
    expect(account).not.toMatch(/^\s*expiresAt\s+/m)
  })

  it('indexes the session and account ownership lookups', () => {
    expect(model('session')).toMatch(/@@index\(\[userId\]\)/)
    expect(model('account')).toMatch(/@@index\(\[userId\]\)/)
  })
})
