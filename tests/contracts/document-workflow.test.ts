import { cpSync, existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { expect, it } from 'vitest'
import {
  commitAll,
  makeFixture,
  planContent,
  read,
  repositoryRoot,
  runCli,
  write,
} from './ignite-fixture'

function runScript(root: string, script: string, ...args: string[]) {
  return spawnSync(process.execPath, [join(repositoryRoot, 'scripts', script), ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, IGNITE_ROOT: root },
    windowsHide: true,
  })
}

function generatedPlan(root: string, slug: string) {
  const planFile = readdirSync(join(root, 'docs/plans')).find((name) =>
    new RegExp(`^\\d{8}-${slug}\\.md$`).test(name),
  )
  expect(planFile, `create script did not write a Plan for ${slug}`).toBeDefined()
  const content = read(root, `docs/plans/${planFile || ''}`)
  const metadata = content.match(/<!-- ignite-plan\s*([\s\S]*?)\s*-->/)?.[1]
  expect(metadata, 'generated Plan must contain structured metadata').toBeDefined()
  return JSON.parse(metadata || '{}')
}

function validReviewPlanFixture() {
  const fixture = makeFixture()
  const feature = `# Product

## 背景与目标

Fixture.

## 业务规则

- R1（REQ-TEST-001）：The execution result is current.

## 验收标准

- AC-TEST-001（REQ-TEST-001）：Given a Plan When it is validated Then stale evidence is rejected.
`
  write(fixture.root, 'docs/features/product.md', feature)
  const test = 'tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence'
  const body = `# Ignite 实施计划：review-fixture

## 状态

The metadata owns state.

## 目标

Validate independent review admission.

## 原始目标与覆盖核对

The fixture maps the user request to AC-TEST-001.

## 整体判断与推进顺序

The review gate is the behavior under test.

## 非目标

External services.

## 变更类型

存量改动。

## 输入规格

See docs/features/product.md.

## 已关闭问题

No open questions.

## 测试与验收设计

The test observes native preparation behavior.

## 实现任务

Tasks remain in metadata.

## 验收方式

Run the native CLI.

## 设计回写

No design change applies.

## 状态记录

The fixture starts as a draft.

## 准出条件

The current review must be approved.
`
  const metadata = {
    schema: 2,
    id: 'IGT-900',
    release: 'fixture-v1',
    status: 'draft',
    outcome: 'A current independent review is required before preparation.',
    change_type: '存量改动',
    base_commit: fixture.baseCommit,
    requirements: ['REQ-TEST-001'],
    acceptance: [
      {
        id: 'AC-TEST-001',
        tests: [test],
        required_layers: ['unit'],
        checks: [{ test, layer: 'unit' }],
      },
    ],
    goals: [{ text: 'Require current review', requirements: ['REQ-TEST-001'] }],
    constraints: ['Keep the existing fixture behavior.'],
    non_goals: ['External services.'],
    authorization: { source: 'Fixture user request.' },
    deliverables: ['A valid review gate.'],
    remaining_work: [],
    review_contract: 1,
    reviews: [],
    depends_on: [],
    owner: 'fixture-owner',
    risk: 'infrastructure',
    write_scope: ['docs/', 'tests/'],
    required_evidence: ['check-integration'],
    evidence: [],
    blocker: null,
    open_questions: [],
    integrated_commit: null,
    updated_at: '2026-10-11',
  }
  write(
    fixture.root,
    'docs/plans/fixture.md',
    `<!-- ignite-plan\n${JSON.stringify(metadata, null, 2)}\n-->\n\n${body}`,
  )
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
          text: 'Require a current independent review.',
          source: 'Fixture user request.',
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
      updated_at: '2026-10-11',
    }),
  )
  return fixture
}

