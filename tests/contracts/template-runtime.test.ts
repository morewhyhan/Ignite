import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateRuntimeContract } from '../../scripts/ignite/governance.mjs'
import {
  commitAll,
  git,
  makeFixture,
  planContent,
  read,
  repositoryRoot,
  runCli,
  write,
} from './ignite-fixture'

const templateDoctor = join(repositoryRoot, 'scripts', 'template-doctor.mjs')
const runtimeDoctor = join(repositoryRoot, 'scripts', 'runtime-doctor.mjs')
const createModule = join(repositoryRoot, 'scripts', 'create-module.mjs')

function prepareScaffoldTemplate(root: string) {
  write(root, 'docs/plans/_template.md', read(repositoryRoot, 'docs/plans/_template.md'))
}

describe('template and runtime contracts', () => {
  it('[AC-PRODUCT-009] previews and preserves inherited history before starting a new project Plan', () => {
    const fixture = makeFixture()
    try {
      prepareScaffoldTemplate(fixture.root)
      const originalPlan = planContent('f'.repeat(40))
      write(fixture.root, 'docs/plans/fixture.md', originalPlan)
      write(
        fixture.root,
        'docs/features/product.md',
        `${read(fixture.root, 'docs/features/product.md')}\n- 状态：\`template-baseline\`\n`,
      )
      commitAll(fixture.root, 'new template repository')
      const preview = runCli(fixture.root, 'adopt-history')
      expect(preview.status, preview.stderr).toBe(0)
      expect(JSON.parse(preview.stdout).status).toBe('preview')
      expect(read(fixture.root, 'docs/plans/fixture.md')).toBe(originalPlan)
      const adopted = runCli(fixture.root, 'adopt-history', '--apply')
      expect(adopted.status, adopted.stderr).toBe(0)
      const result = JSON.parse(adopted.stdout) as {
        status: string
        files: { source: string; archive: string }[]
      }
      expect(result.status).toBe('archived')
      const archivedPlan = result.files.find((item) => item.source === 'docs/plans/fixture.md')!
      expect(read(fixture.root, archivedPlan.archive)).toBe(originalPlan)
      expect(existsSync(join(fixture.root, 'docs/plans/fixture.md'))).toBe(false)
      expect(runCli(fixture.root, 'plan', 'validate').status).toBe(0)
      expect(JSON.parse(runCli(fixture.root, 'adopt-history', '--apply').stdout).status).toBe(
        'unchanged',
      )
      const scaffold = spawnSync(process.execPath, [createModule, 'invoices'], {
        cwd: fixture.root,
        encoding: 'utf8',
        env: { ...process.env, IGNITE_ROOT: fixture.root },
        windowsHide: true,
      })
      expect(scaffold.status, scaffold.stderr).toBe(0)
      const generatedPlan = readdirSync(join(fixture.root, 'docs/plans')).find((name) =>
        name.endsWith('-invoices.md'),
      )!
      const generatedId = read(fixture.root, `docs/plans/${generatedPlan}`).match(
        /"id": "(IGT-\d+)"/,
      )?.[1]
      const validation = runCli(fixture.root, 'plan', 'validate', generatedId!)
      expect(validation.status, validation.stderr).toBe(0)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-001] keeps a fresh template self-diagnosing and executable', () => {
    const result = spawnSync(process.execPath, [templateDoctor], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      windowsHide: true,
    })
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('Template doctor passed')
    const packageJson = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    expect(packageJson.scripts).toMatchObject({
      'db:setup': expect.any(String),
      dev: expect.any(String),
      ignite: expect.any(String),
      'test:migrations': expect.any(String),
    })
  })

  it('[AC-PRODUCT-002] refuses an adopted project that keeps shared template identity', () => {
    const root = mkdtempSync(join(tmpdir(), 'ignite-adoption-'))
    try {
      write(root, 'docs/features/product.md', '# Product\n\n- 状态：`adopted`\n')
      write(root, 'src/config/site.ts', "export const site = { name: 'Ignite', slug: 'ignite' }\n")
      write(root, 'package.json', '{"name":"ignite"}\n')
      for (const path of [
        'AGENTS.md',
        'docs/standards/workflow.md',
        'docs/plans/_template.md',
        'src/config/navigation.ts',
      ]) {
        write(root, path, `${path}\n`)
      }
      const result = spawnSync(process.execPath, [templateDoctor], {
        cwd: root,
        encoding: 'utf8',
        windowsHide: true,
      })
      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('still uses package name "ignite"')
      expect(result.stderr).toContain('shared Ignite cookie prefix')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it.each([null, 'fixture-v1'])(
    '[AC-PRODUCT-003] [AC-EXECUTION-009] scaffolds a complete red slice with release %s',
    (releaseId) => {
      const fixture = makeFixture()
      try {
        prepareScaffoldTemplate(fixture.root)
        if (releaseId) {
          const releasePath = `docs/plans/releases/${releaseId}.json`
          const release = JSON.parse(read(fixture.root, releasePath))
          release.coverage_version = 1
          release.scope = [
            {
              id: 'GOAL-001',
              text: 'Validate the fixture execution result',
              source: 'Fixture requirement',
              requirements: ['REQ-TEST-001'],
              plan_ids: ['IGT-900'],
              disposition: 'included',
            },
          ]
          write(fixture.root, releasePath, JSON.stringify(release))
        }
        const result = spawnSync(
          process.execPath,
          [createModule, 'invoices', ...(releaseId ? ['--release', releaseId] : [])],
          {
            cwd: fixture.root,
            encoding: 'utf8',
            env: { ...process.env, IGNITE_ROOT: fixture.root },
            windowsHide: true,
          },
        )
        expect(result.status, result.stderr).toBe(0)
        for (const path of [
          'src/modules/invoices/components/invoices-screen.tsx',
          'src/modules/invoices/index.ts',
          'docs/features/invoices.md',
          'tests/contracts/invoices.test.ts',
          'tests/e2e/invoices.spec.ts',
        ]) {
          expect(existsSync(join(fixture.root, path)), path).toBe(true)
        }
        expect(
          readdirSync(join(fixture.root, 'docs/plans')).some((name) =>
            name.endsWith('-invoices.md'),
          ),
        ).toBe(true)
        expect(read(fixture.root, 'tests/contracts/invoices.test.ts')).toContain(
          '[AC-INVOICES-001]',
        )
        expect(read(fixture.root, 'tests/e2e/invoices.spec.ts')).toContain('[AC-INVOICES-001]')
        expect(read(fixture.root, 'tests/e2e/invoices.spec.ts')).toContain('throw new Error(')
        const release = JSON.parse(
          read(fixture.root, `docs/plans/releases/${releaseId || 'invoices-v1'}.json`),
        ) as {
          plan_ids: string[]
          status?: string
        }
        const generatedPlan = readdirSync(join(fixture.root, 'docs/plans')).find((name) =>
          name.endsWith('-invoices.md'),
        )!
        const planContent = read(fixture.root, `docs/plans/${generatedPlan}`)
        const metadata = JSON.parse(planContent.match(/<!-- ignite-plan\s*([\s\S]*?)\s*-->/)![1])
        const generatedId = metadata.id
        expect(generatedId).toMatch(/^IGT-\d{3,}$/)
        expect(planContent).toContain('## 原始目标与覆盖核对')
        expect(planContent).toContain('T1 · 确认目标、输入输出和验收场景 · todo')
        expect(metadata).toMatchObject({
          status: 'draft',
          verification_requirements: ['unit', 'browser'],
          evidence: [],
          acceptance: [
            {
              required_layers: ['unit', 'browser'],
              checks: [
                { test: 'tests/contracts/invoices.test.ts::[AC-INVOICES-001]', layer: 'unit' },
                { test: 'tests/e2e/invoices.spec.ts::[AC-INVOICES-001]', layer: 'browser' },
              ],
            },
          ],
        })
        expect(metadata.write_scope).toContain('tests/e2e/invoices.spec.ts')
        expect(result.stdout).toContain('pnpm ignite status --write')
        expect(release.plan_ids).toContain(generatedId)
        expect(release).not.toHaveProperty('status')
      } finally {
        fixture.cleanup()
      }
    },
  )

  it('[AC-PRODUCT-003] previews a module without creating files or changing an existing release', () => {
    const fixture = makeFixture()
    try {
      prepareScaffoldTemplate(fixture.root)
      const releasePath = 'docs/plans/releases/preview-v1.json'
      write(
        fixture.root,
        releasePath,
        JSON.stringify({ schema: 2, id: 'preview-v1', plan_ids: [] }),
      )
      const originalRelease = read(fixture.root, releasePath)
      const originalStatus = git(fixture.root, 'status', '--short', '--untracked-files=all')
      const result = spawnSync(
        process.execPath,
        [createModule, '--dry-run', 'invoices', '--release', 'preview-v1'],
        {
          cwd: fixture.root,
          encoding: 'utf8',
          env: { ...process.env, IGNITE_ROOT: fixture.root },
          windowsHide: true,
        },
      )
      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout).toContain('tests/e2e/invoices.spec.ts')
      expect(result.stdout).toContain('Preview only')
      expect(result.stdout).not.toContain('already includes')
      expect(read(fixture.root, releasePath)).toBe(originalRelease)
      expect(git(fixture.root, 'status', '--short', '--untracked-files=all')).toBe(originalStatus)
      expect(existsSync(join(fixture.root, 'src/modules/invoices'))).toBe(false)
    } finally {
      fixture.cleanup()
    }
  })

  it.each([
    ['invoices', '--release'],
    ['invoices', '--unknown'],
    ['invoices', 'extra'],
  ])('[AC-PRODUCT-003] rejects invalid scaffold arguments %j without writing', (...arguments_) => {
    const fixture = makeFixture()
    try {
      const originalStatus = git(fixture.root, 'status', '--short', '--untracked-files=all')
      const result = spawnSync(process.execPath, [createModule, ...arguments_], {
        cwd: fixture.root,
        encoding: 'utf8',
        env: { ...process.env, IGNITE_ROOT: fixture.root },
        windowsHide: true,
      })
      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('Usage:')
      expect(git(fixture.root, 'status', '--short', '--untracked-files=all')).toBe(originalStatus)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-009] rejects a dependency tree installed on another platform', () => {
    const root = mkdtempSync(join(tmpdir(), 'ignite-runtime-'))
    try {
      const pnpm = spawnSync('corepack', ['pnpm', '--version'], {
        cwd: repositoryRoot,
        encoding: 'utf8',
        windowsHide: true,
      })
      const pnpmVersion = pnpm.status === 0 ? pnpm.stdout.trim() : 'unavailable'
      write(
        root,
        '.ai/runtime.json',
        `${JSON.stringify({
          schema: 1,
          node: process.versions.node,
          package_manager: `pnpm@${pnpmVersion}`,
          supported_platforms: ['linux', 'win32'],
          supported_architectures: [process.arch],
        })}\n`,
      )
      write(
        root,
        'node_modules/.ignite-platform.json',
        `${JSON.stringify({
          schema: 1,
          platform: process.platform === 'win32' ? 'linux' : 'win32',
          arch: process.arch,
          node: process.versions.node,
          pnpm: pnpmVersion,
          host_id: 'fixture',
        })}\n`,
      )
      const result = spawnSync(process.execPath, [runtimeDoctor], {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, IGNITE_ROOT: root },
        windowsHide: true,
      })
      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('node_modules was installed for')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('[AC-PRODUCT-009] never records a marker when the runtime contract fails', () => {
    const root = mkdtempSync(join(tmpdir(), 'ignite-runtime-record-'))
    try {
      write(
        root,
        '.ai/runtime.json',
        `${JSON.stringify({
          schema: 1,
          node: '0.0.0',
          package_manager: 'pnpm@0.0.0',
          supported_platforms: [process.platform],
          supported_architectures: [process.arch],
        })}\n`,
      )
      const result = spawnSync(process.execPath, [runtimeDoctor, '--record'], {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, IGNITE_ROOT: root },
        windowsHide: true,
      })
      expect(result.status).not.toBe(0)
      expect(existsSync(join(root, 'node_modules/.ignite-platform.json'))).toBe(false)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('[AC-PRODUCT-009] keeps all runtime truth files mutually consistent', () => {
    expect(validateRuntimeContract()).toEqual([])
  })
})
