# Next.js 页面开发入门

> 了解如何在这个项目中编写前端页面

## 什么是 Next.js？

Next.js 是一个 React 框架，让你用 React 写网页，但它帮你处理了很多复杂的事情。

**为什么用 Next.js？**
- **文件即路由** - 创建文件就是创建页面，不需要配置路由
- **服务端渲染** - SEO 友好，首屏加载快
- **API 路由** - 前后端在同一个项目
- **自动代码分割** - 只加载需要的代码
- **零配置** - 开箱即用

**简单理解**：
- React 是基础库（像乐高积木）
- Next.js 是完整套装（像乐高城堡套装）

---

## 页面文件在哪里？

```
app/
├── page.tsx              # 首页 (/)
├── layout.tsx            # 全局布局（包裹所有页面）
├── providers.tsx         # 全局 Provider（主题、toast 等）
├── globals.css           # 全局样式
├── login/
│   └── page.tsx          # 登录页 (/login)
└── dashboard/
    ├── layout.tsx        # 后台布局（导航栏 + 侧边栏）
    ├── page.tsx          # 后台首页 (/dashboard)
    ├── tasks/
    │   └── page.tsx      # 任务页 (/dashboard/tasks)
    └── settings/
        └── page.tsx      # 设置页 (/dashboard/settings)
```

**重要规则**：
- 文件名必须是 `page.tsx`
- 文件夹名就是 URL 路径
- `app/page.tsx` 是首页

---

## 文件即路由

### 路由规则

```
文件位置                   →  访问 URL
app/page.tsx              →  http://localhost:3000
app/login/page.tsx        →  http://localhost:3000/login
app/dashboard/page.tsx    →  http://localhost:3000/dashboard
app/dashboard/tasks/page.tsx →  http://localhost:3000/dashboard/tasks
```

### 创建新页面

**创建"笔记"页面**：

1. 创建文件夹：`app/dashboard/notes/`
2. 创建文件：`app/dashboard/notes/page.tsx`
3. 访问：`http://localhost:3000/dashboard/notes`

**为什么这样设计？**
- 直观：看到文件就知道 URL
- 简单：不需要配置路由文件
- 自动：创建文件就自动注册路由

---

## 服务端组件 vs 客户端组件

### 服务端组件（默认）

```typescript
// 默认：服务端组件
export default function Page() {
  return <div>内容</div>
}
```

**特点**：
- 在服务器上渲染
- 不能使用 useState、useEffect
- 不能使用事件处理（onClick）
- 性能好，SEO 友好
- 不需要下载 JavaScript 到浏览器

**什么时候用？**
- 显示静态内容（文章、列表）
- 从数据库获取数据（不需要用户交互）
- SEO 重要的页面

**为什么默认用服务端？**
- 更快的首屏加载
- 更好的 SEO
- 更少的 JavaScript 下载

### 客户端组件

```typescript
'use client'

export default function Page() {
  const [count, setCount] = useState(0)
  return <div onClick={() => setCount(count + 1)}>{count}</div>
}
```

**特点**：
- 在浏览器中运行
- 可以使用 React Hooks
- 可以处理用户交互
- 需要下载 JavaScript

**什么时候用？**
- 需要用户交互（点击、输入）
- 使用 useState、useEffect
- 使用浏览器 API（localStorage）

### 判断流程

```
需要用户交互？
├── 是 → 加 'use client'
└── 否 → 默认（服务端）
```

---

## layout.tsx - 共享布局

### 作用

layout.tsx 里的内容会包裹它下面所有页面。

```
app/
├── layout.tsx        → 所有页面的外层布局
├── page.tsx          → 首页
└── dashboard/
    ├── layout.tsx    → dashboard 下的外层布局
    └── page.tsx      → dashboard 首页
```

### 全局布局（app/layout.tsx）

```typescript
import { ThemeProvider } from 'your-theme'
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**为什么需要全局布局？**
- 所有页面都需要的主题（亮色/暗色）
- 全局组件（toast 提示）
- 全局样式
- HTML 结构

### 子布局（app/dashboard/layout.tsx）

```typescript
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />      {/* 左侧导航栏 */}
      <main>{children}</main>  {/* 页面内容 */}
    </div>
  )
}
```

**为什么需要子布局？**
- 只影响 dashboard 下的页面
- 后台特定的布局（导航栏）
- 嵌套布局可以组合

---

## 页面组件结构

### 基础页面

```typescript
export default function TasksPage() {
  return (
    <div>
      <h1>任务清单</h1>
      <p>这是任务页面</p>
    </div>
  )
}
```

### 带数据的页面

```typescript
'use client'

import { useTasks } from '@/hooks/use-tasks'

