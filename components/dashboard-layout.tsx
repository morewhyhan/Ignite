'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, Settings, PanelLeftClose, PanelLeftOpen, Pin, PinOff } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: Home, label: '概览' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: '任务' },
  { href: '/dashboard/settings', icon: Settings, label: '设置' },
]

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
          fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-card/90 backdrop-blur-sm border-r border-border/20
          transform transition-all duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="flex flex-col h-full py-6">
          {/* 导航 */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
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
                    ${isActive
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
        {!isCollapsed ? (
          <Pin className="h-5 w-5" />
        ) : (
          <PinOff className="h-5 w-5" />
        )}
      </button>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 顶部工具栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center justify-between h-16 px-6 lg:px-8">
          {/* 左侧：Logo */}
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            HonoNext
          </Link>

          {/* 中间：搜索栏 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="搜索..."
                className="w-full px-4 py-2 pl-10 bg-muted/30 border border-border/30 rounded-full outline-none focus:border-primary/50 focus:bg-muted/50 transition-all text-sm placeholder:text-muted-foreground/50"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

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
        className="flex-1"
      >
        {/* 移动端顶部栏 */}
        <header className="lg:hidden flex items-center justify-between p-4 mt-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            菜单
          </button>
        </header>

        {/* 内容 */}
        <main className="mt-16">{children}</main>
      </div>
    </div>
  )
}
