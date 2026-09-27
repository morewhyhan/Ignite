import { existsSync } from 'node:fs'
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

describe('first-entry workflow', () => {
  it('[AC-EXECUTION-014] rewrites links to archived Plans so adopted docs remain valid', () => {
    const fixture = makeFixture()
    try {
      const inheritedPlan = planContent('f'.repeat(40))
      write(fixture.root, 'docs/plans/fixture.md', inheritedPlan)
      write(
        fixture.root,
        'docs/features/product.md',
        `${read(fixture.root, 'docs/features/product.md')}\n- 状态：\`template-baseline\`\n`,
      )
      write(
        fixture.root,
        'docs/others/test-cases/fixture.md',
        '[Plan](../../plans/fixture.md?view=full#acceptance)\n',
      )
      const commit = commitAll(fixture.root, 'new template history with linked Plan')

      const adopted = runCli(fixture.root, 'adopt-history', '--apply')
      expect(adopted.status, adopted.stderr).toBe(0)
      const expectedArchive = `docs/others/template-history/${commit}/docs/plans/fixture.md.txt`
      expect(read(fixture.root, 'docs/others/test-cases/fixture.md')).toContain(
        `../template-history/${commit}/docs/plans/fixture.md.txt?view=full#acceptance`,
      )
      expect(read(fixture.root, expectedArchive)).toBe(inheritedPlan)
      expect(existsSync(join(fixture.root, expectedArchive))).toBe(true)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-016] keeps first-entry status guidance concise', () => {
    const onboarding = [
      read(repositoryRoot, 'AGENTS.md'),
      read(repositoryRoot, 'docs/standards/workflow.md'),
      read(repositoryRoot, 'README.md'),
    ].join('\n')
    expect(onboarding).toContain('pnpm ignite status')
    expect(onboarding).toMatch(/只有需要[^\n]*才[^\n]*`pnpm ignite status --json`/)
    expect(onboarding).not.toMatch(/先运行 `pnpm ignite status --json`/)
  })

  it('[AC-EXECUTION-025] installs dependencies before new-history adoption commands', () => {
    const adoption = read(repositoryRoot, 'docs/standards/adoption.md')
    const steps = [
      'corepack pnpm install --frozen-lockfile',
      'pnpm runtime:check',
      'pnpm template:doctor',
      'pnpm ignite adopt-history` 预览',
      'pnpm ignite adopt-history --apply',
      'pnpm db:setup',
      'pnpm verify',
      'pnpm test:e2e:production',
    ].map((step) => adoption.indexOf(step))

    expect(steps.every((step) => step >= 0)).toBe(true)
    expect(steps).toEqual([...steps].sort((left, right) => left - right))
  })
})
