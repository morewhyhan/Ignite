import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'
import { standardRegistryFailures } from '../../scripts/ignite/document-contract.mjs'
import { isGovernedPath } from '../../scripts/ignite/checks.mjs'

const read = (path) => readFileSync(join(repositoryRoot, path), 'utf8')
const readdir = (path) => readdirSync(join(repositoryRoot, path))
const DOC = 'docs/standards/specification-to-implementation-ddd.md'
const LEDGER = 'docs/others/spec-closure/ledger.json'
const BACKFILL = 'docs/others/spec-closure/backfill.json'

function planIds() {
  const ids = new Map()
  for (const name of readdir('docs/plans').filter((n) => n.endsWith('.md') && !/^(README|_template)\.md$/.test(n))) {
    const text = read(`docs/plans/${name}`)
    const meta = text.match(/<!-- ignite-plan\s*\n([\s\S]*?)\n-->/)
    if (!meta) continue
    const parsed = JSON.parse(meta[1])
    ids.set(parsed.id, `docs/plans/${name}`)
  }
  return ids
}

function acceptanceIndex() {
  const index = new Map()
  for (const name of readdir('docs/features').filter((n) => n.endsWith('.md') && !/^(README|_template)\.md$/.test(n))) {
    const text = read(`docs/features/${name}`)
    for (const match of text.matchAll(/^- (AC-[A-Z0-9-]+)（(REQ-[A-Z0-9-]+)）：/gm))
      index.set(match[1], match[2])
  }
  return index
}

describe('specification closure bootstrap', () => {
  it('[AC-SPEC-001] catches any standard missing from the index or the governance whitelist', () => {
    const standards = readdir('docs/standards').filter((name) => name.endsWith('.md') && name !== 'README.md')
    expect(standards).toContain('specification-to-implementation-ddd.md')
    expect(standardRegistryFailures(standards, read('docs/standards/README.md'), isGovernedPath)).toEqual([])

    const unregistered = standardRegistryFailures(['unindexed-standard.md'], '# Standards\n', () => false)
    expect(unregistered).toHaveLength(2)
    expect(unregistered[0]).toContain('unindexed-standard.md')
    expect(unregistered[0]).toContain('not indexed')
    expect(unregistered[1]).toContain('not covered')
  })

  it('[AC-SPEC-002] ledger entries anchor to real sections and real plans only', () => {
    const doc = read(DOC)
    const ledger = JSON.parse(read(LEDGER))
    expect(ledger.source_document).toBe(DOC)
    expect(ledger.items).toHaveLength(52)
    expect(ledger.items.map((item) => item.id)).toEqual(
      Array.from({ length: 52 }, (_, index) => `GAP-${String(index + 1).padStart(2, '0')}`),
    )
    const plans = planIds()
    for (const item of ledger.items) {
      expect(doc).toContain(item.doc_heading)
      expect(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']).toContain(item.group)
      expect(['P0', 'P1', 'P2', 'P3', 'P4', 'P5']).toContain(item.stage)
      expect(['implement', 'keep', 'defer']).toContain(item.disposition)
      expect(item.problem.trim().length).toBeGreaterThan(0)
      if (item.disposition === 'defer') expect(item.reason?.trim().length ?? 0).toBeGreaterThan(0)
      if (item.plan !== null) expect(plans.has(item.plan)).toBe(true)
    }
    expect(ledger.items.filter((item) => item.plan !== null).length).toBeGreaterThan(0)
  })

  it('[AC-SPEC-003] archived plans keep only verifiable bindings and admit what was not recorded', () => {
    const backfill = JSON.parse(read(BACKFILL))
    expect(backfill.entries).toHaveLength(5)
    const acceptance = acceptanceIndex()
    const live = planIds()
    for (const entry of backfill.entries) {
      expect(entry.archived_in_git).toBe(true)
      expect(entry.plan_path).toBeUndefined()
      expect(live.has(entry.plan_id)).toBe(false)
      expect(entry.integrated_commit).toMatch(/^[0-9a-f]{40}$/)
      expect(entry.backfilled_at).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(entry.unrecorded.length).toBeGreaterThan(0)
      expect(entry.bindings.length + entry.unrecorded.length).toBeGreaterThan(0)
      for (const binding of entry.bindings) {
        expect(acceptance.get(binding.target)).toBe(binding.source)
      }
    }
  })
})
