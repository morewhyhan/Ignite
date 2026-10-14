import { randomInt } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { formatJson, formatWithPrettier } from './ignite/core.mjs'
import { renderPlanProgressContent } from './ignite/execution-contract.mjs'
import { checkScaffoldWorktree } from './scaffold-preflight.mjs'
import { writeFileSetAtomically } from './ignite/scaffold-writer.mjs'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const releaseIndex = args.indexOf('--release')
const positionalArguments = args.filter(
  (argument, index) =>
    !argument.startsWith('--') && (releaseIndex < 0 || index !== releaseIndex + 1),
)
const [slug] = positionalArguments
const releaseId = releaseIndex >= 0 ? args[releaseIndex + 1] : `${slug}-v1`
if (
  positionalArguments.length !== 1 ||
  args.some(
    (argument) => argument.startsWith('--') && !['--dry-run', '--release'].includes(argument),
  ) ||
  args.filter((argument) => argument === '--release').length > 1 ||
  !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug || '') ||
  !/^[a-z0-9][a-z0-9-]*$/.test(releaseId || '')
) {
  throw new Error('Usage: pnpm create:change <kebab-name> [--release <release-id>] [--dry-run]')
}

const root = resolve(process.env.IGNITE_ROOT || process.cwd())
const dirtyEntries = checkScaffoldWorktree(root, { dryRun })
const git = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: root,
  encoding: 'utf8',
  windowsHide: true,
})
const baseCommit = git.status === 0 ? git.stdout.trim() : ''
if (!/^[0-9a-f]{40}$/i.test(baseCommit)) throw new Error('A committed Git baseline is required.')

const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date())
const planPath = join(root, 'docs', 'plans', `${date.replaceAll('-', '')}-${slug}.md`)
const releasePath = join(root, 'docs', 'plans', 'releases', `${releaseId}.json`)
const planTemplate = readFileSync(join(root, 'docs', 'plans', '_template.md'), 'utf8')
const planBodyStart = planTemplate.indexOf('-->')
if (planBodyStart < 0) throw new Error('docs/plans/_template.md is missing ignite-plan metadata')
const planBody = planTemplate
  .slice(planBodyStart + 3)
  .replaceAll('<change-name>', slug)
  .replaceAll('REQ-FEATURE-001', '待填写')
  .replaceAll('AC-FEATURE-001', '待填写')
if (existsSync(planPath)) throw new Error(`Plan already exists: ${planPath}`)
if (existsSync(releasePath)) throw new Error(`Release already exists: ${releasePath}`)

