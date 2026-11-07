import {
  standardRegistryFailures,
  validatePlanDocument,
  markdownHeadings,
} from './ignite/document-contract.mjs'
import { isGovernedPath } from './ignite/checks.mjs'
import { CONTENT_HEADINGS } from './ignite/content-contract.mjs'
import {
  collectSpecificationIds,
  filesWithoutIds,
  sourceEntries,
  unknownReferences,
} from './ignite/spec-id-registry.mjs'
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
  'docs/standards/specification-to-implementation-ddd.md',
  'docs/plans/README.md',
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

const standardFiles = walkFiles(join(docsRoot, 'standards'))
  .filter((path) => path.endsWith('.md') && !/[/\\]README\.md$/.test(path))
  .map((path) => relative(join(docsRoot, 'standards'), path).replaceAll('\\', '/'))
failures.push(
  ...standardRegistryFailures(standardFiles, read('docs/standards/README.md'), isGovernedPath),
)

const markdownFiles = walkFiles(docsRoot).filter((path) => extname(path) === '.md')

// 结构检查：只查章节、字段、引用是否齐全，不查内容意思。
const structureRequirements = [
  ['docs/features/README.md', ['模块目标', '交接']],
  ['docs/plans/README.md', ['模块目标', '交接']],
  ['docs/designs/README.md', ['模块目标', '交接', '来源标记']],
  ['docs/others/README.md', ['模块目标', '交接']],
  ['docs/standards/specification-to-implementation-ddd.md', ['定稿状态', '事件']],
]
for (const [path, required] of structureRequirements) {
  if (!existsSync(join(repositoryRoot, path))) continue
  const text = read(path)
  for (const marker of required) {
    if (!text.includes(marker)) fail(`structure: ${path} is missing required section ${marker}`)
  }
}
for (const path of walkFiles(join(docsRoot, 'standards'))) {
  if (!path.endsWith('.md')) continue
  const text = readFileSync(path, 'utf8')
  const relativePath = relative(repositoryRoot, path).replaceAll('\\', '/')
  if (/文档状态\s*\|[^\n]*(初稿|草稿)/.test(text)) {
    fail(`structure: ${relativePath} is a draft but lives under docs/standards`)
  }
}
for (const path of walkFiles(join(docsRoot, 'designs'))) {
  if (!path.endsWith('.md') || path.endsWith('README.md')) continue
  const text = readFileSync(path, 'utf8')
  const relativePath = relative(repositoryRoot, path).replaceAll('\\', '/')
  if (!text.includes('事件与命令')) fail(`structure: ${relativePath} is missing the event section`)
}
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
    if (!markdownHeadings(content).includes(heading))
      fail(`${relativeFile}: missing heading "${heading}"`)
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
  const contentOnlyHeadings = CONTENT_HEADINGS
  for (const error of validatePlanDocument(plan.content, read('docs/plans/_template.md'), {
    contentContract: plan.metadata?.content_contract === 1,
  }))
    fail(`${plan.relativePath}: ${error}`)
  if (plan.metadata?.schema !== 2) {
    const selectedTypes = [
      ...plan.content.matchAll(/^- 类型：`(\[(?:新增模块|存量改动|基础设施变更)\])`$/gm),
    ]
    if (selectedTypes.length !== 1) fail(`${plan.relativePath}: select exactly one change type`)
  }
}

const specEntries = sourceEntries(repositoryRoot, [
  'docs/standards',
  'docs/designs',
  'docs/others/adr',
])
const specRegistry = collectSpecificationIds(specEntries)
for (const path of filesWithoutIds(specEntries)) fail(`${path}: missing specification identifier`)
for (const duplicate of specRegistry.duplicates)
  fail(
    `${duplicate.second}: duplicate specification identifier ${duplicate.id} (also ${duplicate.first})`,
  )
for (const planFile of planFiles) {
  const plan = readPlan(planFile)
  const prose = plan.content.replace(/<!-- ignite-plan[\s\S]*?-->/, '')
  for (const id of unknownReferences(prose, specRegistry.byId))
    fail(`${plan.relativePath}: unknown specification reference ${id}`)
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
