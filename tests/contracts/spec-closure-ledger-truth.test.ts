import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { gitCommitExists, isAncestor, repositoryRoot } from '../../scripts/ignite/core.mjs'

const LEDGER = 'docs/others/spec-closure/ledger.json'
const EXPECTATIONS = 'docs/others/spec-closure/ledger-expectations.json'
const CURRENT_PLAN = 'IGT-202611060007'

function qualifiedPlanIds() {
  const dir = join(repositoryRoot, 'docs/plans')
  const ids = new Set<string>()
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md') || /^(README|_template)[.]md$/.test(name)) continue
    const text = readFileSync(join(dir, name), 'utf8')
    const match = text.match(/<!-- ignite-plan\n([\s\S]*?)\n-->/)
    if (!match) continue
    const metadata = JSON.parse(match[1])
    if (metadata.id === CURRENT_PLAN) continue
    const completedRetired =
      ['cancelled', 'superseded'].includes(metadata.status) &&
      Boolean(metadata.integrated_commit) &&
      gitCommitExists(metadata.integrated_commit) &&
      isAncestor(metadata.integrated_commit, 'HEAD')
    if (metadata.status === 'done' || completedRetired) ids.add(metadata.id)
  }
  return ids
}

function qualifiedReleaseIds(plans: Set<string>) {
  const dir = join(repositoryRoot, 'docs/plans/releases')
  const ids = new Set<string>()
  if (!existsSync(dir)) return ids
  for (const name of readdirSync(dir).filter((entry) => entry.endsWith('.json'))) {
    const release = JSON.parse(readFileSync(join(dir, name), 'utf8'))
    const planIds: string[] = Array.isArray(release.plan_ids) ? release.plan_ids : []
    if (planIds.length > 0 && planIds.every((id) => plans.has(id)))
      ids.add(name.replace(/[.]json$/, ''))
  }
  return ids
}

describe('specification closure ledger truth', () => {
  it('[AC-SPEC-010] every met entry names a qualified plan and release', () => {
    const gaps: string[] = []
    const ledger = JSON.parse(readFileSync(join(repositoryRoot, LEDGER), 'utf8')) as {
      items: { id: string; result?: string }[]
    }
    const expectations = JSON.parse(readFileSync(join(repositoryRoot, EXPECTATIONS), 'utf8')) as {
      metEvidence?: Record<string, { plan?: string; release?: string }>
    }
    const plans = qualifiedPlanIds()
    const releases = qualifiedReleaseIds(plans)
    for (const item of ledger.items.filter((entry) => entry.result === 'met')) {
      const evidence = expectations.metEvidence?.[item.id]
      if (!evidence) {
        gaps.push(item.id + ': missing metEvidence')
        continue
      }
      if (!evidence.plan || !plans.has(evidence.plan))
        gaps.push(item.id + ': evidence plan not qualified')
      if (!evidence.release || !releases.has(evidence.release))
        gaps.push(item.id + ': evidence release not qualified')
    }
    expect(gaps, '[AC-SPEC-010] target ledger truth gaps').toEqual([])
  })
})
