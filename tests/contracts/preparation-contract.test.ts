import { cpSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { expect, it } from 'vitest'
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

const template = readFileSync(join(repositoryRoot, 'docs/plans/_template.md'), 'utf8')
const body = [...template.matchAll(/^## .+$/gm)]
  .map(([heading]) => `${heading}\n\nConcrete preparation details.\n`)
  .join('\n')
const ref = 'tests/api/future.test.ts::[AC-TEST-001]'
const contract = {
  status: 'draft',
  contract_version: 2,
  execution_contract: 1,
  task_contract: 1,
  verification_contract: 2,
  goals: [{ text: 'Prepare an isolated resource', requirements: ['REQ-TEST-001'] }],
  constraints: ['No implementation in this turn'],
  non_goals: ['External services'],
  authorization: { source: 'User requested this change' },
  deliverables: ['Resource'],
  remaining_work: [],
  acceptance: [
    {
      id: 'AC-TEST-001',
      tests: [ref],
      required_layers: ['database'],
      checks: [{ test: ref, layer: 'database' }],
    },
  ],
  verification_requirements: ['database'],
  tasks: [
    { id: 'P', title: 'Prepare', phase: 'prepare', status: 'done' },
    { id: 'R', title: 'Red', phase: 'red', acceptance: ['AC-TEST-001'], status: 'todo' },
    {
      id: 'I',
      title: 'Implement',
      phase: 'implement',
      acceptance: ['AC-TEST-001'],
      status: 'todo',
    },
    { id: 'V', title: 'Verify', phase: 'verify', status: 'todo' },
  ],
  dependency_contracts: [],
  shared_files: [],
  handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
  write_scope: ['src/server/api/routes/resource/', 'docs/', 'tests/'],
  data_contract: {
    access_scope: 'per-user',
    access_rationale: 'Session ownership',
    migration_impact: 'additive',
    rollback: 'Revert the module',
    destructive_authorization: null,
  },
  required_evidence: ['check-integration'],
  tdd_evidence: [],
}
function seed() {
  const fixture = makeFixture()
  write(fixture.root, 'docs/plans/_template.md', template)
  const content = planContent(fixture.baseCommit, contract) + body
  write(fixture.root, 'docs/plans/fixture.md', content)
  write(
    fixture.root,
    'docs/plans/releases/fixture-v1.json',
    JSON.stringify({
      schema: 2,
      id: 'fixture-v1',
      coverage_version: 2,
      verification_contract: 2,
      plan_ids: ['IGT-900'],
      scope: [
        {
          id: 'GOAL-1',
          text: 'Prepare an isolated resource',
          source: 'User request',
          requirements: ['REQ-TEST-001'],
          acceptance: ['AC-TEST-001'],
          plan_ids: ['IGT-900'],
          disposition: 'included',
          reason: '',
          authorization: '',
        },
      ],
      must_pass: ['check-release'],
      evidence: [],
      integrated_commit: null,
      excluded: [],
      updated_at: '2026-09-06',
    }),
  )
  return fixture
}

function preparedFixture() {
  const fixture = seed()
  write(fixture.root, 'src/config/site.ts', "export const name = 'Ignite'\n")
  const base = commitAll(fixture.root, 'preparation baseline')
  const test = 'tests/contracts/sample.test.ts::[AC-TEST-001]'
  write(
    fixture.root,
    'docs/plans/fixture.md',
    planContent(base, {
      ...contract,
      task_contract: 2,
      acceptance: [
        {
          id: 'AC-TEST-001',
          tests: [test],
          required_layers: ['unit'],
          checks: [{ test, layer: 'unit' }],
        },
      ],
      verification_requirements: ['unit'],
      write_scope: ['src/config/site.ts', 'docs/', 'tests/'],
    }) + body,
  )
  return fixture
}

it('[AC-PREP-001] rejects premature branding changes including staged changes without mutating preparation documents', () => {
  const fixture = preparedFixture()
  try {
    const valid = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(valid.status, valid.stdout + valid.stderr).toBe(0)
    expect(JSON.parse(valid.stdout).ready).toBe(true)
    const before = read(fixture.root, 'docs/plans/fixture.md')
    write(fixture.root, 'src/config/site.ts', "export const name = 'Students'\n")
    git(fixture.root, 'add', 'src/config/site.ts')
    write(fixture.root, 'src/config/site.ts', "export const name = 'Ignite'\n")
    const invalid = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(invalid.status).not.toBe(0)
    expect(invalid.stdout + invalid.stderr).toContain('src/config/site.ts')
    expect(invalid.stdout + invalid.stderr).toContain('before the first valid red')
    expect(read(fixture.root, 'docs/plans/fixture.md')).toBe(before)
  } finally {
    fixture.cleanup()
  }
})

it('[AC-PREP-002] accepts one behavior covering two goals while rejecting contradictory dispositions', () => {
  const fixture = seed()
  try {
    const release = JSON.parse(read(fixture.root, 'docs/plans/releases/fixture-v1.json'))
    release.scope.push({ ...release.scope[0], id: 'GOAL-2', text: 'Preserve data after refresh' })
    write(fixture.root, 'docs/plans/releases/fixture-v1.json', JSON.stringify(release))
    const valid = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(valid.status, valid.stdout + valid.stderr).toBe(0)
    release.scope[1].disposition = 'deferred'
    release.scope[1].plan_ids = []
    release.scope[1].reason = 'External condition not available'
    write(fixture.root, 'docs/plans/releases/fixture-v1.json', JSON.stringify(release))
    const invalid = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(invalid.status).not.toBe(0)
    expect(invalid.stdout + invalid.stderr).toContain('conflicting Release scope')
  } finally {
    fixture.cleanup()
  }
})

it('[AC-METHOD-007] rejects missing exact Plan sections and missing Release before a state transition without mutating the draft', () => {
  const fixture = seed()
  try {
    const original = read(fixture.root, 'docs/plans/fixture.md')
    write(
      fixture.root,
      'docs/plans/fixture.md',
      original.replace('## 状态\n', '') + '\n```md\n## 状态\n```\n',
    )
    const invalid = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
    expect(invalid.status).not.toBe(0)
    expect(invalid.stderr).toContain('## 状态')
    write(
      fixture.root,
      'docs/plans/fixture.md',
      planContent(fixture.baseCommit, { status: 'draft' }) + body,
    )
    rmSync(join(fixture.root, 'docs/plans/releases/fixture-v1.json'))
    const before = read(fixture.root, 'docs/plans/fixture.md')
    const transition = runCli(fixture.root, 'plan', 'set-status', 'IGT-900', 'ready')
    expect(transition.status).not.toBe(0)
    expect(transition.stderr).toContain('missing release')
    expect(read(fixture.root, 'docs/plans/fixture.md')).toBe(before)
  } finally {
    fixture.cleanup()
  }
})

it('[AC-METHOD-008] validates preparation and complete scope without claiming future tests or accepting undecided data contracts', () => {
  const fixture = seed()
  try {
    const before = read(fixture.root, 'docs/plans/fixture.md')
    const result = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toMatch(/^\s*\{/)
    const value = JSON.parse(result.stdout)
    expect(value.status).toBe('prepared')
    expect(value.ready).toBe(false)
    expect(value.pending_tests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ acceptance_id: 'AC-TEST-001', test: ref }),
      ]),
    )
    expect(read(fixture.root, 'docs/plans/fixture.md')).toBe(before)
    write(
      fixture.root,
      'docs/features/product.md',
      read(fixture.root, 'docs/features/product.md') +
        '\n- AC-TEST-002（REQ-TEST-001）：Given an owner When reading Then ownership is preserved.\n',
    )
    const omitted = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(omitted.status).not.toBe(0)
    expect(omitted.stdout + omitted.stderr).toContain('AC-TEST-002')
    write(
      fixture.root,
      'docs/plans/fixture.md',
      planContent(fixture.baseCommit, {
        ...contract,
        data_contract: { ...contract.data_contract, access_scope: '每个用户' },
      }) + body,
    )
    const data = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(data.status).not.toBe(0)
    expect(data.stdout + data.stderr).toContain('data_contract.access_scope')
    const next = runCli(fixture.root, 'next', '--plan', 'IGT-900')
    expect(next.stdout).not.toContain('plan set-status IGT-900 ready')
  } finally {
    fixture.cleanup()
  }
})

