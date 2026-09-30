import { FileText, Folder, GitBranch, ListChecks, ShieldCheck } from 'lucide-react'

const treeEntries = [
  { name: 'Ignite/', note: '模板根目录', depth: 0, kind: 'folder' },
  { name: 'AGENTS.md', note: '所有 AI 共用的项目规则入口', depth: 1, kind: 'file' },
  { name: '.ai/', note: '项目 Skills、MCP 与真源登记', depth: 1, kind: 'folder' },
  { name: 'docs/', note: '需求、规范、计划与设计文档', depth: 1, kind: 'folder' },
  { name: 'README.md', note: '文档系统索引', depth: 2, kind: 'file' },
  { name: 'standards/', note: '长期工程规则', depth: 2, kind: 'folder' },
  { name: 'features/', note: '需求与验收标准', depth: 2, kind: 'folder' },
  { name: 'plans/', note: '本轮计划与任务状态', depth: 2, kind: 'folder' },
  { name: 'designs/', note: '系统当前事实', depth: 2, kind: 'folder' },
  { name: 'others/', note: 'ADR、测试路径等补充记录', depth: 2, kind: 'folder' },
] as const

const structureBenefits = [
  {
    icon: ShieldCheck,
    title: '规则只维护一份',
    detail: '所有 AI 从 AGENTS.md 读取同一套项目规则，工具配置只负责接入。',
  },
  {
    icon: ListChecks,
    title: '每类文档各司其职',
    detail: '标准管约束，Feature 定目标，Plan 管本轮，Design 记录系统现状。',
  },
  {
    icon: GitBranch,
    title: '每轮都能接着做',
    detail: '按验收结果更新当前设计，让下一轮 AI 从已确认的事实继续。',
  },
] as const

export function DocumentSystemMap() {
  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <section
        aria-labelledby="project-tree-title"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <Folder aria-hidden="true" className="h-5 w-5 text-primary" />
          <h3 id="project-tree-title" className="text-lg font-semibold tracking-tight">
            目录结构
          </h3>
        </div>

        <ul aria-label="Ignite 项目文档目录" className="mt-5 space-y-2.5">
          {treeEntries.map((entry) => {
            const Icon = entry.kind === 'folder' ? Folder : FileText
            const indentClass = entry.depth === 0 ? 'pl-0' : entry.depth === 1 ? 'pl-5' : 'pl-10'

            return (
              <li
                key={entry.name}
                className={`grid grid-cols-[minmax(7.5rem,auto)_1fr] items-center gap-x-3 gap-y-0.5 sm:grid-cols-[minmax(7.5rem,auto)_1fr] ${indentClass}`}
              >
                <span
                  className={`inline-flex items-center gap-2 font-mono text-[13px] ${
                    entry.depth === 0 ? 'font-semibold text-foreground' : 'text-foreground/85'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 ${
                      entry.kind === 'folder' ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  {entry.name}
                </span>
                <span className="text-xs leading-5 text-muted-foreground">{entry.note}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="structure-benefits-title" className="pt-1">
        <h3
          id="structure-benefits-title"
          className="mb-4 text-lg font-semibold tracking-tight sm:text-xl"
        >
          结构清楚，后续修改才不费劲
        </h3>
        <ul className="space-y-3">
          {structureBenefits.map(({ icon: Icon, title, detail }) => (
            <li
              key={title}
              className="flex gap-3 rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-semibold">{title}</h4>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
