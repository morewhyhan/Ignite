import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { expect, it } from 'vitest'
import { commitAll, makeFixture, read, repositoryRoot, write } from './ignite-fixture'

function followRule(root: string, document: string, label: string, expected: string) {
  const link = read(root, document).match(new RegExp(`\\[${label}\\]\\(([^)]+)\\)`))
  expect(link, `${document} must link directly to ${label}`).not.toBeNull()
  const [path, anchor] = link![1].split('#')
  const target = resolve(root, dirname(document), path)
  expect(relative(root, target).replaceAll('\\', '/')).toBe(expected)
  expect(existsSync(target), `${label} must resolve to a real owner document`).toBe(true)
  const headings = readFileSync(target, 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^#{1,6} /.test(line))
    .map((line) =>
      line
        .replace(/^#+\s+/, '')
        .toLowerCase()
        .replace(/\s+/g, '-'),
    )
  expect(headings, `${label} must resolve to its actual section`).toContain(anchor)
}

it('[AC-EXECUTION-039] generates drafts whose professional rules resolve directly to their owners and coordination stays separate', () => {
  for (const script of ['create-change.mjs', 'create-module.mjs']) {
    const fixture = makeFixture()
    try {
      for (const path of [
        'AGENTS.md',
        'docs/features/README.md',
        'docs/plans/README.md',
        'docs/plans/_template.md',
        'docs/plans/releases/README.md',
        'docs/standards/testing.md',
        'docs/standards/workflow.md',
        'docs/others/test-cases/_template.md',
      ])
        write(fixture.root, path, read(repositoryRoot, path))
      commitAll(fixture.root, 'Prepare native professional rules and draft templates')
      const result = spawnSync(
        process.execPath,
        [join(repositoryRoot, 'scripts', script), 'ownership-example'],
        {
          cwd: fixture.root,
          encoding: 'utf8',
          windowsHide: true,
          env: { ...process.env, IGNITE_ROOT: fixture.root },
        },
      )
      expect(result.status, result.stderr || result.stdout).toBe(0)
      const filename = readdirSync(join(fixture.root, 'docs/plans')).find((name) =>
        name.endsWith('-ownership-example.md'),
      )!
      const plan = `docs/plans/${filename}`
      followRule(fixture.root, plan, '推进规则', 'docs/plans/README.md')
      followRule(fixture.root, plan, '接续与纠偏', 'docs/plans/README.md')
      followRule(fixture.root, plan, '完成条件', 'docs/plans/README.md')
      followRule(fixture.root, plan, '沟通规则', 'AGENTS.md')
      followRule(fixture.root, plan, '跨 Plan 协作', 'docs/standards/workflow.md')
      followRule(fixture.root, plan, '测试标准', 'docs/standards/testing.md')
      const metadata = JSON.parse(
        read(fixture.root, plan).match(/<!-- ignite-plan\s*([\s\S]*?)-->/)![1],
      )
      expect(metadata.status).toBe('draft')
      expect(metadata.tasks.every((task: { status: string }) => task.status !== 'done')).toBe(true)
      expect(metadata.evidence).toEqual([])
      expect(metadata.tdd_evidence).toEqual([])
      if (script === 'create-module.mjs') {
        followRule(
          fixture.root,
          'docs/features/ownership-example.md',
          '需求编写规则',
          'docs/features/README.md',
        )
      }
    } finally {
      fixture.cleanup()
    }
  }
})

it('[AC-EXECUTION-040] diagnoses and scaffolds a template without a standalone workflow while requiring native Plan rules', () => {
  for (const script of ['create-change.mjs', 'create-module.mjs']) {
    const fixture = makeFixture()
    try {
      for (const path of [
        'AGENTS.md',
        'docs/features/README.md',
        'docs/plans/README.md',
        'docs/plans/_template.md',
        'docs/plans/releases/README.md',
        'docs/standards/testing.md',
        'docs/others/test-cases/_template.md',
      ])
        write(fixture.root, path, read(repositoryRoot, path))
      write(
        fixture.root,
        'src/config/site.ts',
        "export const siteConfig = { name: 'Ignite', slug: 'ignite' }\n",
      )
      write(fixture.root, 'src/config/navigation.ts', 'export const navigation = []\n')
      const diagnose = () =>
        spawnSync(process.execPath, [join(repositoryRoot, 'scripts/template-doctor.mjs')], {
          cwd: fixture.root,
          encoding: 'utf8',
          windowsHide: true,
          env: { ...process.env, IGNITE_ROOT: fixture.root },
        })
      const diagnosis = diagnose()
      expect(diagnosis.status, diagnosis.stderr || diagnosis.stdout).toBe(0)

      rmSync(join(fixture.root, 'docs/plans/README.md'))
      const missingOwner = diagnose()
      expect(missingOwner.status).not.toBe(0)
      expect(missingOwner.stderr).toContain('Missing template baseline file: docs/plans/README.md')
      write(fixture.root, 'docs/plans/README.md', read(repositoryRoot, 'docs/plans/README.md'))
      commitAll(fixture.root, 'Prepare template with native rules and no standalone workflow')

      const generated = spawnSync(
        process.execPath,
        [join(repositoryRoot, 'scripts', script), 'native-coordination'],
        {
          cwd: fixture.root,
          encoding: 'utf8',
          windowsHide: true,
          env: { ...process.env, IGNITE_ROOT: fixture.root },
        },
      )
      expect(generated.status, generated.stderr || generated.stdout).toBe(0)
      const filename = readdirSync(join(fixture.root, 'docs/plans')).find((name) =>
        name.endsWith('-native-coordination.md'),
      )!
      followRule(fixture.root, `docs/plans/${filename}`, '跨 Plan 协作', 'docs/plans/README.md')
      followRule(
        fixture.root,
        'docs/plans/README.md',
        'Release 完成条件',
        'docs/plans/releases/README.md',
      )
      expect(existsSync(join(fixture.root, 'docs/standards/workflow.md'))).toBe(false)
    } finally {
      fixture.cleanup()
    }
  }
})