it('[AC-DOCFLOW-001] scaffolds executable task detail', () => {
  const fixture = makeFixture()
  try {
    write(
      fixture.root,
      'docs/others/test-cases/_template.md',
      readFileSync(join(repositoryRoot, 'docs/others/test-cases/_template.md'), 'utf8'),
    )
    write(
      fixture.root,
      'docs/plans/_template.md',
      readFileSync(join(repositoryRoot, 'docs/plans/_template.md'), 'utf8'),
    )
    const change = runScript(fixture.root, 'create-change.mjs', 'sample-change')
    expect(change.status, change.stderr).toBe(0)
    commitAll(fixture.root, 'create the change Plan')
    const module = runScript(fixture.root, 'create-module.mjs', 'sample-modules', '--docs-only')
    expect(module.status, module.stderr).toBe(0)

    for (const metadata of [
      generatedPlan(fixture.root, 'sample-change'),
      generatedPlan(fixture.root, 'sample-modules'),
    ]) {
      expect(metadata).toMatchObject({ planning_contract: 1, review_contract: 1 })
      expect(metadata.tasks.length).toBeGreaterThan(0)
      for (const task of metadata.tasks) {
        expect(task.result?.trim()).toBeTruthy()
        expect(task.scope.length).toBeGreaterThan(0)
        expect(task.depends_on).toEqual(expect.any(Array))
        expect(task.owner?.trim()).toBeTruthy()
        for (const path of task.scope)
          expect(
            metadata.write_scope.some((root: string) => path === root || path.startsWith(root)),
          ).toBe(true)
      }
    }
  } finally {
    fixture.cleanup()
  }
})

it('[AC-DOCFLOW-002] rejects incomplete task contracts', () => {
  const fixture = makeFixture()
  try {
    const tasks = [
      {
        id: 'P',
        title: 'Complete preparation',
        phase: 'prepare',
        status: 'done',
        result: 'The behavior contract and tests are ready.',
        scope: ['docs/', 'tests/'],
        depends_on: [],
        owner: 'fixture-owner',
      },
      {
        id: 'T1',
        title: 'Establish the input',
        phase: 'prepare',
        status: 'todo',
        result: 'A committed input is available.',
        scope: ['docs/features/product.md'],
        depends_on: [],
        owner: 'fixture-owner',
      },
      {
        id: 'T2',
        title: 'Check the input',
        phase: 'prepare',
        status: 'todo',
        result: 'The input is checked.',
        scope: ['tests/contracts/sample.test.ts'],
        depends_on: ['T1'],
        owner: 'fixture-owner',
      },
    ]
    const phases = [
      {
        id: 'R',
        title: 'Record the behavior failure',
        phase: 'red',
        status: 'todo',
        acceptance: ['AC-TEST-001'],
        result: 'The target assertion fails for the missing behavior.',
        scope: ['tests/contracts/sample.test.ts'],
        depends_on: ['T2'],
        owner: 'fixture-owner',
      },
      {
        id: 'I',
        title: 'Implement the behavior',
        phase: 'implement',
        status: 'todo',
        acceptance: ['AC-TEST-001'],
        result: 'The target assertion passes.',
        scope: ['scripts/ignite/'],
        depends_on: ['R'],
        owner: 'fixture-owner',
      },
      {
        id: 'V',
        title: 'Verify the behavior',
        phase: 'verify',
        status: 'todo',
        result: 'The matching integration check passes.',
        scope: ['tests/contracts/sample.test.ts'],
        depends_on: ['I'],
        owner: 'fixture-owner',
      },
    ]
    const writePlan = (nextTasks: unknown[]) =>
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          status: 'active',
          execution_contract: 1,
          task_contract: 2,
          verification_contract: 2,
          planning_contract: 1,
          owner: 'fixture-owner',
          tasks: nextTasks,
          acceptance: [
            {
              id: 'AC-TEST-001',
              tests: ['tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence'],
              required_layers: ['unit'],
              checks: [
                {
                  test: 'tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence',
                  layer: 'unit',
                },
              ],
            },
          ],
          write_scope: ['scripts/ignite/', 'docs/', 'tests/'],
        }),
      )
    const complete = [...tasks, ...phases]
    writePlan(complete)
    const early = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'T2', 'doing')
    expect(early.status).not.toBe(0)
    expect(early.stderr + early.stdout).toMatch(/T2|T1|depend/i)

    const readyUpstream = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'T1', 'done')
    expect(readyUpstream.status, readyUpstream.stderr).toBe(0)
    const startedDownstream = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'T2', 'doing')
    expect(startedDownstream.status, startedDownstream.stderr).toBe(0)

    const missingResult = complete.map((task) =>
      task.id === 'T1' ? { ...task, result: '' } : task,
    )
    writePlan(missingResult)
    const noResult = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'T1', 'doing')
    expect(noResult.status).not.toBe(0)
    expect(noResult.stderr + noResult.stdout).toMatch(/T1|result/i)

    const unknownDependency = complete.map((task) =>
      task.id === 'T2' ? { ...task, depends_on: ['NO-SUCH-TASK'] } : task,
    )
    writePlan(unknownDependency)
    const unknown = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'T2', 'doing')
    expect(unknown.status).not.toBe(0)
    expect(unknown.stderr + unknown.stdout).toMatch(/NO-SUCH-TASK|unknown.*depend/i)

    const cyclic = complete.map((task) =>
      task.id === 'T1'
        ? { ...task, depends_on: ['T2'] }
        : task.id === 'T2'
          ? { ...task, depends_on: ['T1'] }
          : task,
    )
    writePlan(cyclic)
    const cycle = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'T1', 'doing')
    expect(cycle.status).not.toBe(0)
    expect(cycle.stderr + cycle.stdout).toMatch(/cycle|cyclic|T1|T2/i)

    const broken = complete.map((task) => ({ ...task, scope: ['src/private.ts'] }))
    writePlan(broken)
    const outOfScope = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'T1', 'doing')
    expect(outOfScope.status).not.toBe(0)
    expect(outOfScope.stderr + outOfScope.stdout).toMatch(/T1|scope|write_scope/i)

    write(
      fixture.root,
      'docs/plans/fixture.md',
      planContent(fixture.baseCommit, {
        status: 'active',
        execution_contract: 1,
        task_contract: 2,
        verification_contract: 2,
        owner: 'fixture-owner',
        acceptance: [
          {
            id: 'AC-TEST-001',
            tests: ['tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence'],
            required_layers: ['unit'],
            checks: [
              {
                test: 'tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence',
                layer: 'unit',
              },
            ],
          },
        ],
        tasks: [
          ...tasks.map(({ result, scope, owner, depends_on, ...legacy }) => legacy),
          ...phases.map(({ result, scope, owner, depends_on, ...legacy }) => legacy),
        ],
      }),
    )
    const legacy = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'T2', 'doing')
    expect(legacy.status, legacy.stderr).toBe(0)
  } finally {
    fixture.cleanup()
  }
})

