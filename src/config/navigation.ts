import { CheckSquare, Home, Settings, type LucideIcon } from 'lucide-react'

export type DashboardNavigationItem = {
  description: string
  href: string
  icon: LucideIcon
  label: string
  showOnDashboard: boolean
}

export const dashboardNavigation = [
  {
    href: '/dashboard',
    icon: Home,
    label: '概览',
    description: '返回工作台首页。',
    showOnDashboard: false,
  },
  {
    href: '/dashboard/tasks',
    icon: CheckSquare,
    label: '任务管理',
    description: '查看带鉴权、数据隔离和缓存更新的完整 CRUD 示例。',
    showOnDashboard: true,
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: '账户与外观',
    description: '查看当前账户、切换配色方案或安全退出登录。',
    showOnDashboard: true,
  },
] satisfies DashboardNavigationItem[]
