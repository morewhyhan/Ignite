import { spawnSync } from 'node:child_process'
import { randomInt } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const arguments_ = process.argv.slice(2)
const dryRun = arguments_.includes('--dry-run')
const releaseIndex = arguments_.indexOf('--release')
const releaseArgument = releaseIndex >= 0 ? arguments_[releaseIndex + 1] : null
const moduleName = arguments_.find(
  (argument, index) =>
    !argument.startsWith('--') && (releaseIndex < 0 || index !== releaseIndex + 1),
)

if (!moduleName || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(moduleName)) {
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
const planPath = `docs/plans/${compactDate}-${moduleName}.md`
const releasePath = `docs/plans/releases/${releaseId}.json`

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
    planPath,
    `<!-- ignite-plan
${JSON.stringify(
  {
    schema: 2,
    id: planId,
    release: releaseId,
    status: 'draft',
    outcome: `完成 ${moduleName} 的一个可验收纵向切片`,
    contract_version: 2,
    goals: [{ text: `完成 ${moduleName} 的可验收能力`, requirements: [requirementId] }],
    constraints: [],
    non_goals: [],
    authorization: { source: '待确认具体实施请求' },
    deliverables: [`${moduleName} 可运行入口和验证结果`],
    change_type: '新增模块',
    base_commit: baseCommit,
    requirements: [requirementId],
    acceptance: [{ id: acceptanceId, tests: [`${testPath}::[${acceptanceId}]`] }],
    depends_on: [],
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
  },
  null,
  2,
)}
-->

# Ignite 实施计划：${moduleName}

## 状态

以顶部元数据为准；当前为 \`draft\`。

## 目标

在需求规格确认后实现 ${moduleName} 纵向切片。

## 非目标

- 待定义。

## 变更类型

- 类型：\`[新增模块]\`
- 影响的存量路径：待审计
- 新增的增量路径：\`src/modules/${moduleName}/\`
- 兼容性影响：待确认
- 数据迁移或回滚要求：待确认

## 输入规格

- Feature：\`docs/features/${moduleName}.md\`
- Standards：\`docs/standards/\`
- Designs：\`docs/designs/\`
- Source of truth：\`src/\`、\`prisma/\`、\`tests/\`

## 已关闭问题

- 开放问题：尚未关闭，不能开始实现。
- 实施授权：等待需求和 Plan 确认。

## 测试与验收设计

| 验收标准 | 覆盖需求 | 自动化测试 | 实现后命令 | 适用层级 |
| -------- | -------- | ---------- | ---------- | -------- |
| ${acceptanceId} | ${requirementId} | \`${testPath}\` | \`pnpm test\` | contract / behavior |

## 实现任务

- [ ] 完成需求规格和测试用例。
- [ ] 让目标测试因缺少目标行为而失败。
- [ ] 实现并注册纵向切片。
- [ ] 更新设计规格并完成准出验证。

## 设计回写

- [ ] 领域模型
- [ ] 数据库
- [ ] API
- [ ] 时序图

## 验收方式

- [ ] \`pnpm ignite check --plan ${planId} --level integration\`
- [ ] \`pnpm ignite plan set-status ${planId} verifying --commit HEAD\`
- [ ] \`pnpm ignite check --plan ${planId} --level release\`

## 状态记录

| 时间 | 状态 | 说明 |
| ---- | ---- | ---- |
| ${dateValue} | draft | 脚手架创建，等待规格确认 |

## 准出条件

- [ ] 每条 REQ 被 AC 覆盖，AC 对应可执行测试。
- [ ] 当前输入的 integration 与 release 证据通过。
- [ ] Plan 状态和最终设计已更新。
`,
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
  release.plan_ids = [...new Set([...release.plan_ids, planId])]
  release.must_pass = [
    ...new Set([...(release.must_pass || []), 'check-integration', 'check-release']),
  ]
  release.updated_at = dateValue
} else {
  release = {
    schema: 2,
    id: releaseId,
    plan_ids: [planId],
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
console.log(`${existsSync(absoluteReleasePath) ? 'Would update' : 'Would create'}: ${releasePath}`)

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
console.log('Next: close the Feature and Plan questions, then replace the red acceptance test.')
console.log(`Release ${releaseId} already includes ${planId}; no second status file is needed.`)
