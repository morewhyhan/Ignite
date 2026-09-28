'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Pin, PinOff } from 'lucide-react'
import { dashboardNavigation } from '@/config/navigation'
import { siteConfig } from '@/config/site'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isManualExpanded, setIsManualExpanded] = useState(false)

  const handleMouseEnter = () => {
    if (isCollapsed && !isManualExpanded) {
      setIsCollapsed(false)
    }
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isManualExpanded) return

    const relatedTarget = e.relatedTarget as HTMLElement
    if (relatedTarget && !isCollapsed) {
      const mainContent = relatedTarget.closest('#main-content') as HTMLElement
      if (mainContent) {
        setIsCollapsed(true)
      }
    }
  }

  const handleButtonClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false)
      setIsManualExpanded(true)
    } else if (!isManualExpanded) {
      setIsManualExpanded(true)
    } else {
      setIsCollapsed(true)
      setIsManualExpanded(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 左侧导航 */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] border-r border-border bg-card
          transform transition-all duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="flex flex-col h-full py-6">
          {/* 导航 */}
          <nav id="dashboard-navigation" className="flex-1 space-y-1 px-3">
            {dashboardNavigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md
                    transition-colors duration-150 relative
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={`
                      text-sm font-medium whitespace-nowrap overflow-hidden
                      transition-opacity duration-150
                      ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                    `}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-primary rounded-r-full" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* 固定在左下角的收缩按钮 */}
      <button
        onClick={handleButtonClick}
        className="hidden lg:flex fixed bottom-6 left-6 z-50 items-center justify-center w-10 h-10 bg-card border border-border/20 rounded-lg shadow-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
        title={isManualExpanded ? '取消固定' : !isCollapsed ? '固定' : '展开'}
      >
        {!isCollapsed ? <Pin className="h-5 w-5" /> : <PinOff className="h-5 w-5" />}
      </button>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="关闭导航菜单"
          className="fixed inset-0 z-30 cursor-default bg-slate-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 顶部工具栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-16 px-6 lg:px-8">
          {/* 左侧：Logo */}
          <Link href="/" className="text-xl font-semibold tracking-tight">
            {siteConfig.name}
          </Link>

          {/* 右侧：头像 */}
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60" />
          </Link>
        </div>
      </div>

      {/* 主内容区 */}
      <div
        id="main-content"
        className={`min-w-0 flex-1 transition-[margin] duration-200 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
      >
        {/* 移动端顶部栏 */}
        <header className="mt-16 flex items-center justify-between border-b border-border px-5 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="打开导航菜单"
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-navigation"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            <Menu aria-hidden="true" className="h-4 w-4" />
            导航
          </button>
        </header>

        {/* 内容 */}
        <main className="mt-0 lg:mt-16">{children}</main>
      </div>
    </div>
  )
}
