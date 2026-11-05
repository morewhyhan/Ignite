import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'

const LEDGER = 'docs/others/spec-closure/ledger.json'

function livePlanIds() {
  const dir = join(repositoryRoot, 'docs/plans')
  const ids = new Set<string>()
  for (const name of readdirSync(dir).filter(
    (n) => n.endsWith('.md') && !/^(README|_template)\.md$/.test(n),
  )) {
    const text = readFileSync(join(dir, name), 'utf8')
    const meta = text.match(/<!-- ignite-plan\n([\s\S]*?)\n-->/)
    if (meta) ids.add((JSON.parse(meta[1]) as { id: string }).id)
  }
  return ids
}

const EXPECTED_MET = ['GAP-01', 'GAP-10', 'GAP-20', 'GAP-21', 'GAP-24']
const EXPECTED_PARTIAL = ['GAP-23']
const EXPECTED_KEPT = [
  'GAP-14',
  'GAP-18',
  'GAP-25',
  'GAP-35',
  'GAP-38',
  'GAP-39',
  'GAP-40',
  'GAP-45',
  'GAP-48',
  'GAP-51',
  'GAP-52',
]
const EXPECTED_MISSING = ['GAP-02', 'GAP-03', 'GAP-05', 'GAP-06', 'GAP-08', 'GAP-46']
const EXPECTED_MET_PLAN: Record<string, string> = {
  'GAP-01': 'IGT-202611060001',
  'GAP-10': 'IGT-202611060002',
  'GAP-20': 'IGT-202611060003',
  'GAP-21': 'IGT-202611060003',
  'GAP-24': 'IGT-202611060003',
}

describe('specification closure ledger', () => {
  it('[AC-SPEC-007] every entry records a truthful implementation result', () => {
    const ledger = JSON.parse(readFileSync(join(repositoryRoot, LEDGER), 'utf8')) as {
      items: { id: string; result?: string; plan: string | null }[]
    }
    const gaps: string[] = []
    if (ledger.items.length !== 52) gaps.push(`item count ${ledger.items.length}`)
    const ids = ledger.items.map((item) => item.id)
    if (
      ids.join(',') !==
      Array.from({ length: 52 }, (_, i) => `GAP-${String(i + 1).padStart(2, '0')}`).join(',')
    )
      gaps.push('item order changed')

    const plans = livePlanIds()
    for (const item of ledger.items) {
      if (!['met', 'kept', 'partial', 'missing'].includes(item.result ?? ''))
        gaps.push(`${item.id}: result=${item.result ?? 'missing-field'}`)
      if (item.result === 'met' && (!item.plan || !plans.has(item.plan)))
        gaps.push(`${item.id}: met without live plan`)
    }

    const met = ledger.items
      .filter((item) => item.result === 'met')
      .map((item) => item.id)
      .sort()
    const partial = ledger.items
      .filter((item) => item.result === 'partial')
      .map((item) => item.id)
      .sort()
    const kept = ledger.items
      .filter((item) => item.result === 'kept')
      .map((item) => item.id)
      .sort()
    if (kept.join(',') !== [...EXPECTED_KEPT].sort().join(','))
      gaps.push(`kept set ${kept.join(',')}`)
    const missing = ledger.items.filter((item) => item.result === 'missing').map((item) => item.id)
    if (met.join(',') !== [...EXPECTED_MET].sort().join(',')) gaps.push(`met set ${met.join(',')}`)
    if (partial.join(',') !== [...EXPECTED_PARTIAL].sort().join(','))
      gaps.push(`partial set ${partial.join(',')}`)
    for (const id of EXPECTED_MISSING)
      if (!missing.includes(id)) gaps.push(`${id}: expected missing`)
    for (const [id, plan] of Object.entries(EXPECTED_MET_PLAN)) {
      const item = ledger.items.find((entry) => entry.id === id)
      if (item?.plan !== plan) gaps.push(`${id}: plan ${item?.plan ?? 'none'} != ${plan}`)
    }

    expect(gaps, '[AC-SPEC-007] target ledger result gaps').toEqual([])
  })
})
