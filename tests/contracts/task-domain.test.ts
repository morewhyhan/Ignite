import { describe, expect, it } from 'vitest'

type DomainModule = typeof import('../../src/server/domain/task')
const load = async (): Promise<DomainModule> => import('../../src/server/domain/task')

describe('task domain rules', () => {
  it('[AC-SPEC-011] rejects a title longer than 200 characters after trim', async () => {
    let code = ''
    try {
      const { normalizeTitle, assertOwnership, assertUpdatePayload } = await load()
      normalizeTitle(' '.repeat(3) + 'x'.repeat(201))
    } catch (error) {
      code = (error as { code?: string }).code ?? String(error)
    }
    expect(code, '[AC-SPEC-011] target rejects a title longer than 200 characters after trim').toBe(
      'title_invalid',
    )
  })

  it('[AC-SPEC-011] rejects a blank title', async () => {
    let code = ''
    try {
      const { normalizeTitle, assertOwnership, assertUpdatePayload } = await load()
      normalizeTitle('   ')
    } catch (error) {
      code = (error as { code?: string }).code ?? String(error)
    }
    expect(code, '[AC-SPEC-011] target rejects a blank title').toBe('title_invalid')
  })

  it('[AC-SPEC-011] treats another users task as not found', async () => {
    let code = ''
    try {
      const { normalizeTitle, assertOwnership, assertUpdatePayload } = await load()
      assertOwnership({ userId: 'someone-else' }, 'me')
    } catch (error) {
      code = (error as { code?: string }).code ?? String(error)
    }
    expect(code, '[AC-SPEC-011] target treats another users task as not found').toBe('not_found')
  })

  it('[AC-SPEC-011] rejects an update without any updatable field', async () => {
    let code = ''
    try {
      const { normalizeTitle, assertOwnership, assertUpdatePayload } = await load()
      assertUpdatePayload({})
    } catch (error) {
      code = (error as { code?: string }).code ?? String(error)
    }
    expect(code, '[AC-SPEC-011] target rejects an update without any updatable field').toBe(
      'invalid_update',
    )
  })

  it('[AC-SPEC-011] accepts a title of exactly 200 characters after trim', async () => {
    let value: unknown
    try {
      const { normalizeTitle, assertOwnership, assertUpdatePayload } = await load()
      value = (() => {
        const title = normalizeTitle('  ' + 'x'.repeat(200) + '  ')
        return title.length
      })()
    } catch (error) {
      value = String(error)
    }
    expect(value, '[AC-SPEC-011] target accepts a title of exactly 200 characters after trim').toBe(
      200,
    )
  })

  it('[AC-SPEC-011] accepts a single character title', async () => {
    let value: unknown
    try {
      const { normalizeTitle, assertOwnership, assertUpdatePayload } = await load()
      value = (() => {
        return normalizeTitle(' a ')
      })()
    } catch (error) {
      value = String(error)
    }
    expect(value, '[AC-SPEC-011] target accepts a single character title').toBe('a')
  })

  it('[AC-SPEC-011] allows the owner to access their own task', async () => {
    let value: unknown
    try {
      const { normalizeTitle, assertOwnership, assertUpdatePayload } = await load()
      value = (() => {
        assertOwnership({ userId: 'me' }, 'me')
        return 'allowed'
      })()
    } catch (error) {
      value = String(error)
    }
    expect(value, '[AC-SPEC-011] target allows the owner to access their own task').toBe('allowed')
  })

  it('[AC-SPEC-011] accepts an update that changes the title', async () => {
    let value: unknown
    try {
      const { normalizeTitle, assertOwnership, assertUpdatePayload } = await load()
      value = (() => {
        assertUpdatePayload({ title: 'next' })
        return 'allowed'
      })()
    } catch (error) {
      value = String(error)
    }
    expect(value, '[AC-SPEC-011] target accepts an update that changes the title').toBe('allowed')
  })
})
