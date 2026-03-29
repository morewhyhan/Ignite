# Hono API 开发入门

> 了解如何在这个项目中编写后端接口

## 什么是 Hono？

Hono 是一个轻量级的后端框架，用于处理 HTTP 请求和返回数据。它就像一个"服务员"，接收前端发来的请求，处理后返回结果。

**为什么用 Hono？**
- **轻量快速**：性能优秀，启动快
- **类型安全**：与 TypeScript 完美配合，自动推导类型
- **语法简洁**：代码量少，易读易维护
- **与 Next.js 完美配合**：可以在同一个项目中运行

**简单理解**：
- 前端发送请求 → Hono 接收 → 操作数据库 → 返回结果

---

## API 路由在哪里？

```
server/
├── api/
│   ├── index.ts              # 主入口，注册所有路由
│   ├── validator.ts          # 数据验证工具
│   └── routes/
│       ├── tasks/
│       │   └── index.ts      # 任务相关 API
│       └── (其他功能路由)
```

**工作流程**：
1. 在 `routes/` 下创建路由文件
2. 在 `index.ts` 中注册路由
3. 前端通过 `/api/xxx` 访问

---

## 基础路由结构

打开任意路由文件，你会看到这样的结构：

```typescript
import { Hono } from 'hono'
import { zValidator } from '@/server/api/validator'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// 创建应用，设置基础路径
const app = new Hono().basePath('/tasks')

// 获取当前用户 ID 的辅助函数
async function getUserId(c: any) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  return session?.user?.id || null
}

export default app
```

**为什么这样设计？**
- `basePath('/tasks')` - 所有路由都以 `/api/tasks` 开头
- `getUserId` - 获取当前登录用户，确保数据隔离
- `auth.api.getSession` - 从请求头中获取用户信息

---

## HTTP 方法（请求类型）

### GET - 获取数据

```typescript
app.get('/', async (c) => {
  const userId = await getUserId(c)

  // 验证登录
  if (!userId) {
    return c.json({ error: '请先登录' }, 401)
  }

  // 查询数据库
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  // 返回数据
  return c.json({ data: tasks })
})
```

**为什么这样写？**
- 先验证用户是否登录（安全）
- 只查询属于当前用户的数据（数据隔离）
- 按时间倒序排列（最新的在前）
- 统一返回格式 `{ data: ... }`

### POST - 创建数据

```typescript
app.post('/', zValidator('json', z.object({
  title: z.string().min(1),
})), async (c) => {
  const userId = await getUserId(c)
  const { title } = c.req.valid('json')

  // 创建数据
  const task = await prisma.task.create({
    data: { title, userId }
  })

  return c.json({ data: task })
})
```

**为什么需要验证？**
- `zValidator` - 使用 Zod 验证请求数据
- `z.string().min(1)` - 确保标题是非空字符串
- 验证失败自动返回 400 错误
- 避免无效数据进入数据库

### PUT - 更新数据

```typescript
app.put('/:id', zValidator('json', z.object({
  title: z.string().optional(),
  completed: z.boolean().optional(),
})), async (c) => {
  const userId = await getUserId(c)
  const id = c.req.param('id')

  // 验证所有权
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || task.userId !== userId) {
    return c.json({ error: '无权操作' }, 403)
  }

  // 更新数据
  const updated = await prisma.task.update({
    where: { id },
    data: c.req.valid('json')
  })

  return c.json({ data: updated })
})
```

**为什么需要验证所有权？**
- 防止用户修改别人的数据
- `findUnique` 先查询任务是否存在
- 比较 `task.userId` 确认是否是所有者

### DELETE - 删除数据

```typescript
app.delete('/:id', async (c) => {
  const userId = await getUserId(c)
  const id = c.req.param('id')

  // 验证所有权
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || task.userId !== userId) {
    return c.json({ error: '不存在' }, 404)
  }

  // 删除数据
  await prisma.task.delete({ where: { id } })

  return c.json({ success: true })
})
```

**为什么返回 404 而不是 403？**
- 安全考虑：不暴露数据存在性
- 如果返回 403，用户可以试探哪些 ID 存在
- 统一返回"不存在"更安全

---

## 路径参数

### 获取单个资源

```typescript
app.get('/:id', async (c) => {
  const id = c.req.param('id')  // 获取 URL 中的 id
  const task = await prisma.task.findUnique({
    where: { id }
  })

  if (!task) {
    return c.json({ error: '不存在' }, 404)
  }

  return c.json({ data: task })
})
```

**访问**：`GET /api/tasks/123`

**为什么用 `:id`？**
- `:id` 是动态参数，匹配任意值
- `c.req.param('id')` 获取参数值
- RESTful API 的标准做法

---

## 数据验证（Zod）

### 为什么需要验证？

防止错误数据进入数据库：
- 用户提交空字符串
- 类型错误（数字写成字符串）
- 必填字段缺失
- 恶意数据注入

### 常用验证规则

```typescript
z.object({
  // 必填字符串
  title: z.string(),

  // 可选字符串
  description: z.string().optional(),

  // 最小长度
  title: z.string().min(1),

  // 数字范围
  age: z.number().min(0).max(150),

  // 枚举值
  status: z.enum(['pending', 'completed']),

  // 布尔值
  isActive: z.boolean().optional(),
})
```

