import { describe, expect, it } from 'vitest'
import {
  DomainError,
  assertOwnership,
  assertUpdatePayload,
  normalizeTitle,
} from '../../src/server/domain/task'

describe('task domain rules', () => {
  it('[AC-SPEC-011] rejects a title longer than 200 characters after trim', () => {
    let code = ''
    try {
      normalizeTitle(' '.repeat(3) + 'x'.repeat(201))
    } catch (error) {
      code = (error as DomainError).code
    }
    expect(code, '[AC-SPEC-011] target title length rule').toBe('title_invalid')
  })

  it('[AC-SPEC-011] rejects a blank title', () => {
    let code = ''
    try {
      normalizeTitle('   ')
    } catch (error) {
      code = (error as DomainError).code
    }
    expect(code, '[AC-SPEC-011] target blank title rule').toBe('title_invalid')
  })

  it('[AC-SPEC-011] treats another users task as not found', () => {
    let code = ''
    try {
      assertOwnership({ userId: 'someone-else' }, 'me')
    } catch (error) {
      code = (error as DomainError).code
    }
    expect(code, '[AC-SPEC-011] target ownership rule').toBe('not_found')
  })

  it('[AC-SPEC-011] rejects an update without any updatable field', () => {
    let code = ''
    try {
      assertUpdatePayload({})
    } catch (error) {
      code = (error as DomainError).code
    }
    expect(code, '[AC-SPEC-011] target empty update rule').toBe('invalid_update')
  })
})
