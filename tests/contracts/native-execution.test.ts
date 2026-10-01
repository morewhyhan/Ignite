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
    metadata.integrated_commit = commitAll(root, 'Capture verification input')
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

describe('Native execution documentation', () => {
  it('[AC-EXECUTION-036] resumes real Plan states without an extra prompt router and preserves decisions and context', () => {
    const fixture = makeFixture()
    try {
      const cases = [
        { overrides: {}, action: 'implement-and-check' },
        { overrides: { requirements: ['REQ-MISSING-404'] }, action: 'repair-input' },
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
        },
        { overrides: { status: 'verifying' }, action: 'verify-integration' },
        { overrides: { status: 'cancelled' }, action: 'report-result' },
      ]
      for (const { overrides, action } of cases) {
        const context = {
          goals: [{ text: 'Keep the original result visible', requirements: ['REQ-FIXTURE-001'] }],
          constraints: ['Retain existing access rules'],
          non_goals: ['Change the product'],
        }
        write(
          fixture.root,
          'docs/plans/fixture.md',
          planContent(fixture.baseCommit, { ...context, ...overrides }),
        )
        const summary = next(fixture.root)
        const verbose = next(fixture.root, true)
        expect(summary).not.toHaveProperty('execution_guidance')
        expect(verbose).not.toHaveProperty('execution_guidance')
        expect(summary.next_action.kind).toBe(action)
        expect(verbose.next_action).toEqual(summary.next_action)
        expect(summary.goals).toEqual(context.goals)
        expect(summary.constraints).toEqual(context.constraints)
        expect(summary.non_goals).toEqual(context.non_goals)
      }
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-037] generates native requirement and Plan drafts without prompt dependencies or completion evidence', () => {
    for (const script of ['create-change.mjs', 'create-module.mjs']) {
      const fixture = makeFixture()
      try {
        for (const path of ['docs/plans/_template.md', 'docs/others/test-cases/_template.md']) {
          write(fixture.root, path, read(repositoryRoot, path))
        }
        commitAll(fixture.root, 'Install draft templates')
        const result = spawnSync(
          process.execPath,
          [join(repositoryRoot, 'scripts', script), 'native-example'],
          {
            cwd: fixture.root,
            encoding: 'utf8',
            windowsHide: true,
            env: { ...process.env, IGNITE_ROOT: fixture.root },
          },
        )
        expect(result.status, result.stderr || result.stdout).toBe(0)
        const path = readdirSync(join(fixture.root, 'docs/plans')).find((name) =>
          name.endsWith('-native-example.md'),
        )!
        const draft = read(fixture.root, `docs/plans/${path}`)
        expect(draft).not.toContain('execution-focus.md')
        expect(draft).toContain('## 原始目标与覆盖核对')
        expect(draft).toContain('## 整体判断与推进顺序')
        expect(draft).toContain('./README.md#跨-plan-依赖与交接')
        expect(draft).toContain('../standards/testing.md')
        const metadata = JSON.parse(draft.match(/<!-- ignite-plan\s*([\s\S]*?)-->/)![1])
        expect(metadata.status).toBe('draft')
        expect(metadata.tasks.every((task: { status: string }) => task.status !== 'done')).toBe(
          true,
        )
        expect(metadata.evidence).toEqual([])
        expect(metadata.tdd_evidence).toEqual([])
        if (script === 'create-module.mjs') {
          const feature = read(fixture.root, 'docs/features/native-example.md')
          expect(feature).not.toContain('execution-focus.md')
          expect(feature).toContain('## 用户行为与边界')
          expect(feature).toContain('可观察结果')
          for (const name of readdirSync(join(fixture.root, 'docs/others/test-cases'))) {
            expect(read(fixture.root, `docs/others/test-cases/${name}`)).not.toContain(
              'execution-focus.md',
            )
          }
        }
      } finally {
        fixture.cleanup()
      }
    }
  })
})
