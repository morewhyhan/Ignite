import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { gitCommitExists, isAncestor, repositoryRoot } from '../../scripts/ignite/core.mjs'

const LEDGER = 'docs/others/spec-closure/ledger.json'
const EXPECTATIONS = 'docs/others/spec-closure/ledger-expectations.json'

function livePlanIds() {
  const dir = join(repositoryRoot, 'docs/plans')
  return new Set(
    readdirSync(dir)
      .filter((name) => name.endsWith('.md') && !/^(README|_template)\.md$/.test(name))
      .map((name) => readFileSync(join(dir, name), 'utf8'))
      .map((text) => text.match(/<!-- ignite-plan\n([\s\S]*?)\n-->/))
      .filter(Boolean)
      .map((match) => JSON.parse(match[1]).id),
  )
}

function releaseIds() {
  const dir = join(repositoryRoot, 'docs/plans/releases')
  if (!existsSync(dir)) return new Set()
  return new Set(
    readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .map((name) => name.replace(/\.json$/, '')),
  )
}

describe('specification closure ledger truth', () => {
  it('[AC-SPEC-010] every met entry names a real plan and release', () => {
    const gaps: string[] = []
    const ledger = JSON.parse(readFileSync(join(repositoryRoot, LEDGER), 'utf8'))
    const expectations = JSON.parse(readFileSync(join(repositoryRoot, EXPECTATIONS), 'utf8'))
    const plans = qualifiedPlanIds()
    const releases = qualifiedReleaseIds(plans)
    for (const item of ledger.items.filter((entry) => entry.result === 'met')) {
      const evidence = expectations.metEvidence && expectations.metEvidence[item.id]
      if (!evidence) {
        gaps.push(item.id + ': missing metEvidence')
        continue
      }
      if (!evidence.plan || !plans.has(evidence.plan)) gaps.push(item.id + ': plan not found')
      if (!evidence.release || !releases.has(evidence.release))
        gaps.push(item.id + ': release not found')
    }
    expect(gaps, '[AC-SPEC-010] target ledger truth gaps').toEqual([])
  })
})
