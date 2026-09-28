import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { dashboardNavigation } from '@/config/navigation'
import { siteConfig } from '@/config/site'

export function DashboardScreen() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 py-9 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="space-y-9 sm:space-y-11">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-medium text-primary">{siteConfig.name} / 工作台</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">从这里开始扩展</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              从实际可用的参考功能开始探索和扩展模板。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {dashboardNavigation
              .filter((item) => item.showOnDashboard)
              .map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-card sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="font-semibold">{item.label}</h2>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        aria-hidden="true"
                        className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1"
                      />
                    </div>
                  </Link>
                )
              })}
          </div>

          <div className="rounded-xl border border-border bg-card px-5 py-4 text-sm leading-6 text-muted-foreground">
            <span className="font-medium text-foreground">参考业务：</span> Tasks
            是模板的完整纵向切片。新增功能时，可以沿用模块、Hook、RPC、数据库和页面入口的组织方式。
          </div>
        </div>
      </div>
    </div>
  )
}