export default function TasksPage() {
  const { data, isLoading } = useTasks()

  if (isLoading) return <div>加载中...</div>

  const tasks = data?.data || []

  return (
    <div>
      <h1>任务清单</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

**为什么需要 `'use client'`？**
- 使用了 Hook（`useTasks`）
- Hook 只能在客户端组件中使用
- 需要响应数据变化

### 带表单的页面

```typescript
'use client'

import { useState } from 'react'
import { useCreateTask } from '@/hooks/use-tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CreateTaskPage() {
  const [title, setTitle] = useState('')
  const createTask = useCreateTask()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    createTask.mutate({ title })
    setTitle('')
  }

  return (
    <div>
      <h1>创建任务</h1>
      <form onSubmit={handleSubmit}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="任务名称"
        />
        <Button type="submit" disabled={createTask.isPending}>
          创建
        </Button>
      </form>
    </div>
  )
}
```

**为什么用 `e.preventDefault()`？**
- 阻止表单默认提交行为
- 防止页面刷新
- 我们要用自己的逻辑处理

---

## 页面导航

### Link 组件（推荐）

```typescript
import Link from 'next/link'

<Link href="/dashboard/tasks">任务清单</Link>
```

**为什么用 Link？**
- 自动预加载（鼠标悬停时）
- 客户端跳转（不刷新页面）
- 性能好
- 维护页面状态

### useRouter 编程式跳转

```typescript
'use client'

import { useRouter } from 'next/navigation'

export default function Button() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard/tasks')  // 跳转
    router.back()                    // 返回上一页
    router.refresh()                 // 刷新页面
  }

  return <button onClick={handleClick}>跳转</button>
}
```

**什么时候用 useRouter？**
- 需要在操作后跳转（登录成功）
- 需要返回上一页
- 需要刷新页面

---

## 添加到导航栏

### 导航栏在哪里？

**文件位置**：`app/dashboard/layout.tsx`

### 添加新导航项

```typescript
import { FileText } from 'lucide-react'  // 1. 导入图标

const navItems = [
  { href: '/dashboard', label: '总览', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: '任务清单', icon: CheckSquare },
  // 2. 添加新导航项
  { href: '/dashboard/notes', label: '我的笔记', icon: FileText },
]
```

### 图标哪里来？

项目使用 `lucide-react` 图标库：
- 访问 https://lucide.dev/icons/
- 搜索图标名称
- 导入使用

```typescript
import { Search, Plus, Trash2, Home } from 'lucide-react'

<Home className="h-4 w-4" />
```

---

## 完整页面示例

```typescript
'use client'

import { useState } from 'react'
import { useTasks, useCreateTask, useDeleteTask } from '@/hooks/use-tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus } from 'lucide-react'

export default function TasksPage() {
  const [title, setTitle] = useState('')

  const { data, isLoading } = useTasks()
  const createTask = useCreateTask()
  const deleteTask = useDeleteTask()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    createTask.mutate({ title })
    setTitle('')
  }

  if (isLoading) return <div className="p-20">加载中...</div>

  const tasks = data?.data || []

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">任务清单</h1>

        {/* 创建表单 */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="要做什么..."
              disabled={createTask.isPending}
            />
            <Button
              type="submit"
              disabled={createTask.isPending || !title.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加任务
            </Button>
          </div>
        </form>

        {/* 任务列表 */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-card rounded-xl"
            >
              <span>{task.title}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask.mutate(task.id)}
                disabled={deleteTask.isPending}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            还没有任务，创建第一个吧！
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 常见模式

### 条件渲染

```typescript
{tasks.length > 0 && (
  <div>有任务时显示</div>
)}

{tasks.length === 0 && (
  <div>没有任务时显示</div>
)}

{isLoading ? (
  <div>加载中...</div>
) : (
  <div>加载完成</div>
)}
```

### 列表渲染

```typescript
{tasks.map((task) => (
  <div key={task.id}>
    {task.title}
  </div>
))}
```

**重要**：必须提供 `key` 属性！

### 样式类名

```typescript
// 基础类名
<div className="p-4 bg-white rounded-xl">

// 条件类名
<div className={`
  p-4 rounded-xl
  ${isActive ? 'bg-primary' : 'bg-muted'}
`}>
```

---

## 常见问题

**Q: 页面显示 404？**
- 检查文件是否在 `app/` 文件夹下
- 检查文件名是否是 `page.tsx`
- 重启开发服务器

**Q: 组件不更新？**
- 检查是否加了 `'use client'`
- 检查是否正确使用了 useState

**Q: 样式不生效？**
- 检查 Tailwind 类名是否正确
- 检查 `globals.css` 是否导入

**Q: 什么时候用服务端组件？**
- 只读内容用服务端
- 需要交互用客户端

**Q: 如何重定向？**
```typescript
import { redirect } from 'next/navigation'

export default function Page() {
  if (!isLoggedIn) {
    redirect('/login')  // 服务端重定向
  }
}
```

---

## 总结

**Next.js 的核心价值**：
1. **文件即路由** - 创建文件就是创建页面
2. **服务端组件** - 默认渲染在服务器，性能好
3. **布局系统** - layout.tsx 包裹页面，共享 UI
4. **零配置** - 开箱即用，不需要复杂配置

**记住这几点**：
- 文件名必须是 `page.tsx`
- 需要交互时加 `'use client'`
- `layout.tsx` 用于共享布局
- `Link` 组件用于导航
- `useRouter` 用于编程式跳转
