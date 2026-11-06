import { describe, expect, it } from 'vitest'
import { assertOwnership, assertUpdatePayload, normalizeTitle } from '../../src/server/domain/task'

describe('task domain rules', () => {
  it('[AC-SPEC-011] rejects a title longer than 200 characters after trim', () => {
    expect(
      () => normalizeTitle(' '.repeat(3) + 'x'.repeat(201)),
      '[AC-SPEC-011] target title too long',
    ).toThrow('title_invalid')
  })

  it('[AC-SPEC-011] rejects a blank title', () => {
    expect(() => normalizeTitle('   '), '[AC-SPEC-011] target blank title').toThrow('title_invalid')
  })

  it('[AC-SPEC-011] treats another users task as not found', () => {
    expect(
      () => assertOwnership({ userId: 'someone-else' }, 'me'),
      '[AC-SPEC-011] target other user',
    ).toThrow('not_found')
  })

  it('[AC-SPEC-011] rejects an update without any updatable field', () => {
    expect(() => assertUpdatePayload({}), '[AC-SPEC-011] target empty update').toThrow(
      'invalid_update',
    )
  })

  it('[AC-SPEC-011] accepts a title of exactly 200 characters after trim', () => {
    expect(
      () => normalizeTitle('  ' + 'x'.repeat(200) + '  '),
      '[AC-SPEC-011] target boundary title',
    ).not.toThrow()
  })

  it('[AC-SPEC-011] accepts a single character title', () => {
    expect(() => normalizeTitle(' a '), '[AC-SPEC-011] target short title').not.toThrow()
  })

  it('[AC-SPEC-011] allows the owner to access their own task', () => {
    expect(
      () => assertOwnership({ userId: 'me' }, 'me'),
      '[AC-SPEC-011] target owner access',
    ).not.toThrow()
  })

  it('[AC-SPEC-011] accepts an update that changes the title', () => {
    expect(
      () => assertUpdatePayload({ title: 'next' }),
      '[AC-SPEC-011] target valid update',
    ).not.toThrow()
  })
})