### 完整示例

```typescript
app.post('/', zValidator('json', z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().optional(),
  priority: z.number().min(1).max(5).default(1),
})), async (c) => {
  const data = c.req.valid('json')  // 已验证的数据
  // ...
})
```

**为什么这样做？**
- 验证失败自动返回 400 错误
- 错误信息清晰（"标题不能为空"）
- `data` 已经是验证后的安全数据

---

## 返回数据格式

### 成功响应

```typescript
// 返回单条数据
return c.json({ data: task })

// 返回多条数据
return c.json({ data: tasks })

// 操作成功
return c.json({ success: true })
```

**为什么统一格式？**
- 前端处理更简单
- 易于维护和扩展
- 符合 RESTful 最佳实践

### 错误响应

```typescript
// 404 - 不存在
return c.json({ error: '任务不存在' }, 404)

// 401 - 未登录
return c.json({ error: '请先登录' }, 401)

// 403 - 无权限
return c.json({ error: '无权访问' }, 403)

// 400 - 请求错误
return c.json({ error: '参数错误' }, 400)
```

### HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | 成功 | 默认成功响应 |
| 201 | 已创建 | POST 创建成功 |
| 400 | 请求错误 | 参数验证失败 |
| 401 | 未登录 | 需要登录 |
| 403 | 禁止访问 | 登录了但无权限 |
| 404 | 不存在 | 资源不存在 |

---

## 注册路由

### 1. 创建路由文件

在 `server/api/routes/notes/` 下创建 `index.ts`：

```typescript
import { Hono } from 'hono'

const app = new Hono().basePath('/notes')

app.get('/', async (c) => {
  return c.json({ data: [] })
})

export default app
```

### 2. 在主入口注册

打开 `server/api/index.ts`：

```typescript
import notesRoute from './routes/notes'

// 添加到路由链
const routes = app.route('/', tasksRoute).route('/', notesRoute)
```

**完成！** 现在 `/api/notes` 路由已注册。

---

## 完整示例：评论 API

```typescript
import { Hono } from 'hono'
import { zValidator } from '@/server/api/validator'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const app = new Hono().basePath('/comments')

// 获取当前用户
async function getUserId(c: any) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  return session?.user?.id || null
}

// 获取评论列表
app.get('/', async (c) => {
  const userId = await getUserId(c)
  if (!userId) return c.json({ error: '请先登录' }, 401)

  const comments = await prisma.comment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  return c.json({ data: comments })
})

// 创建评论
app.post('/', zValidator('json', z.object({
  content: z.string().min(1, '内容不能为空'),
  postId: z.string(),
})), async (c) => {
  const userId = await getUserId(c)
  if (!userId) return c.json({ error: '请先登录' }, 401)

  const { content, postId } = c.req.valid('json')

  const comment = await prisma.comment.create({
    data: { content, postId, userId }
  })

  return c.json({ data: comment })
})

// 删除评论
app.delete('/:id', async (c) => {
  const userId = await getUserId(c)
  const id = c.req.param('id')

  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment || comment.userId !== userId) {
    return c.json({ error: '不存在' }, 404)
  }

  await prisma.comment.delete({ where: { id } })

  return c.json({ success: true })
})

export default app
```

---

## 安全最佳实践

### 1. 始终验证用户身份

```typescript
const userId = await getUserId(c)
if (!userId) {
  return c.json({ error: '请先登录' }, 401)
}
```

### 2. 验证数据所有权

```typescript
const item = await prisma.item.findUnique({ where: { id } })
if (!item || item.userId !== userId) {
  return c.json({ error: '不存在' }, 404)
}
```

### 3. 使用 Zod 验证输入

```typescript
app.post('/', zValidator('json', z.object({
  // ... 验证规则
})), async (c) => {
  // c.req.valid('json') 已经是验证过的数据
})
```

### 4. 不要暴露敏感信息

```typescript
// ❌ 不好
return c.json({ error: `ID ${id} 不存在` })

// ✅ 好
return c.json({ error: '不存在' }, 404)
```

---

## 常见问题

**Q: API 返回 404？**
→ 检查路由是否在 `server/api/index.ts` 中注册

**Q: 获取不到用户信息？**
→ 检查前端请求是否包含 credentials
→ 检查 `auth.api.getSession` 是否正确调用

**Q: 验证失败但看不到具体错误？**
→ Zod 验证失败会自动返回 400
→ 在浏览器 Network 标签查看响应

**Q: 如何调试 API？**
→ 使用 `pnpm prisma studio` 查看数据库
→ 在浏览器 Network 标签查看请求/响应
→ 使用 `console.log` 打印数据

---

## 总结

**Hono 的核心价值**：
1. **类型安全** - 与 TypeScript 完美配合
2. **简洁高效** - 代码量少，易维护
3. **数据验证** - Zod 防止无效数据
4. **安全可靠** - 用户隔离和权限验证

**记住这几点**：
- 每个路由都要验证用户身份
- 修改数据前验证所有权
- 使用 Zod 验证请求数据
- 统一返回格式 `{ data: ... }`
- 正确使用 HTTP 状态码
