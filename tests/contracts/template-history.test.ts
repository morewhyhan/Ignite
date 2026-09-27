import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it } from 'vitest'
import { assertTemplateBaselineEvidence } from './template-history-baseline'

const root = join(import.meta.dirname, '..', '..')

it('[AC-PRODUCT-015] [AC-EXECUTION-009] [AC-EXECUTION-011] keeps all template baseline evidence traceable', () => {
  assertTemplateBaselineEvidence(root)
})

it('[AC-EXECUTION-023] accepts archived baseline history after adoption', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'ignite-adopted-template-history-'))
  const baselineCommit = 'a'.repeat(40)
  const historyRoot = `docs/others/template-history/${baselineCommit}`
  const archivedFiles = [
    {
      source: 'docs/plans/baseline.md',
      archive: `${historyRoot}/docs/plans/baseline.md.txt`,
    },
    {
      source: 'docs/plans/releases/baseline-v1.json',
      archive: `${historyRoot}/docs/plans/releases/baseline-v1.json.txt`,
    },
    {
      source: 'docs/others/evidence/runs/run-baseline.json',
      archive: `${historyRoot}/docs/others/evidence/runs/run-baseline.json.txt`,
    },
    {
      source: 'docs/others/evidence/tdd/IGT-900/tdd-baseline.json',
      archive: `${historyRoot}/docs/others/evidence/tdd/IGT-900/tdd-baseline.json.txt`,
    },
  ]

  try {
    mkdirSync(join(fixture, '.ai'), { recursive: true })
    writeFileSync(join(fixture, '.ai', 'project.json'), '{"mode":"template-baseline"}\n')
    for (const directory of [
      'docs/plans/releases',
      'docs/others/evidence/runs',
      'docs/others/evidence/tdd',
      historyRoot,
    ]) {
      mkdirSync(join(fixture, directory), { recursive: true })
    }
    for (const entry of archivedFiles) {
      const archivePath = join(fixture, entry.archive)
      mkdirSync(dirname(archivePath), { recursive: true })
      writeFileSync(archivePath, 'archived baseline evidence\n')
    }
    const indexPath = join(fixture, historyRoot, 'index.json')
    writeFileSync(
      indexPath,
      `${JSON.stringify(
        {
          schema: 1,
          reason: 'template copy has a new Git history',
          baseline_commit: baselineCommit,
          files: archivedFiles,
        },
        null,
        2,
      )}\n`,
    )

    expect(() => assertTemplateBaselineEvidence(fixture)).not.toThrow()

    const index = JSON.parse(readFileSync(indexPath, 'utf8')) as { baseline_commit: string }
    index.baseline_commit = 'b'.repeat(40)
    writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`)
    expect(() => assertTemplateBaselineEvidence(fixture)).toThrow(/baseline commit/i)
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
