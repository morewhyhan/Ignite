import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  commitAll,
  makeFixture,
  planContent,
  read,
  repositoryRoot,
  runCli,
  write,
} from './ignite-fixture'

function next(root: string, verbose = false) {
  const path = 'docs/plans/fixture.md'
  const content = read(root, path)
  const metadata = JSON.parse(content.match(/<!-- ignite-plan\s*([\s\S]*?)-->/)![1])
  if (metadata.status === 'verifying' && !metadata.integrated_commit) {
    metadata.integrated_commit = commitAll(root, 'Capture the verification Plan contract')
    write(
      root,
      path,
      content.replace(
        /<!-- ignite-plan\s*[\s\S]*?-->/,
        `<!-- ignite-plan\n${JSON.stringify(metadata, null, 2)}\n-->`,
      ),
    )
  }
  const result = runCli(root, 'next', '--plan', 'IGT-900', ...(verbose ? ['--verbose'] : []))
  expect(result.status, result.stderr || result.stdout).toBe(0)
  return JSON.parse(result.stdout)
}

describe('Execution prompt entrypoints', () => {
  it('[AC-EXECUTION-034] routes real next actions to the same prompt source without replacing action decisions', () => {
    const fixture = makeFixture()
    try {
      const cases = [
        { overrides: {}, action: 'implement-and-check', phase: ['P2', 'P3', 'P4'] },
        {
          overrides: { requirements: ['REQ-MISSING-404'] },
          action: 'repair-input',
          phase: ['P2', 'P4'],
        },
        {
          overrides: {
            status: 'blocked',
            blocker: {
              id: 'ACCOUNT-001',
              owner: 'user',
              reason: 'External account missing',
              resume_action: 'Provide the authorized account',
            },
          },
          action: 'wait-for-blocker',
          phase: ['P3'],
        },
        { overrides: { status: 'verifying' }, action: 'verify-integration', phase: ['P4'] },
        { overrides: { status: 'cancelled' }, action: 'report-result', phase: ['P4'] },
      ]
      for (const { overrides, action, phase } of cases) {
        write(fixture.root, 'docs/plans/fixture.md', planContent(fixture.baseCommit, overrides))
        const summary = next(fixture.root)
        const verbose = next(fixture.root, true)
        expect(summary.next_action.kind).toBe(action)
        expect(verbose.next_action).toEqual(summary.next_action)
        expect(summary.execution_guidance).toEqual({
          source: 'docs/standards/execution-focus.md',
          common: ['P1', 'P5'],
          phase,
          on_rule_change: ['P6'],
        })
        expect(verbose.execution_guidance).toEqual(summary.execution_guidance)
        const source = read(repositoryRoot, summary.execution_guidance.source)
        for (const id of [...summary.execution_guidance.common, ...phase, 'P6']) {
          expect(source).toContain(`<a id="${id}"></a>`)
        }
      }
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-035] scaffolds stage prompt references for all six results without copying prompts or completion evidence', () => {
    for (const script of ['create-change.mjs', 'create-module.mjs']) {
      const fixture = makeFixture()
      try {
        for (const path of ['docs/plans/_template.md', 'docs/others/test-cases/_template.md']) {
          write(fixture.root, path, read(repositoryRoot, path))
        }
        commitAll(fixture.root, 'Install current draft templates')
        const result = spawnSync(
          process.execPath,
          [join(repositoryRoot, 'scripts', script), 'prompt-example'],
          {
            cwd: fixture.root,
            encoding: 'utf8',
            windowsHide: true,
            env: { ...process.env, IGNITE_ROOT: fixture.root },
          },
        )
        expect(result.status, result.stderr || result.stdout).toBe(0)
        const path = readdirSync(join(fixture.root, 'docs/plans')).find((name) =>
          name.endsWith('-prompt-example.md'),
        )!
        const draft = read(fixture.root, `docs/plans/${path}`)
        for (const id of ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']) {
          expect(draft).toContain(`../standards/execution-focus.md#${id}`)
        }
        expect(draft).not.toContain('```text')
        const metadata = JSON.parse(draft.match(/<!-- ignite-plan\s*([\s\S]*?)-->/)![1])
        expect(metadata.status).toBe('draft')
        expect(metadata.tasks.every((task: { status: string }) => task.status !== 'done')).toBe(
          true,
        )
        expect(metadata.evidence).toEqual([])
        expect(metadata.tdd_evidence).toEqual([])
        if (script === 'create-module.mjs') {
          expect(read(fixture.root, 'docs/features/prompt-example.md')).toContain(
            '../standards/execution-focus.md#P1',
          )
        }
      } finally {
        fixture.cleanup()
      }
    }
  })
})
