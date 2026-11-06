import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'

const LEDGER = 'docs/others/spec-closure/ledger.json'
const EXPECTATIONS = 'docs/others/spec-closure/ledger-expectations.json'

describe('specification closure ledger ownership', () => {
  it('[AC-SPEC-009] ledger results match the owned expectations file', () => {
    const gaps: string[] = []
    const ledger = JSON.parse(readFileSync(join(repositoryRoot, LEDGER), 'utf8')) as {
      items: { id: string; result?: string; plan: string | null }[]
    }
    const expectationsPath = join(repositoryRoot, EXPECTATIONS)
    const expectations = existsSync(expectationsPath)
      ? (JSON.parse(readFileSync(expectationsPath, 'utf8')) as {
          met: string[]
          kept: string[]
          partial: string[]
          metPlan: Record<string, string>
        })
      : null
    if (!expectations) gaps.push('expectations file missing')
    const expected = expectations ?? { met: [], kept: [], partial: [], metPlan: {} }
    if (ledger.items.length !== 52) gaps.push('item count ' + ledger.items.length)
    const byResult = (value: string) =>
      ledger.items
        .filter((item) => item.result === value)
        .map((item) => item.id)
        .sort()
        .join(',')
    if (byResult('met') !== [...expected.met].sort().join(',')) gaps.push('met set ' + byResult('met'))
    if (byResult('kept') !== [...expected.kept].sort().join(','))
      gaps.push('kept set ' + byResult('kept'))
    if (byResult('partial') !== [...expected.partial].sort().join(','))
      gaps.push('partial set ' + byResult('partial'))
    for (const [id, plan] of Object.entries(expected.metPlan ?? {})) {
      const item = ledger.items.find((entry) => entry.id === id)
      if (item?.plan !== plan) gaps.push(id + ': plan ' + (item?.plan ?? 'none') + ' != ' + plan)
    }
    expect(gaps, '[AC-SPEC-009] target ledger expectation gaps').toEqual([])
  })
})
