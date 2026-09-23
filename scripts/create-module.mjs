import { spawnSync } from 'node:child_process'
import { randomInt } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { renderPlanProgressContent } from './ignite/execution-contract.mjs'

const arguments_ = process.argv.slice(2)
const dryRun = arguments_.includes('--dry-run')
const releaseIndex = arguments_.indexOf('--release')
const releaseArgument = releaseIndex >= 0 ? arguments_[releaseIndex + 1] : null
const positionalArguments = arguments_.filter(
  (argument, index) =>
    !argument.startsWith('--') && (releaseIndex < 0 || index !== releaseIndex + 1),
)
const [moduleName] = positionalArguments

if (
  positionalArguments.length !== 1 ||
  !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(moduleName || '') ||
  arguments_.some(
    (argument) => argument.startsWith('--') && !['--dry-run', '--release'].includes(argument),
  ) ||
  arguments_.filter((argument) => argument === '--release').length > 1 ||
  (releaseIndex >= 0 && (!releaseArgument || releaseArgument.startsWith('--')))
) {
  console.error(
    'Usage: pnpm create:module <plural-kebab-name> [--release <release-id>] [--dry-run]',
  )
  process.exit(1)
}

const releaseId = releaseArgument || `${moduleName}-v1`
if (!/^[a-z0-9][a-z0-9-]*$/.test(releaseId)) {
  console.error('Release id must use kebab-case.')
  process.exit(1)
}

const reservedModules = new Set(['auth', 'dashboard', 'landing', 'settings', 'tasks', 'theme'])
if (reservedModules.has(moduleName)) {
  console.error(`Module "${moduleName}" already belongs to the template baseline.`)
  process.exit(1)
}

const repositoryRoot = resolve(process.env.IGNITE_ROOT || process.cwd())
const pascalName = moduleName
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('')
const upperName = moduleName.toUpperCase()
const dateValue = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date())
const compactDate = dateValue.replaceAll('-', '')

const git = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
  windowsHide: true,
})
const baseCommit = git.status === 0 ? git.stdout.trim() : ''
if (!/^[0-9a-f]{40}$/i.test(baseCommit)) {
  console.error('A committed Git baseline is required before creating a module.')
  process.exit(1)
}

const existingPlanIds = new Set()
const planRoot = join(repositoryRoot, 'docs', 'plans')
if (existsSync(planRoot)) {
  const planFiles = readdirSync(planRoot, { recursive: true, withFileTypes: true })
  for (const entry of planFiles) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    const content = readFileSync(join(entry.parentPath, entry.name), 'utf8')
    const id = content.match(/"id"\s*:\s*"IGT-(\d+)"/)?.[1]
    if (id) existingPlanIds.add(`IGT-${id}`)
  }
}
let planId
do {
  planId = `IGT-${Date.now()}${String(randomInt(1_000_000)).padStart(6, '0')}`
} while (existingPlanIds.has(planId))
const acceptanceId = `AC-${upperName}-001`
const requirementId = `REQ-${upperName}-001`
const testPath = `tests/contracts/${moduleName}.test.ts`
const browserTestPath = `tests/e2e/${moduleName}.spec.ts`
const planPath = `docs/plans/${compactDate}-${moduleName}.md`
const releasePath = `docs/plans/releases/${releaseId}.json`
const planTemplate = readFileSync(join(repositoryRoot, 'docs', 'plans', '_template.md'), 'utf8')
const planBodyStart = planTemplate.indexOf('-->')
if (planBodyStart < 0) throw new Error('docs/plans/_template.md is missing ignite-plan metadata')
const planBody = planTemplate
  .slice(planBodyStart + 3)
  .replaceAll('<change-name>', moduleName)
  .replaceAll('REQ-FEATURE-001', requirementId)
  .replaceAll('AC-FEATURE-001', acceptanceId)
const renderPlan = (metadata) =>
  `<!-- ignite-plan\n${JSON.stringify(metadata, null, 2)}\n-->${renderPlanProgressContent(planBody, metadata)}`

