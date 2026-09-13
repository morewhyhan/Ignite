import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

export const repositoryRoot = process.cwd()
export const cliPath = join(repositoryRoot, 'scripts', 'ignite.mjs')

export function write(root: string, path: string, content: string) {
  const absolutePath = join(root, path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content, 'utf8')
}

export function git(root: string, ...args: string[]) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true })
  if (result.status !== 0) throw new Error(result.stderr || result.stdout)
  return result.stdout.trim()
}

export function commitAll(root: string, message: string) {
  git(root, 'add', '.')
  git(
    root,
    '-c',
    'user.name=Ignite Test',
    '-c',
    'user.email=ignite@example.com',
    'commit',
    '-m',
    message,
  )
  return git(root, 'rev-parse', 'HEAD')
}

export function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), 'ignite-fixture-'))
  git(root, 'init')
  write(root, 'README.md', '# fixture\n')
  write(root, '.gitignore', '.ignite/\n')
  const baseCommit = commitAll(root, 'seed')

  write(
    root,
    'docs/features/product.md',
    `# Product

## 背景与目标

Fixture.

## 业务规则

- R1（REQ-TEST-001）：The execution result is current.

## 验收标准

- AC-TEST-001（REQ-TEST-001）：Given a Plan When it is validated Then stale evidence is rejected.
`,
  )
  write(
    root,
    'tests/contracts/sample.test.ts',
    `it('[AC-TEST-001] validates current evidence', () => {})\n`,
  )
  write(
    root,
    '.ai/runtime.json',
    `${JSON.stringify(
      {
        schema: 1,
        node: '24.19.0',
        package_manager: 'pnpm@9.11.0',
        preferred_environment: 'wsl-linux',
        supported_platforms: ['linux', 'win32'],
        supported_architectures: ['x64'],
        shared_node_modules_across_platforms: false,
      },
      null,
      2,
    )}\n`,
  )
  write(root, '.node-version', '24.19.0\n')
  write(root, '.gitattributes', '* text=auto eol=lf\n')
  write(root, '.editorconfig', 'root = true\n[*]\nend_of_line = lf\n')
  write(root, 'package.json', '{"packageManager":"pnpm@9.11.0"}\n')
  write(
    root,
    'docs/plans/fixture.md',
    planContent(baseCommit, {
      status: 'active',
      evidence: [],
      integrated_commit: null,
    }),
  )
  write(
    root,
    'docs/plans/releases/fixture-v1.json',
    `${JSON.stringify(
      {
        schema: 2,
        id: 'fixture-v1',
        plan_ids: ['IGT-900'],
        must_pass: ['check-integration', 'check-release'],
        excluded: [],
        updated_at: '2026-09-06',
      },
      null,
      2,
    )}\n`,
  )
  commitAll(root, 'fixture')
  return { root, baseCommit, cleanup: () => rmSync(root, { recursive: true, force: true }) }
}

export function planContent(baseCommit: string, overrides: Record<string, unknown> = {}) {
  const metadata = {
    schema: 2,
    id: 'IGT-900',
    release: 'fixture-v1',
    status: 'active',
    outcome: 'prove the execution contract',
    change_type: '存量改动',
    base_commit: baseCommit,
    requirements: ['REQ-TEST-001'],
    acceptance: [
      {
        id: 'AC-TEST-001',
        tests: ['tests/contracts/sample.test.ts::[AC-TEST-001]'],
      },
    ],
    depends_on: [],
    owner: 'fixture',
    risk: 'infrastructure',
    write_scope: [
      'README.md',
      'docs/',
      'tests/',
      '.ai/',
      '.node-version',
      '.gitattributes',
      '.editorconfig',
      'package.json',
    ],
    required_evidence: ['check-integration', 'check-release'],
    evidence: [],
    blocker: null,
    open_questions: [],
    integrated_commit: null,
    updated_at: '2026-09-06',
    ...overrides,
  }
  return `<!-- ignite-plan\n${JSON.stringify(metadata, null, 2)}\n-->\n\n# Fixture Plan\n`
}

export function runCli(root: string, ...args: string[]) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      APP_ENV: 'test',
      IGNITE_ROOT: root,
      IGNITE_SKIP_RUNTIME_CHECK: 'true',
    },
    windowsHide: true,
  })
}

export function read(root: string, path: string) {
  return readFileSync(join(root, path), 'utf8')
}
