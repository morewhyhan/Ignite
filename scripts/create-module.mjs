import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const arguments_ = process.argv.slice(2)
const dryRun = arguments_.includes('--dry-run')
const moduleName = arguments_.find((argument) => !argument.startsWith('--'))

if (!moduleName || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(moduleName)) {
  console.error('Usage: pnpm create:module <plural-kebab-name> [--dry-run]')
  process.exit(1)
}

const reservedModules = new Set(['auth', 'dashboard', 'landing', 'settings', 'tasks', 'theme'])
if (reservedModules.has(moduleName)) {
  console.error(`Module "${moduleName}" already belongs to the template baseline.`)
  process.exit(1)
}

const repositoryRoot = process.cwd()
const pascalName = moduleName
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('')
const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
  .format(new Date())
  .replaceAll('-', '')

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
| --- | --- | --- | --- | --- | --- | --- |

## 业务规则

- R1：待定义可独立验证的规则。

## 权限、错误与缓存

- 待定义。

## 原型与交互

- 原型链接或“无外部原型”的说明：待补充。
- 页面状态：loading / error / empty / pending / success。

## 非目标

- 待定义。

## 验收标准

- Given <context> When <action> Then <observable-result>。
`,
  ],
  [
    `docs/plans/${date}-${moduleName}.md`,
    `# Ignite 实施计划：${moduleName}

## 状态

草稿。

## 目标

在需求规格确认后实现 ${moduleName} 纵向切片。

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

## 实现任务

- [ ] 完成需求规格和测试用例。
- [ ] 编写先失败的目标测试。
- [ ] 实现并注册纵向切片。
- [ ] 更新设计规格并完成准出验证。

## 验收方式

- [ ] \`pnpm docs:check\`
- [ ] \`pnpm check\`
- [ ] 适用时运行 migration、build 和 E2E 验证。

## 状态记录

| 时间 | 状态 | 说明 |
| --- | --- | --- |
| ${date} | 草稿 | 脚手架创建，等待规格确认 |

## 准出条件

- [ ] 所有验收标准有证据。
- [ ] 适用检查通过，未执行项说明原因。
- [ ] Plan 状态和最终设计已更新。
`,
  ],
])

const collisions = [...files.keys()].filter((path) => existsSync(resolve(repositoryRoot, path)))
if (collisions.length > 0) {
  console.error('Refusing to overwrite existing files:')
  for (const path of collisions) console.error(`- ${path}`)
  process.exit(1)
}

console.log(dryRun ? 'Would create:' : 'Creating:')
for (const path of files.keys()) console.log(`- ${path}`)

if (!dryRun) {
  for (const [path, content] of files) {
    const absolutePath = resolve(repositoryRoot, path)
    mkdirSync(resolve(absolutePath, '..'), { recursive: true })
    writeFileSync(absolutePath, content, 'utf8')
  }
}

console.log('')
console.log(
  'Next: complete the Feature and Plan, then add route/API/schema/tests only as required.',
)
console.log(
  'Registration checklist: src/server/api/index.ts, src/config/navigation.ts, route page,',
)
console.log('tests, and affected docs/designs artifacts.')