it('[AC-METHOD-009] returns mandatory unnumbered owner instructions while retaining conditional method boundaries', () => {
  const fixture = makeFixture()
  try {
    write(
      fixture.root,
      'docs/plans/README.md',
      '# Plan\n\n## 固定维护方法\n\nDrafts must preserve all mandatory sections.\n\n涉及本类文档时，先读取以下必需方法：[plan-method](../../.ai/pstack/skills/plan-method/SKILL.md)。\n\n1. Run the native preparation check and correct its findings.\n\n### 条件方法\n\nOnly conditionally read [optional](../../.ai/pstack/skills/optional/SKILL.md).\n',
    )
    write(
      fixture.root,
      'docs/standards/ai-agents.md',
      '# Rules\n\n## 固定维护方法\n\n涉及文档写作时，必须读取 [technical-writing](../../.ai/pstack/skills/technical-writing/SKILL.md) 与 [unslop](../../.ai/pstack/skills/unslop/SKILL.md)。\n',
    )
    for (const name of ['plan-method', 'technical-writing', 'unslop', 'optional'])
      write(fixture.root, `.ai/pstack/skills/${name}/SKILL.md`, `# ${name}\nBody ${name}.\n`)
    const result = runCli(fixture.root, 'skill', 'read', '--for', 'docs/plans/README.md')
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('Drafts must preserve all mandatory sections.')
    expect(result.stdout).not.toContain('optional/SKILL.md')
    expect(result.stdout).not.toContain('Body optional.')
  } finally {
    fixture.cleanup()
  }
})

