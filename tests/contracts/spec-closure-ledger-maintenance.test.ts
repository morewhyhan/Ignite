import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'
import { validatePlan } from '../../scripts/ignite/state.mjs'

const LEDGER = 'docs/others/spec-closure/ledger.json'
const EXPECTATIONS = 'docs/others/spec-closure/ledger-expectations.json'
const RESULTS = ['met', 'kept', 'partial', 'missing']

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
          missing: string[]
          metPlan: Record<string, string>
        })
      : null
    if (!expectations) gaps.push('expectations file missing')
    const expected = expectations ?? { met: [], kept: [], partial: [], missing: [], metPlan: {} }
    if (ledger.items.length !== 52) gaps.push('item count ' + ledger.items.length)
    const order = Array.from({ length: 52 }, (_, i) => 'GAP-' + String(i + 1).padStart(2, '0'))
    if (ledger.items.map((item) => item.id).join(',') !== order.join(','))
      gaps.push('item order changed')
    for (const item of ledger.items)
      if (!RESULTS.includes(item.result ?? ''))
        gaps.push(item.id + ': result=' + (item.result ?? 'missing-field'))
    const byResult = (value: string) =>
      ledger.items
        .filter((item) => item.result === value)
        .map((item) => item.id)
        .sort()
        .join(',')
    for (const result of ['met', 'kept', 'partial', 'missing'])
      if (byResult(result) !== [...(expected as unknown as Record<string, string[]>[result]].sort().join(','))
        gaps.push(result + ' set ' + byResult(result))
    for (const [id, plan] of Object.entries(expected.metPlan ?? {})) {
      const item = ledger.items.find((entry) => entry.id === id)
      if (item?.plan !== plan) gaps.push(id + ': plan ' + (item?.plan ?? 'none') + ' != ' + plan)
    }
    const retiredPath = 'docs/plans/20261106-spec-closure-ledger.md'
    const retiredContent = readFileSync(join(repositoryRoot, retiredPath), 'utf8')
    const retiredMeta = JSON.parse(retiredContent.match(/<!-- ignite-plan\n([\s\S]*?)\n-->/)![1])
    const retiredPlan = {
      path: join(repositoryRoot, retiredPath),
      relativePath: retiredPath,
      content: retiredContent,
      metadata: retiredMeta,
    }
    if (
      validatePlan(retiredPlan as never, { allowLegacy: false }).some((e) =>
        e.includes('AC-SPEC-007'),
      )
    )
      gaps.push('retired plan still requires AC-SPEC-007 evidence')
    const orphan = { ...retiredPlan, metadata: { ...retiredMeta, superseded_by: undefined } }
    if (
      !validatePlan(orphan as never, { allowLegacy: false }).some((e) =>
        e.includes('superseded_plan_requires_successor'),
      )
    )
      gaps.push('retired plan without successor accepted')
    expect(gaps, '[AC-SPEC-009] target ledger expectation gaps').toEqual([])
  })
})