it('[AC-DOCFLOW-002] preserves legacy task contract behavior', () => {
  const fixture = validReviewPlanFixture()
  try {
    for (const taskContract of [1, 2]) {
      const current = read(fixture.root, 'docs/plans/fixture.md')
      const metadata = JSON.parse(current.match(/<!-- ignite-plan\s*([\s\S]*?)\s*-->/)?.[1] || '{}')
      delete metadata.planning_contract
      delete metadata.review_contract
      delete metadata.reviews
      metadata.status = 'draft'
      metadata.execution_contract = 1
      metadata.task_contract = taskContract
      metadata.verification_contract = 2
      metadata.tasks = [
        { id: 'P', title: 'Complete preparation', phase: 'prepare', status: 'todo' },
        {
          id: 'R',
          title: 'Record a red assertion',
          phase: 'red',
          status: 'todo',
          acceptance: ['AC-TEST-001'],
        },
        {
          id: 'I',
          title: 'Implement behavior',
          phase: 'implement',
          status: 'todo',
          acceptance: ['AC-TEST-001'],
        },
        { id: 'V', title: 'Verify behavior', phase: 'verify', status: 'todo' },
      ]
      write(
        fixture.root,
        'docs/plans/fixture.md',
        `<!-- ignite-plan\n${JSON.stringify(metadata, null, 2)}\n-->\n\n${current.split('-->')[1]}`,
      )
      const prepared = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
      expect(prepared.status, prepared.stdout + prepared.stderr).toBe(0)
      expect(JSON.parse(prepared.stdout).ready).toBe(true)

      const continuation = runCli(fixture.root, 'next', '--plan', 'IGT-900')
      expect(continuation.status, continuation.stderr).toBe(0)
      expect(continuation.stdout).not.toMatch(/planning_contract|review_contract|missing.*review/i)

      const ready = runCli(fixture.root, 'plan', 'set-status', 'IGT-900', 'ready')
      expect(ready.status, ready.stderr).toBe(0)
      const active = runCli(fixture.root, 'plan', 'set-status', 'IGT-900', 'active')
      expect(active.status, active.stderr).toBe(0)
      const result = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'P', 'doing')
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)[0]).toMatchObject({ id: 'P', status: 'doing' })
    }
  } finally {
    fixture.cleanup()
  }
})

