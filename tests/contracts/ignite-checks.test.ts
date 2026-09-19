import { describe, expect, it } from 'vitest'
import { isExecutionStatePath } from '../../scripts/ignite/core.mjs'
import {
  commandsForLevel,
  minimumLevel,
  planCheck,
  resolveLevel,
} from '../../scripts/ignite/checks.mjs'
import { extractPlanMetadata } from '../../scripts/ignite/state.mjs'
import { makeFixture, planContent, runCli, write } from './ignite-fixture'

const plan = {
  metadata: extractPlanMetadata(planContent('0'.repeat(40)))!.value,
}

describe('Ignite risk-derived checks', () => {
  it('[AC-PRODUCT-006] preserves old command policies and includes mapped tests in new checks', () => {
    const files = ['src/modules/tasks/hooks/use-tasks.ts']
    const current = commandsForLevel('integration', files, plan, 2)
    const historical = commandsForLevel('integration', files, plan, 1)
    expect(current.find((command) => command.label === 'targeted-tests')?.args).toContain(
      'tests/contracts/sample.test.ts',
    )
    expect(historical.find((command) => command.label === 'targeted-tests')?.args).not.toContain(
      'tests/contracts/sample.test.ts',
    )
    expect(() => commandsForLevel('integration', files, plan, 999)).toThrow('unknown check policy')
  })

  it('[AC-PRODUCT-013] selects existing module tests and falls back for an unrecognized module', () => {
    const selected = commandsForLevel('integration', ['src/server/api/routes/tasks/index.ts'], plan)
    expect(selected.find((entry) => entry.label === 'targeted-tests')?.args).toContain(
      'tests/api/tasks.test.ts',
    )

    const unknown = commandsForLevel('integration', ['src/modules/unmapped/screen.tsx'], plan)
    expect(unknown.find((entry) => entry.label === 'tests')?.args).toEqual(['pnpm', 'test'])
  })

  it('[AC-PRODUCT-006] classifies contract and implementation changes as integration risk', () => {
    for (const path of [
      'src/modules/tasks/hooks/use-tasks.ts',
      'src/app/globals.css',
      'docs/designs/api.yaml',
      'docs/others/adr/0001-example.md',
      'prisma/schema.prisma',
      'scripts/ignite.mjs',
      'tests/api/tasks.test.ts',
    ]) {
      expect(minimumLevel([path]), path).toBe('integration')
    }
    expect(minimumLevel(['README.md'])).toBe('dev')
    expect(minimumLevel(['README.md'], 'infrastructure')).toBe('integration')
    expect(() => resolveLevel('dev', ['src/app/globals.css'])).toThrow('cannot lower check level')
  })

  it('[AC-PRODUCT-006] uses the Plan baseline and forbids file omission in a real run', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'README.md', '# changed after baseline\n')
      const result = runCli(fixture.root, 'check', '--plan', 'IGT-900', '--dry-run')
      expect(result.status, result.stderr).toBe(0)
      const files = JSON.parse(result.stdout).changed_files
      expect(files).toContain('README.md')
      expect(files).toContain('docs/features/product.md')
    } finally {
      fixture.cleanup()
    }
    expect(() =>
      planCheck({
        plan,
        requestedLevel: 'dev',
        explicitFiles: ['README.md'],
        dryRun: false,
      }),
    ).toThrow('--files is only available with --dry-run')
    expect(
      planCheck({
        plan,
        requestedLevel: 'auto',
        explicitFiles: ['README.md'],
        dryRun: true,
      }).level,
    ).toBe('integration')
    expect(() =>
      planCheck({
        plan: { ...plan, metadata: { ...plan.metadata, risk: 'docs' } },
        requestedLevel: 'auto',
        explicitFiles: ['docs/features/product.md'],
        dryRun: true,
      }),
    ).toThrow('Plan risk docs understates the actual changes')
  })

  it('keeps diff validation in every level and production E2E in release', () => {
    for (const path of [
      'scripts/test-migrations.mjs',
      'scripts/testing/database-adapter.mjs',
      'scripts/testing/migration-probe.mjs',
    ]) {
      expect(commandsForLevel('integration', [path], plan)).toEqual(
        expect.arrayContaining([expect.objectContaining({ label: 'migrations' })]),
      )
      expect(
        commandsForLevel('integration', [path], plan, 3).some(
          (command) => command.label === 'migrations',
        ),
      ).toBe(false)
    }
    for (const level of ['dev', 'integration', 'release']) {
      const commands = commandsForLevel(level, ['README.md'], plan)
      expect(commands[0]).toMatchObject({ command: 'node', label: 'git-diff' })
    }
    expect(commandsForLevel('release', ['README.md'], plan)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'build' }),
        expect.objectContaining({ label: 'e2e-production' }),
      ]),
    )
    expect(commandsForLevel('release', ['README.md'], plan, 2)).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: 'verify' })]),
    )
    expect(commandsForLevel('integration', ['README.md'], plan)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'template-doctor' }),
        expect.objectContaining({ label: 'governance' }),
        expect.objectContaining({ label: 'format' }),
      ]),
    )
  })

  it('[AC-PRODUCT-006] includes Plan rules in execution inputs while excluding state records', () => {
    for (const path of [
      'docs/plans/README.md',
      'docs/plans/_template.md',
      'docs/plans/releases/_template.json',
    ]) {
      expect(isExecutionStatePath(path), path).toBe(false)
      expect(minimumLevel([path]), path).toBe('integration')
    }
    for (const path of [
      'docs/plans/20260913-example.md',
      'docs/plans/releases/example-v1.json',
      'docs/others/ignite-status.md',
    ]) {
      expect(isExecutionStatePath(path), path).toBe(true)
    }
  })
})
