import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { dashboardNavigation } from '@/config/navigation'
import { siteConfig } from '@/config/site'

export function DashboardScreen() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="space-y-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-primary">
              {siteConfig.name} 工作台
            </h1>
            <p className="text-xl text-muted-foreground">从实际可用的参考功能开始探索和扩展模板</p>
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
                    className="group rounded-2xl border border-border/40 bg-card p-6 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="font-semibold">{item.label}</h2>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                )
              })}
          </div>

          <div className="rounded-2xl bg-muted/30 p-6 text-sm leading-6 text-muted-foreground">
            tasks 是模板的参考纵向切片。新增功能时，可以沿用数据库、API、 module
            和页面入口的组织方式。
          </div>
        </div>
      </div>
    </div>
  )
}
