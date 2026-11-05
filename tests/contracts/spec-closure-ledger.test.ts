import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'

const LEDGER = 'docs/others/spec-closure/ledger.json'

describe('specification closure ledger', () => {
  it('[AC-SPEC-007] every entry records an implementation result', () => {
    const ledger = JSON.parse(readFileSync(join(repositoryRoot, LEDGER), 'utf8')) as {
      items: { id: string; result?: string; plan: string | null }[]
    }
    expect(ledger.items).toHaveLength(52)
    const gaps: string[] = []
    for (const item of ledger.items) {
      if (!['met', 'partial', 'missing'].includes(item.result ?? ''))
        gaps.push(`${item.id}: result=${item.result ?? 'missing-field'}`)
      if (item.result === 'met' && !item.plan) gaps.push(`${item.id}: met without plan`)
    }
    expect(gaps, '[AC-SPEC-007] target ledger result gaps').toEqual([])
  })
})