it('[AC-DOCFLOW-003] requires current independent review records', () => {
  const fixture = validReviewPlanFixture()
  try {
    const missing = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(missing.status).not.toBe(0)
    expect(missing.stdout + missing.stderr).toMatch(/draft.*review|review.*draft/i)

    const context = runCli(fixture.root, 'review', 'context', 'IGT-900', 'draft')
    expect(context.status, context.stderr).toBe(0)
    const subject = JSON.parse(context.stdout)
    expect(subject).toMatchObject({
      plan_id: 'IGT-900',
      stage: 'draft',
      executor: 'fixture-owner',
      identity_assurance: 'declared',
    })
    expect(subject.subject_fingerprint).toMatch(/^[a-f0-9]{64}$/)

    const record = {
      stage: 'draft',
      reviewer: 'independent-reviewer',
      executor: subject.executor,
      source: 'Codex task /root/docflow_plan_review',
      subject_fingerprint: subject.subject_fingerprint,
      verdict: 'approved',
      findings: [],
    }
    write(fixture.root, 'review.json', JSON.stringify(record))
    const saved = runCli(
      fixture.root,
      'review',
      'record',
      'IGT-900',
      'draft',
      '--file',
      'review.json',
    )
    expect(saved.status, saved.stderr).toBe(0)
    const prepared = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(prepared.status, prepared.stderr).toBe(0)
    expect(JSON.parse(prepared.stdout).ready).toBe(true)

    const readmitted = runCli(fixture.root, 'review', 'context', 'IGT-900', 'draft')
    expect(readmitted.status, readmitted.stderr).toBe(0)
    expect(JSON.parse(readmitted.stdout).subject_fingerprint).toBe(subject.subject_fingerprint)
    const ready = runCli(fixture.root, 'plan', 'set-status', 'IGT-900', 'ready')
    expect(ready.status, ready.stderr).toBe(0)
    const afterStatus = runCli(fixture.root, 'review', 'context', 'IGT-900', 'draft')
    expect(afterStatus.status, afterStatus.stderr).toBe(0)
    expect(JSON.parse(afterStatus.stdout).subject_fingerprint).toBe(subject.subject_fingerprint)

    const delivery = runCli(fixture.root, 'review', 'context', 'IGT-900', 'delivery')
    expect(delivery.status, delivery.stderr).toBe(0)
    const deliverySubject = JSON.parse(delivery.stdout)
    expect(deliverySubject).toMatchObject({ stage: 'delivery', identity_assurance: 'declared' })
    const deliveryRecord = {
      stage: 'delivery',
      reviewer: 'independent-reviewer',
      executor: deliverySubject.executor,
      source: 'Codex task /root/docflow_delivery_review',
      subject_fingerprint: deliverySubject.subject_fingerprint,
      verdict: 'approved',
      findings: [],
    }
    write(fixture.root, 'delivery-review.json', JSON.stringify(deliveryRecord))
    const deliverySaved = runCli(
      fixture.root,
      'review',
      'record',
      'IGT-900',
      'delivery',
      '--file',
      'delivery-review.json',
    )
    expect(deliverySaved.status, deliverySaved.stderr).toBe(0)
    write(
      fixture.root,
      'tests/contracts/sample.test.ts',
      "it('[AC-TEST-001] validates current evidence', () => { expect(false).toBe(true) })\n",
    )
    const changedDelivery = runCli(fixture.root, 'review', 'context', 'IGT-900', 'delivery')
    expect(changedDelivery.status, changedDelivery.stderr).toBe(0)
    expect(JSON.parse(changedDelivery.stdout).subject_fingerprint).not.toBe(
      deliverySubject.subject_fingerprint,
    )
    const staleDelivery = runCli(
      fixture.root,
      'review',
      'record',
      'IGT-900',
      'delivery',
      '--file',
      'delivery-review.json',
    )
    expect(staleDelivery.status).not.toBe(0)
    expect(staleDelivery.stderr + staleDelivery.stdout).toMatch(/fingerprint|stale|changed/i)

    write(
      fixture.root,
      'docs/plans/fixture.md',
      read(fixture.root, 'docs/plans/fixture.md').replace(
        'The review gate is the behavior under test.',
        'The plan now has a different semantic objective.',
      ),
    )
    const changedDraft = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(changedDraft.status).not.toBe(0)
    expect(changedDraft.stdout + changedDraft.stderr).toMatch(
      /draft.*review|review.*stale|fingerprint/i,
    )

    const selfReview = { ...record, reviewer: 'fixture-owner' }
    write(fixture.root, 'review.json', JSON.stringify(selfReview))
    const rejected = runCli(
      fixture.root,
      'review',
      'record',
      'IGT-900',
      'draft',
      '--file',
      'review.json',
    )
    expect(rejected.status).not.toBe(0)
    expect(rejected.stderr + rejected.stdout).toMatch(/reviewer|independent|owner/i)

    const implementationOwnedReview = {
      ...record,
      reviewer: 'script-author',
      executor: 'fixture-owner',
    }
    const metadata = JSON.parse(
      read(fixture.root, 'docs/plans/fixture.md').match(
        /<!-- ignite-plan\s*([\s\S]*?)\s*-->/,
      )?.[1] || '{}',
    )
    metadata.tasks = [
      {
        id: 'T-IMPLEMENT',
        title: 'Implement behavior',
        phase: 'implement',
        status: 'todo',
        owner: 'script-author',
        result: 'Behavior is implemented.',
        scope: ['tests/contracts/sample.test.ts'],
        depends_on: [],
      },
    ]
    write(
      fixture.root,
      'docs/plans/fixture.md',
      `<!-- ignite-plan\n${JSON.stringify(metadata, null, 2)}\n-->\n\n${read(fixture.root, 'docs/plans/fixture.md').split('-->')[1]}`,
    )
    write(fixture.root, 'review.json', JSON.stringify(implementationOwnedReview))
    const ownerReview = runCli(
      fixture.root,
      'review',
      'record',
      'IGT-900',
      'draft',
      '--file',
      'review.json',
    )
    expect(ownerReview.status).not.toBe(0)
    expect(ownerReview.stderr + ownerReview.stdout).toMatch(/reviewer|owner|independent/i)

    const blocked = {
      ...record,
      reviewer: 'independent-reviewer',
      verdict: 'approved',
      findings: [
        {
          id: 'F-1',
          severity: 'blocking',
          summary: 'The task result is unclear.',
          resolved: false,
        },
      ],
    }
    write(fixture.root, 'review.json', JSON.stringify(blocked))
    const unresolved = runCli(
      fixture.root,
      'review',
      'record',
      'IGT-900',
      'draft',
      '--file',
      'review.json',
    )
    expect(unresolved.status).not.toBe(0)
    expect(unresolved.stderr + unresolved.stdout).toMatch(/blocking|finding|resolved/i)
  } finally {
    fixture.cleanup()
  }
})