it('[AC-METHOD-010] reports runtime mismatch before CLI work and reads project methods from a dependency-free checkout', () => {
  const fixture = makeFixture()
  try {
    write(fixture.root, '.ai/runtime.json', JSON.stringify({ node: '0.0.0' }))
    const env = { ...process.env, IGNITE_ROOT: fixture.root, IGNITE_SKIP_RUNTIME_CHECK: 'false' }
    const mismatch = spawnSync(
      process.execPath,
      [join(repositoryRoot, 'scripts/ignite.mjs'), 'plan', 'validate', 'IGT-900'],
      { encoding: 'utf8', env },
    )
    expect(mismatch.status).not.toBe(0)
    expect(mismatch.stderr).toContain('Node 0.0.0 is required')
    expect(mismatch.stderr).toContain('nvm use 0.0.0')
    cpSync(join(repositoryRoot, 'scripts'), join(fixture.root, 'scripts'), { recursive: true })
    write(fixture.root, '.ai/runtime.json', JSON.stringify({ node: process.versions.node }))
    write(fixture.root, '.ai/pstack/skills/example/SKILL.md', '# Example\nReal project method.\n')
    const local = spawnSync(
      process.execPath,
      [join(fixture.root, 'scripts/ignite.mjs'), 'skill', 'read', 'example'],
      { encoding: 'utf8', env },
    )
    expect(local.status, local.stderr).toBe(0)
    expect(local.stdout).toContain('Real project method.')
  } finally {
    fixture.cleanup()
  }
})

it('[AC-METHOD-011] scaffolds only Feature Plan and Release when the user authorizes preparation without code or tests', () => {
  const fixture = makeFixture()
  try {
    for (const path of [
      'docs/plans/_template.md',
      'docs/features/_template.md',
      'docs/others/test-cases/_template.md',
    ])
      write(fixture.root, path, readFileSync(join(repositoryRoot, path), 'utf8'))
    commitAll(fixture.root, 'prepare scaffold templates')
    const result = spawnSync(
      process.execPath,
      [join(repositoryRoot, 'scripts/create-module.mjs'), 'students', '--docs-only'],
      { cwd: fixture.root, encoding: 'utf8', env: { ...process.env, IGNITE_ROOT: fixture.root } },
    )
    expect(result.status, result.stderr).toBe(0)
    const files = spawnSync('git', ['ls-files', '--others', '--exclude-standard'], {
      cwd: fixture.root,
      encoding: 'utf8',
    })
      .stdout.trim()
      .split('\n')
    expect(
      files.every((path) => path.startsWith('docs/features/') || path.startsWith('docs/plans/')),
    ).toBe(true)
    expect(files.some((path) => path === 'docs/features/students.md')).toBe(true)
    const planPath = files.find((path) => /docs\/plans\/\d+-students\.md/.test(path))
    expect(planPath).toBeDefined()
    const content = read(fixture.root, planPath || '')
    expect(content).toContain('## 准出条件')
    expect(content).toMatch(/"id": "IGT-\d+"/)
    expect(content).toContain('"status": "draft"')
    expect(content).toContain('"evidence": []')
  } finally {
    fixture.cleanup()
  }
})
