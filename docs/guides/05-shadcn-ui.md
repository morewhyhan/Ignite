# shadcn/ui 组件库入门

> 了解如何在这个项目中使用 UI 组件

## 什么是 shadcn/ui？

shadcn/ui 不是一个传统的 npm 组件库，而是一个组件集合。

**核心区别**：
- 传统组件库（如 Material-UI）：安装 npm 包，引入使用
- shadcn/ui：复制代码到你的项目，完全掌控

**为什么用 shadcn/ui？**
- **代码在你手中** - 可以随意修改组件
- **无依赖锁死** - 不用担心库更新导致破坏性变更
- **类型安全** - 完全 TypeScript 支持
- **设计精美** - 基于 Radix UI + Tailwind CSS
- **可定制性强** - 修改样式就像修改自己的代码

**简单理解**：
- 不是"黑盒"，而是"白盒"
- 像从代码仓库复制粘贴，但更系统化

---

## 组件在哪里？

```
components/
├── ui/
│   ├── button.tsx          # 按钮组件
│   ├── input.tsx           # 输入框组件
│   ├── textarea.tsx        # 文本域组件
│   ├── (其他 UI 组件)
└── (业务组件)
```

**添加新组件**：
```bash
npx shadcn@latest add [组件名]
```

---

## 常用组件

### Button - 按钮

```typescript
import { Button } from '@/components/ui/button'

// 基础用法
<Button>点击我</Button>

// 不同样式
<Button variant="default">默认</Button>
<Button variant="secondary">次要</Button>
<Button variant="destructive">删除</Button>
<Button variant="outline">边框</Button>
<Button variant="ghost">幽灵</Button>
<Button variant="link">链接</Button>

// 不同尺寸
<Button size="sm">小按钮</Button>
<Button size="default">默认</Button>
<Button size="lg">大按钮</Button>
<Button size="icon">图标按钮</Button>

// 状态
<Button disabled>禁用</Button>
```

**为什么有这么多 variant？**
- `default` - 主要操作（提交、确认）
- `secondary` - 次要操作（取消）
- `destructive` - 危险操作（删除）
- `outline` - 不太重要的操作
- `ghost` - 背景中的操作（工具栏）
- `link` - 类似链接的操作

**图标按钮**：
```typescript
import { Trash2 } from 'lucide-react'

<Button variant="ghost" size="icon">
  <Trash2 className="h-4 w-4" />
</Button>
```

### Input - 输入框

```typescript
import { Input } from '@/components/ui/input'

// 基础用法
<Input placeholder="请输入..." />

// 不同类型
<Input type="text" placeholder="文本" />
<Input type="email" placeholder="邮箱" />
<Input type="password" placeholder="密码" />
<Input type="number" placeholder="数字" />

// 受控组件
const [value, setValue] = useState('')
<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="受控输入框"
/>

// 禁用
<Input disabled placeholder="禁用" />
```

**为什么需要受控组件？**
- 获取输入值
- 验证输入
- 控制输入行为
- 提交表单时使用

### Textarea - 文本域

```typescript
import { Textarea } from '@/components/ui/textarea'

// 基础用法
<Textarea placeholder="请输入内容..." />

// 自定义行数
<Textarea rows={5} placeholder="5 行高度" />

// 受控组件
const [value, setValue] = useState('')
<Textarea
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="受控文本域"
/>

// 禁用
<Textarea disabled placeholder="禁用" />
```

**为什么用 Textarea 而不是 Input？**
- 多行文本输入
- 长文本内容（评论、描述）
- 需要更大输入空间

---

## 图标

项目使用 `lucide-react` 图标库。

```bash
# 安装
npm install lucide-react
```

```typescript
import { Search, Plus, Trash2, Home, Settings } from 'lucide-react'

// 使用图标
<Search className="h-4 w-4" />
<Plus className="h-4 w-4 mr-2" />
<Trash2 className="h-4 w-4 text-red-500" />
```

**为什么用 lucide-react？**
- 轻量级（tree-shakeable）
- 一致的设计风格
- TypeScript 支持
- 图标丰富（1000+）

**常用图标大小**：
- `h-3 w-3` - 12px（极小）
- `h-4 w-4` - 16px（默认，推荐）
- `h-5 w-5` - 20px（中等）
- `h-6 w-6` - 24px（大）

**查找图标**：访问 https://lucide.dev/icons/

---

## 样式定制

### Tailwind 类名

shadcn/ui 基于 Tailwind CSS，可以直接用类名定制样式：

```typescript
// 基础样式
<Button className="bg-blue-500 hover:bg-blue-600">
  蓝色按钮
</Button>

// 圆角
<Button className="rounded-full">圆角按钮</Button>

// 尺寸
<Button className="w-full">全宽按钮</Button>
<Button className="h-12 px-8">大按钮</Button>

// 阴影
<Button className="shadow-lg">有阴影</Button>
```

### 常用样式类

| 类名 | 作用 | 示例 |
|------|------|------|
| `rounded-xl` | 大圆角 | `className="rounded-xl"` |
| `rounded-full` | 完全圆角 | `className="rounded-full"` |
| `shadow-lg` | 大阴影 | `className="shadow-lg"` |
| `hover:bg-muted` | 悬停背景 | `className="hover:bg-muted"` |
| `disabled:opacity-50` | 禁用透明度 | `className="disabled:opacity-50"` |
| `transition-all` | 过渡动画 | `className="transition-all"` |
| `w-full` | 全宽 | `className="w-full"` |
| `space-y-4` | 子元素垂直间距 | `className="space-y-4"` |

