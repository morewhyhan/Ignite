import { describe, expect, it } from 'vitest'
import { assertOwnership, assertUpdatePayload, normalizeTitle } from '../../src/server/domain/task'

describe('task domain rules', () => {
  it('[AC-SPEC-011] rejects a long title', () => {
    let observed = 'none'
    try {
      normalizeTitle(' '.repeat(3) + 'x'.repeat(201))
    } catch (error) {
      observed = (error as { code?: string }).code ?? String(error)
    }
    expect(observed, '[AC-SPEC-011] target rejects a long title').toBe('title_invalid')
  })

  it('[AC-SPEC-011] rejects a blank title', () => {
    let observed = 'none'
    try {
      normalizeTitle('   ')
    } catch (error) {
      observed = (error as { code?: string }).code ?? String(error)
    }
    expect(observed, '[AC-SPEC-011] target rejects a blank title').toBe('title_invalid')
  })

  it('[AC-SPEC-011] hides another user task', () => {
    let observed = 'none'
    try {
      assertOwnership({ userId: 'them' }, 'me')
    } catch (error) {
      observed = (error as { code?: string }).code ?? String(error)
    }
    expect(observed, '[AC-SPEC-011] target hides another user task').toBe('not_found')
  })

  it('[AC-SPEC-011] rejects an empty update', () => {
    let observed = 'none'
    try {
      assertUpdatePayload({})
    } catch (error) {
      observed = (error as { code?: string }).code ?? String(error)
    }
    expect(observed, '[AC-SPEC-011] target rejects an empty update').toBe('invalid_update')
  })

  it('[AC-SPEC-011] accepts a 200 char title', () => {
    let observed = 'none'
    try {
      observed = String(normalizeTitle('  ' + 'x'.repeat(200) + '  ') === 'x'.repeat(200) ? 'ok' : 'bad')
    } catch (error) {
      observed = (error as { code?: string }).code ?? String(error)
    }
    expect(observed, '[AC-SPEC-011] target accepts a 200 char title').toBe('ok')
  })

  it('[AC-SPEC-011] accepts a single char title', () => {
    let observed = 'none'
    try {
      observed = String(normalizeTitle(' a '))
    } catch (error) {
      observed = (error as { code?: string }).code ?? String(error)
    }
    expect(observed, '[AC-SPEC-011] target accepts a single char title').toBe('a')
  })

  it('[AC-SPEC-011] allows the owner', () => {
    let observed = 'none'
    try {
      observed = String(assertOwnership({ userId: 'me' }, 'me') ?? 'ok')
    } catch (error) {
      observed = (error as { code?: string }).code ?? String(error)
    }
    expect(observed, '[AC-SPEC-011] target allows the owner').toBe('ok')
  })

  it('[AC-SPEC-011] accepts a title update', () => {
    let observed = 'none'
    try {
      observed = String(assertUpdatePayload({ title: 'x' }) ?? 'ok')
    } catch (error) {
      observed = (error as { code?: string }).code ?? String(error)
    }
    expect(observed, '[AC-SPEC-011] target accepts a title update').toBe('ok')
  })

})