const files = new Map([
  [
    `src/modules/${moduleName}/components/${moduleName}-screen.tsx`,
    `export function ${pascalName}Screen() {
  return (
    <section className="container py-12">
      <h1 className="text-3xl font-semibold">${pascalName}</h1>
      <p className="mt-2 text-muted-foreground">
        Complete the feature specification before implementing this module.
      </p>
    </section>
  )
}
`,
  ],
  [
    `src/modules/${moduleName}/index.ts`,
    `export { ${pascalName}Screen } from './components/${moduleName}-screen'
`,
  ],
  [
    `docs/features/${moduleName}.md`,
    `# Ignite 功能规格：${moduleName}

## 背景与目标

作为 <actor>，我想要 <capability>，以便 <value>。

## 模块边界

- 需求类型：增量模块
- Client module: \`src/modules/${moduleName}/\`
- Server route: \`src/server/api/routes/${moduleName}/\`（需要远程数据时）
- Page route: 待确定
- Navigation registration: \`src/config/navigation.ts\`

## 字段清单

| 字段 | 类型 | 必填 | 默认值 | 校验规则 | UI 展示 | 数据来源 |
| ---- | ---- | ---- | ------ | -------- | ------- | -------- |

## 业务规则

- R1（${requirementId}）：待定义可独立验证的规则。

## 权限、错误与缓存

- 待定义。

## 原型与交互

- 原型链接或“无外部原型”的说明：待补充。
- 页面状态：loading / error / empty / pending / success。

## 非目标

- 待定义。

## 验收标准

- ${acceptanceId}（${requirementId}）：Given <context> When <action> Then <observable-result>。

本脚手架包含 UI Screen，验收需要 unit 和真实 browser 两层。先定义页面路由及用户路径，再替换两个失败占位用例；涉及持久化或第三方服务时，另补 database / external 验收。
`,
  ],
  [
    testPath,
    `import { describe, expect, it } from 'vitest'

describe('${moduleName} acceptance', () => {
  it('[${acceptanceId}] replaces this red specification with executable behavior', () => {
    expect.fail('Implement ${requirementId} before moving the Plan to verifying')
  })
})
`,
  ],
  [
    browserTestPath,
    `import { test } from '@playwright/test'

test('[${acceptanceId}] completes the specified user journey in a real browser', async () => {
  throw new Error('Define the ${moduleName} route and implement its real browser journey before moving the Plan to verifying')
})
`,
  ],
  [
    planPath,
    renderPlan({
      schema: 2,
      id: planId,
      release: releaseId,
      status: 'draft',
      outcome: `完成 ${moduleName} 的一个可验收纵向切片`,
      contract_version: 2,
      execution_contract: 1,
      goals: [{ text: `完成 ${moduleName} 的可验收能力`, requirements: [requirementId] }],
      constraints: [],
      non_goals: [],
      authorization: { source: '待确认具体实施请求' },
      deliverables: [`${moduleName} 可运行入口和验证结果`],
      remaining_work: ['目标行为未定义，尚无法确认完整验收场景'],
      change_type: '新增模块',
      base_commit: baseCommit,
      requirements: [requirementId],
      acceptance: [
        {
          id: acceptanceId,
          tests: [`${testPath}::[${acceptanceId}]`, `${browserTestPath}::[${acceptanceId}]`],
          required_layers: ['unit', 'browser'],
          checks: [
            { test: `${testPath}::[${acceptanceId}]`, layer: 'unit' },
            { test: `${browserTestPath}::[${acceptanceId}]`, layer: 'browser' },
          ],
        },
      ],
      verification_requirements: ['unit', 'browser'],
      tasks: [
        { id: 'T1', title: '确认目标、输入输出和验收场景', status: 'todo' },
        { id: 'T2', title: '定义逻辑与真实浏览器验收并确认预期失败', status: 'todo' },
        { id: 'T3', title: '实现并接入纵向切片', status: 'todo' },
        { id: 'T4', title: '完成验证并回写当前设计', status: 'todo' },
      ],
      depends_on: [],
      dependency_contracts: [],
      shared_files: [],
      handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
      owner: 'assigned-worker',
      risk: 'feature',
      write_scope: [
        `src/modules/${moduleName}/`,
        `src/server/api/routes/${moduleName}/`,
        'src/server/api/index.ts',
        'src/app/',
        'src/config/navigation.ts',
        'prisma/',
        testPath,
        browserTestPath,
        `docs/features/${moduleName}.md`,
        planPath,
        releasePath,
        'docs/designs/',
        'docs/others/test-cases/',
      ],
      required_evidence: ['check-integration', 'check-release'],
      evidence: [],
      blocker: null,
      open_questions: ['确认字段、权限、错误、路由和验收范围'],
      integrated_commit: null,
      updated_at: dateValue,
    }),
  ],
])