### 组合样式

```typescript
<Button className="
  bg-blue-500
  hover:bg-blue-600
  rounded-full
  shadow-lg
  transition-all
">
  组合样式按钮
</Button>
```

---

## 组合使用

### 表单组合

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

<form className="space-y-4">
  <Input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="标题"
  />
  <Textarea
    value={content}
    onChange={(e) => setContent(e.target.value)}
    placeholder="内容"
    className="min-h-[120px]"
  />
  <Button type="submit" className="w-full">
    <Plus className="h-4 w-4 mr-2" />
    创建
  </Button>
</form>
```

**为什么用 `space-y-4`？**
- 自动给子元素添加垂直间距
- 不用手动给每个元素加 margin
- 更易维护

### 列表项组合

```typescript
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'

{tasks.map((task) => (
  <div
    key={task.id}
    className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/20 hover:border-border/40 transition-all"
  >
    <span className="flex-1">{task.title}</span>
    <div className="flex gap-2">
      <Button variant="ghost" size="icon">
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  </div>
))}
```

---

## 项目规范

### 不要使用原生 HTML 元素

按照项目规范，应该使用 shadcn/ui 组件：

| ❌ 不要用 | ✅ 用这个 | 为什么？ |
|-----------|-----------|----------|
| `<button>` | `<Button />` | 统一样式，类型安全 |
| `<input>` | `<Input />` | 统一样式，内置验证 |
| `<textarea>` | `<Textarea />` | 统一样式，可定制 |
| `<select>` | `<Select />` | 更好的交互体验 |

**为什么不用原生元素？**
- 样式统一，不需要自己写 CSS
- 类型安全，编辑器自动补全
- 可访问性（ARIA）内置
- 维护性好，修改一处全部更新

### 正确使用方式

```typescript
// ❌ 不好
<button onClick={handleClick}>点击</button>
<input type="text" value={value} onChange={handleChange} />

// ✅ 好
<Button onClick={handleClick}>点击</Button>
<Input value={value} onChange={handleChange} />
```

---

## 添加新组件

### 使用 CLI（推荐）

```bash
# 添加单个组件
npx shadcn@latest add card

# 添加多个组件
npx shadcn@latest add card button dialog

# 查看所有可用组件
npx shadcn@latest add
```

**这个命令会做什么？**
1. 下载组件代码
2. 添加依赖（如果有）
3. 更新 `components/ui/` 文件夹
4. 更新 `components.json` 配置

### 手动添加

从 [shadcn/ui 官网](https://ui.shadcn.com/docs/components) 复制代码到 `components/ui/`。

**什么时候手动添加？**
- 需要自定义组件
- CLI 失败
- 想了解组件实现

---

## 常用组件列表

| 组件 | 用途 | 命令 |
|------|------|------|
| Button | 按钮 | `npx shadcn@latest add button` |
| Input | 输入框 | `npx shadcn@latest add input` |
| Textarea | 文本域 | `npx shadcn@latest add textarea` |
| Card | 卡片 | `npx shadcn@latest add card` |
| Dialog | 对话框 | `npx shadcn@latest add dialog` |
| Select | 下拉选择 | `npx shadcn@latest add select` |
| Checkbox | 复选框 | `npx shadcn@latest add checkbox` |
| Toast | 消息提示 | `npx shadcn@latest add sonner` |

---

## 完整示例

### 表单组件

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

export function TaskForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 提交逻辑
    console.log({ title, description })
    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          任务标题
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="要做什么..."
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          任务描述
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="详细描述..."
          className="min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!title.trim()}
      >
        <Plus className="h-4 w-4 mr-2" />
        创建任务
      </Button>
    </form>
  )
}
```

---

## 常见问题

**Q: 如何添加新组件？**
```bash
npx shadcn@latest add [组件名]
```

**Q: 组件样式不生效？**
- 检查 Tailwind 类名是否正确
- 检查 `globals.css` 是否导入
- 重启开发服务器

**Q: 如何修改组件样式？**
- 使用 `className` 添加自定义样式
- 或直接修改 `components/ui/` 下的文件

**Q: 组件不支持某个功能？**
- 直接复制组件代码到项目
- 随意修改添加功能
- 这是 shadcn/ui 的优势

**Q: 图标怎么用？**
```bash
npm install lucide-react
```
```typescript
import { Search } from 'lucide-react'
<Search className="h-4 w-4" />
```

**Q: 为什么不能用原生 HTML？**
- 样式不统一
- 缺少类型安全
- 缺少可访问性
- 不符合项目规范

---

## 总结

**shadcn/ui 的核心价值**：
1. **代码在你手中** - 可以随意修改
2. **类型安全** - 完全 TypeScript 支持
3. **设计统一** - 所有组件风格一致
4. **易于定制** - 修改样式就像修改自己的代码

**记住这几点**：
- 用 `npx shadcn@latest add` 添加组件
- 不要用原生 HTML 元素
- 用 Tailwind 类名定制样式
- 图标使用 lucide-react
- 直接修改 `components/ui/` 下的文件来定制组件
