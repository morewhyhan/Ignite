import { ArrowRight, FileCheck2, FileText, LibraryBig, ShieldCheck } from 'lucide-react'

const documentFlow = [
  {
    number: '01',
    title: 'Feature',
    path: 'docs/features/',
    question: '要解决什么问题？',
    detail: '用户目标与验收标准',
  },
  {
    number: '02',
    title: 'Plan',
    path: 'docs/plans/',
    question: '这一轮怎么交付？',
    detail: '范围、任务与过程状态',
  },
  {
    number: '03',
    title: 'Test + Code',
    path: 'tests/ · src/',
    question: '先验证，再实现',
    detail: '可执行测试与实际代码',
  },
  {
    number: '04',
    title: 'Verify',
    path: '验收证据',
    question: '结果达到目标了吗？',
    detail: '按验收标准运行检查',
  },
  {
    number: '05',
    title: 'Design',
    path: 'docs/designs/',
    question: '系统现在是什么？',
    detail: '更新当前事实，接续下一轮',
  },
] as const

export function DocumentSystemMap() {
  return (
    <div className="mt-10 space-y-6">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-4 bg-card p-4 sm:p-5">
          <span className="shrink-0 rounded-lg bg-foreground px-3 py-2 font-mono text-xs font-semibold text-background">
            AGENTS.md
          </span>
          <div>
            <p className="text-sm font-semibold">所有 AI 工具共用的执行入口</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              工具专属配置只做桥接，不维护第二套项目规则。
            </p>
          </div>
        </div>
        <div className="hidden items-center justify-center bg-card px-2 sm:flex">
          <ArrowRight aria-hidden="true" className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-center gap-4 bg-card p-4 sm:p-5">
          <span className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">docs/standards/ · 长期规则</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              架构、API、安全与开发规范，贯穿每一轮工作。
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <p className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground">
          一轮开发，文档这样流转
        </p>
        <span className="h-px flex-1 bg-border" />
      </div>

      <ol
        aria-label="从需求到当前系统事实的文档流转"
        className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5"
      >
        {documentFlow.map((step, index) => (
          <li
            key={step.number}
            className="relative flex min-h-32 flex-col rounded-2xl border border-border bg-card p-4 sm:min-h-36"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold tabular-nums text-primary">{step.number}</span>
              <code className="text-[10px] font-medium text-muted-foreground">{step.path}</code>
            </div>
            <h3 className="mt-3 text-base font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-1 text-xs font-medium text-foreground">{step.question}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p>
            {index < documentFlow.length - 1 ? (
              <ArrowRight
                aria-hidden="true"
                className="absolute -right-2.5 top-6 z-10 hidden h-5 w-5 rounded-full bg-background p-0.5 text-primary xl:block"
              />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-primary/25 bg-primary/[0.035] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <FileText aria-hidden="true" className="h-4 w-4" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Plan · 过程方案
            </p>
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight">记下“这一轮怎么做、做到哪”</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            每个独立交付有自己的计划和状态记录。它保留本轮过程，不代表系统此刻的最终样子。
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-foreground/5 p-2 text-foreground">
              <FileCheck2 aria-hidden="true" className="h-4 w-4" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Design · 当前事实
            </p>
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight">
            记下“验收后，系统现在是什么”
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            完成后更新数据库、API 和系统设计现状，供下一轮理解与计划；实现行为仍以源码、Schema
            和测试为准。
          </p>
        </article>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-muted p-2 text-muted-foreground">
            <LibraryBig aria-hidden="true" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">docs/others/ · 补充记录</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              ADR、人工可读的用户路径/测试用例和发布记录；可执行测试仍放在 tests/。
            </p>
          </div>
        </div>
        <p className="max-w-md text-xs leading-5 text-muted-foreground sm:text-right">
          <code className="font-medium">.ai/</code> 登记项目的 Skills / MCP；各工具配置引用同一份{' '}
          <code className="font-medium">AGENTS.md</code>。
        </p>
      </div>
    </div>
  )
}