const existing = new Set()
for (const entry of readdirSync(join(root, 'docs', 'plans'), { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.md')) continue
  const contents = readFileSync(join(root, 'docs', 'plans', entry.name), 'utf8')
  const id = contents.match(/"id"\s*:\s*"(IGT-\d+)"/)?.[1]
  if (id) existing.add(id)
}
let id
do {
  id = `IGT-${Date.now()}${String(randomInt(1_000_000)).padStart(6, '0')}`
} while (existing.has(id))

const metadata = {
  schema: 2,
  id,
  release: releaseId,
  status: 'draft',
  outcome: `完成 ${slug} 的一项可独立验收的存量改动`,
  contract_version: 2,
  execution_contract: 1,
  task_contract: 2,
  planning_contract: 1,
  review_contract: 1,
  reviews: [],
  verification_contract: 2,
  goals: [],
  constraints: [],
  non_goals: [],
  authorization: { source: '等待填写用户已确定的具体请求' },
  deliverables: [],
  remaining_work: ['原始目标尚未细化，无法确认完整验收场景'],
  change_type: '存量改动',
  base_commit: baseCommit,
  requirements: [],
  acceptance: [],
  verification_requirements: ['unit'],
  tasks: [
    {
      id: 'T1',
      title: '确认本轮目标、编写真实测试并提交准备基线',
      phase: 'prepare',
      status: 'todo',
      result: '原始目标、Feature、真实断言、测试路径和写入边界均已对应，规格与测试已提交，独立审查者已核对 draft。',
      scope: [
        `docs/plans/${date.replaceAll('-', '')}-${slug}.md`,
        `docs/plans/releases/${releaseId}.json`,
        '<feature-path>',
        '<test-path>',
      ],
      depends_on: [],
      owner: 'assigned-worker',
    },
    {
      id: 'T2',
      title: '运行真实断言并记录目标行为红灯',
      phase: 'red',
      acceptance: [],
      status: 'todo',
      result: '原生 red 运行确认已提交测试的目标断言失败，并记录真实红灯。',
      scope: ['<test-path>', 'docs/others/evidence/tdd/'],
      depends_on: ['T1'],
      owner: 'assigned-worker',
    },
    {
      id: 'T3',
      title: '实现已定义的行为切片',
      phase: 'implement',
      acceptance: [],
      status: 'todo',
      result: '已声明的验收行为通过，改动保持在本轮写入范围内。',
      scope: ['<affected-path>'],
      depends_on: ['T2'],
      owner: 'assigned-worker',
    },
    {
      id: 'T4',
      title: '验证兼容性并回写当前设计',
      phase: 'verify',
      status: 'todo',
      result: 'Plan integration 和独立 delivery 审查均通过，Design 已记录实际结果及缺口。',
      scope: ['<design-path>', 'docs/others/evidence/'],
      depends_on: ['T3'],
      owner: 'assigned-worker',
    },
  ],
  depends_on: [],
  dependency_contracts: [],
  shared_files: [],
  handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
  owner: 'assigned-worker',
  risk: 'feature',
  data_contract: {
    access_scope: 'not-decided',
    access_rationale: '',
    migration_impact: 'not-decided',
    rollback: '',
    destructive_authorization: null,
  },
  write_scope: [
    '<feature-path>',
    '<test-path>',
    '<affected-path>',
    '<design-path>',
    'docs/others/evidence/',
    `docs/plans/${date.replaceAll('-', '')}-${slug}.md`,
    `docs/plans/releases/${releaseId}.json`,
    'docs/others/evidence/tdd/',
  ],
  tdd_evidence: [],
  required_evidence: ['check-integration'],
  evidence: [],
  blocker: null,
  open_questions: ['填写目标、受影响的现有 Feature/Design、验收标准与写入范围'],
  integrated_commit: null,
  updated_at: date,
}
const release = {
  schema: 2,
  id: releaseId,
  coverage_version: 2,
  verification_contract: 2,
  plan_ids: [id],
  scope: [
    {
      id: 'GOAL-001',
      text: '待填写原始目标',
      source: '待填写来源',
      requirements: [],
      acceptance: [],
      plan_ids: [id],
      disposition: 'included',
      reason: '',
      authorization: '',
    },
  ],
  must_pass: ['check-release'],
  evidence: [],
  integrated_commit: null,
  excluded: [],
  updated_at: date,
}
const planContent = formatWithPrettier(
  `<!-- ignite-plan\n${formatJson(metadata).trimEnd()}\n-->${renderPlanProgressContent(planBody, metadata)}`,
  { parser: 'markdown' },
)
const releaseContent = formatJson(release)
console.log(`${dryRun ? 'Would create' : 'Creating'}:\n- ${planPath}\n- ${releasePath}`)
if (dryRun) {
  if (dirtyEntries.length)
    console.log(`Worktree has ${dirtyEntries.length} existing change(s); preview is read-only.`)
  console.log(
    'Preview only; no files or release membership were changed. Remove --dry-run to create this draft.',
  )
} else {
  writeFileSetAtomically(root, [
    [relative(root, planPath), planContent],
    [relative(root, releasePath), releaseContent],
  ])
  console.log(`Created draft ${id}; Release ${releaseId} includes this Plan.`)
  console.log(
    'Next: define the goals and behavior. Split implementation tasks only when their results, owners, write scopes and interfaces are independent.',
  )
  console.log('Refresh the generated overview: pnpm ignite status --write')
  console.log(`Continue: pnpm ignite next --plan ${id}`)
}
