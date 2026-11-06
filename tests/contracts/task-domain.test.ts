import { describe, expect, it } from 'vitest'
import { assertOwnership, assertUpdatePayload, normalizeTitle } from '../../src/server/domain/task'

describe('task domain rules', () => {
  it('[AC-SPEC-011] rejects a long title', () => {
    const long = ' '.repeat(3) + 'x'.repeat(201)
    expect(() => normalizeTitle(long), '[AC-SPEC-011] target long').toThrow('title_invalid')
  })

  it('[AC-SPEC-011] rejects a blank title', () => {
    expect(() => normalizeTitle('   '), '[AC-SPEC-011] target blank').toThrow('title_invalid')
  })

  it('[AC-SPEC-011] hides another user task', () => {
    expect(() => assertOwnership({ userId: 'them' }, 'me'), '[AC-SPEC-011] target other').toThrow('not_found')
  })

  it('[AC-SPEC-011] rejects an empty update', () => {
    expect(() => assertUpdatePayload({}), '[AC-SPEC-011] target empty').toThrow('invalid_update')
  })

  it('[AC-SPEC-011] accepts a 200 char title', () => {
    const edge = '  ' + 'x'.repeat(200) + '  '
    expect(() => normalizeTitle(edge), '[AC-SPEC-011] target edge').not.toThrow()
  })

  it('[AC-SPEC-011] accepts a single char title', () => {
    expect(() => normalizeTitle(' a '), '[AC-SPEC-011] target short').not.toThrow()
  })

  it('[AC-SPEC-011] allows the owner', () => {
    expect(() => assertOwnership({ userId: 'me' }, 'me'), '[AC-SPEC-011] target owner').not.toThrow()
  })

  it('[AC-SPEC-011] accepts a title update', () => {
    expect(() => assertUpdatePayload({ title: 'x' }), '[AC-SPEC-011] target update').not.toThrow()
  })
})