it('[AC-DOCFLOW-004] loads project review methods from canonical sources', () => {
  const fixture = makeFixture()
  try {
    for (const path of ['docs/plans/README.md', 'docs/standards/ai-agents.md'])
      write(fixture.root, path, readFileSync(join(repositoryRoot, path), 'utf8'))
    cpSync(join(repositoryRoot, '.ai/pstack/skills'), join(fixture.root, '.ai/pstack/skills'), {
      recursive: true,
    })
    cpSync(join(repositoryRoot, '.agents/skills'), join(fixture.root, '.agents/skills'), {
      recursive: true,
    })
    for (const name of ['review-plan', 'review-delivery']) {
      const source = join(repositoryRoot, '.ai/skills', name, 'SKILL.md')
      const discovery = join(repositoryRoot, '.agents/skills', name, 'SKILL.md')
      if (existsSync(source)) cpSync(source, join(fixture.root, '.ai/skills', name, 'SKILL.md'))
      if (existsSync(discovery))
        cpSync(discovery, join(fixture.root, '.agents/skills', name, 'SKILL.md'))
    }

    const listed = runCli(fixture.root, 'skill', 'read', '--for', 'docs/plans/README.md', '--list')
    expect(listed.status, listed.stderr).toBe(0)
    const index = JSON.parse(listed.stdout)
    expect(index.required.map((method: { path: string }) => method.path)).toEqual(
      expect.arrayContaining([
        '.ai/skills/review-plan/SKILL.md',
        '.ai/skills/review-delivery/SKILL.md',
      ]),
    )

    for (const name of ['review-plan', 'review-delivery']) {
      const source = join(repositoryRoot, '.ai/skills', name, 'SKILL.md')
      expect(existsSync(source), `${source} is the canonical review method`).toBe(true)
      const canonical = readFileSync(source, 'utf8')
      const body = runCli(fixture.root, 'skill', 'read', name)
      expect(body.status, body.stderr).toBe(0)
      expect(body.stdout).toBe(canonical)
      expect(index.required.find((method: { name: string }) => method.name === name).path).toBe(
        `.ai/skills/${name}/SKILL.md`,
      )
    }

    const bridged = read(fixture.root, '.agents/skills/review-plan/SKILL.md')
    expect(bridged).toContain('../../../.ai/skills/review-plan/SKILL.md')
    expect(bridged).not.toContain('## 独立计划审查')
  } finally {
    fixture.cleanup()
  }
})
