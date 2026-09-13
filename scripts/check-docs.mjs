import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { repositoryRoot, walkFiles } from './ignite/core.mjs'
import {
  validateAgentBridges,
  validateDesignArtifacts,
  validateRuntimeContract,
  validateTraceability,
} from './ignite/governance.mjs'
import { listPlanFiles, readPlan, validateAllPlans, validateAllReleases } from './ignite/state.mjs'

const docsRoot = join(repositoryRoot, 'docs')
const failures = []

function fail(message) {
  failures.push(message)
}

function requirePath(path) {
  if (!existsSync(join(repositoryRoot, path))) fail(`missing required documentation path: ${path}`)
}

function read(path) {
  return readFileSync(join(repositoryRoot, path), 'utf8')
}

for (const path of [
  'AGENTS.md',
  'docs/README.md',
  'docs/standards/adoption.md',
  'docs/standards/workflow.md',
  'docs/features/product.md',
  'docs/features/_template.md',
  'docs/plans/_template.md',
  'docs/plans/releases/README.md',
  'docs/plans/releases/_template.json',
  'docs/others/test-cases/README.md',
  'docs/others/test-cases/_template.md',
  'docs/designs/domain.puml',
  'docs/designs/database.sql',
  'docs/designs/api.yaml',
  'docs/designs/sequence.puml',
]) {
  requirePath(path)
}

const markdownFiles = walkFiles(docsRoot).filter((path) => extname(path) === '.md')
const localLinkPattern = /!?\[[^\]]*]\(([^)]+)\)/g

for (const markdownFile of markdownFiles) {
  const content = readFileSync(markdownFile, 'utf8')
  const relativeFile = relative(repositoryRoot, markdownFile).replaceAll('\\', '/')

  for (const match of content.matchAll(localLinkPattern)) {
    let target = match[1].trim()
    if (target.startsWith('#') || target.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(target)) {
      continue
    }
    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1)
    target = target.split('#', 1)[0].split('?', 1)[0]
    if (!target || (relativeFile.includes('_template.md') && target.includes('<'))) continue
    try {
      if (!existsSync(resolve(dirname(markdownFile), decodeURIComponent(target)))) {
        fail(`${relativeFile}: broken local link ${target}`)
      }
    } catch {
      fail(`${relativeFile}: invalid encoded link ${target}`)
    }
  }

  if (
    !relativeFile.includes('_template.md') &&
    /docs\/(?:features|plans)\//.test(relativeFile) &&
    /<(?:feature-name|change-name|actor|capability|value)>/i.test(content)
  ) {
    fail(`${relativeFile}: unresolved template placeholder`)
  }
}

const featureFiles = walkFiles(join(docsRoot, 'features')).filter(
  (path) => path.endsWith('.md') && !/[/\\](?:README|_template)\.md$/.test(path),
)
for (const featureFile of featureFiles) {
  const content = readFileSync(featureFile, 'utf8')
  const relativeFile = relative(repositoryRoot, featureFile).replaceAll('\\', '/')
  const requiredHeadings = ['## 背景与目标', '## 业务规则', '## 验收标准']
  if (!featureFile.endsWith('product.md')) requiredHeadings.push('## 模块边界')
  for (const heading of requiredHeadings) {
    if (!content.includes(heading)) fail(`${relativeFile}: missing heading "${heading}"`)
  }
  if (!/^- R\d+（REQ-[A-Z0-9-]+）：/m.test(content)) {
    fail(`${relativeFile}: business rules must use stable REQ-* IDs`)
  }
  if (!/^- AC-[A-Z0-9-]+（REQ-[A-Z0-9-,、 ]+）：Given .+When .+Then /m.test(content)) {
    fail(`${relativeFile}: AC must name covered REQ-* IDs and use Given/When/Then`)
  }
}

const planFiles = listPlanFiles()
for (const planFile of planFiles) {
  const plan = readPlan(planFile)
  for (const heading of [
    '## 状态',
    '## 变更类型',
    '## 目标',
    '## 输入规格',
    '## 实现任务',
    '## 验收方式',
    '## 状态记录',
    '## 准出条件',
  ]) {
    if (!plan.content.includes(heading)) fail(`${plan.relativePath}: missing heading "${heading}"`)
  }
  const selectedTypes = [
    ...plan.content.matchAll(/^- 类型：`(\[(?:新增模块|存量改动|基础设施变更)\])`$/gm),
  ]
  if (selectedTypes.length !== 1) fail(`${plan.relativePath}: select exactly one change type`)
  if (plan.metadata?.schema === 2 && selectedTypes[0]?.[1] !== `[${plan.metadata.change_type}]`) {
    fail(`${plan.relativePath}: body change type differs from metadata`)
  }
  if (plan.metadata) {
    for (const heading of ['## 非目标', '## 测试与验收设计', '## 设计回写']) {
      if (!plan.content.includes(heading)) {
        fail(`${plan.relativePath}: structured Plans require heading "${heading}"`)
      }
    }
  }
}

const agentGuide = read('AGENTS.md')
for (const rule of [
  'Ignite 是一个可复制',
  '## 增量与存量',
  '## 规格驱动 Loop',
  'docs/standards/adoption.md',
]) {
  if (!agentGuide.includes(rule)) fail(`AGENTS.md: missing required template rule "${rule}"`)
}

failures.push(
  ...validateAllPlans(),
  ...validateAllReleases(),
  ...validateTraceability(),
  ...(await validateDesignArtifacts()),
  ...validateAgentBridges(),
  ...validateRuntimeContract(),
)

if (failures.length > 0) {
  console.error('Documentation checks failed:')
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(
    `Documentation checks passed (${markdownFiles.length} Markdown files, ${featureFiles.length} feature specs, ${planFiles.length} Plans).`,
  )
}
