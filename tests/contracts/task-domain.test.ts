import { describe, expect, it } from 'vitest'
import { assertOwnership, assertUpdatePayload, normalizeTitle } from '../../src/server/domain/task'

function codeOf(run: () => unknown) {
  try {
    run()
    return 'ok'
  } catch (error) {
    return (error as { code?: string }).code ?? String(error)
  }
}

describe('task domain rules', () => {
  it('[AC-SPEC-011] decides every task rule in one place', () => {
    const observed = [
      codeOf(() => normalizeTitle(' '.repeat(3) + 'x'.repeat(201))),
      codeOf(() => normalizeTitle('   ')),
      codeOf(() => assertOwnership({ userId: 'them' }, 'me')),
      codeOf(() => assertUpdatePayload({})),
      codeOf(() => normalizeTitle('  ' + 'x'.repeat(200) + '  ')),
      codeOf(() => normalizeTitle(' a ')),
      codeOf(() => assertOwnership({ userId: 'me' }, 'me')),
      codeOf(() => assertUpdatePayload({ title: 'x' })),
    ]
    expect(observed, '[AC-SPEC-011] target task rules').toEqual([
      'title_invalid',
      'title_invalid',
      'not_found',
      'invalid_update',
      'ok',
      'ok',
      'ok',
      'ok',
    ])
  })
})