let release
const absoluteReleasePath = join(repositoryRoot, releasePath)
if (existsSync(absoluteReleasePath)) {
  release = JSON.parse(readFileSync(absoluteReleasePath, 'utf8'))
  if (release.schema !== 2 || 'status' in release || !Array.isArray(release.plan_ids)) {
    console.error(`Existing release is not a schema 2 release: ${releasePath}`)
    process.exit(1)
  }
  if (release.coverage_version !== 1 && release.plan_ids.length > 0) {
    console.error(
      `Release ${releaseId} already has Plans but no original-goal coverage. ` +
        'Map its existing scope first or choose a new --release id; refusing to create a misleading partial map.',
    )
    process.exit(1)
  }
  release.plan_ids = [...new Set([...release.plan_ids, planId])]
  release.must_pass = [
    ...new Set([...(release.must_pass || []), 'check-integration', 'check-release']),
  ]
  const existingScope = Array.isArray(release.scope) ? release.scope : []
  const nextGoalNumber =
    Math.max(
      0,
      ...existingScope.map((entry) => Number(entry?.id?.match(/^GOAL-(\d+)$/)?.[1] || 0)),
    ) + 1
  release.coverage_version = 1
  release.scope = [
    ...existingScope,
    {
      id: `GOAL-${String(nextGoalNumber).padStart(3, '0')}`,
      text: '待填写原始目标',
      source: '待填写来源',
      requirements: [],
      plan_ids: [planId],
      disposition: 'included',
      reason: '',
      authorization: '',
    },
  ]
  release.updated_at = dateValue
} else {
  release = {
    schema: 2,
    id: releaseId,
    coverage_version: 1,
    plan_ids: [planId],
    scope: [
      {
        id: 'GOAL-001',
        text: '待填写原始目标',
        source: '待填写来源',
        requirements: [],
        plan_ids: [planId],
        disposition: 'included',
        reason: '',
        authorization: '',
      },
    ],
    must_pass: ['check-integration', 'check-release'],
    excluded: [],
    updated_at: dateValue,
  }
}

const collisions = [...files.keys()].filter((path) => existsSync(join(repositoryRoot, path)))
if (collisions.length > 0) {
  console.error('Refusing to overwrite existing files:')
  for (const path of collisions) console.error(`- ${path}`)
  process.exit(1)
}

console.log(dryRun ? 'Would create:' : 'Creating:')
for (const path of files.keys()) console.log(`- ${path}`)
console.log(
  `${dryRun ? 'Would ' : ''}${existsSync(absoluteReleasePath) ? 'update' : 'create'}: ${releasePath}`,
)

if (!dryRun) {
  for (const [path, content] of files) {
    const absolutePath = join(repositoryRoot, path)
    mkdirSync(dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, content, 'utf8')
  }
  mkdirSync(dirname(absoluteReleasePath), { recursive: true })
  writeFileSync(absoluteReleasePath, `${JSON.stringify(release, null, 2)}\n`, 'utf8')
}

console.log('')
if (dryRun) {
  console.log(
    'Preview only; no files or release membership were changed. Remove --dry-run to create this draft.',
  )
} else {
  console.log(`Created draft ${planId}; Release ${releaseId} includes this Plan.`)
  console.log(
    'Next: define the Feature, route and user journey, then replace both red acceptance tests.',
  )
  console.log('Refresh the generated overview: pnpm ignite status --write')
  console.log(`Continue: pnpm ignite next --plan ${planId}`)
}
