# Prisma 数据库入门

> 了解如何在这个项目中存储和管理数据

## 什么是 Prisma？

Prisma 是一个 ORM（对象关系映射）工具，让你用 TypeScript/JavaScript 代码来操作数据库，而不需要直接写 SQL 语句。

**为什么用 Prisma？**
- **类型安全**：自动生成类型定义，编辑器会自动补全，避免字段名写错
- **数据迁移**：修改数据库结构变得简单，不用手写 SQL
- **开发效率**：用对象的方式操作数据库，比写 SQL 直观

**简单理解**：就像你用 JavaScript 操作数组一样，Prisma 让你用 JavaScript 操作数据库。

---

## 数据库文件在哪里？

```
prisma/
├── schema.prisma      # 数据库结构定义（重要！）
└── migrations/        # 迁移历史记录

dev.db                 # SQLite 数据库文件（实际数据存储在这里）
```

**工作流程**：
1. 修改 `schema.prisma` 定义数据表
2. 运行 `pnpm prisma migrate dev` 应用修改
3. Prisma 自动生成类型和执行 SQL

---

## Schema 文件结构

打开 `prisma/schema.prisma`，你会看到：

```prisma
// 数据库提供者配置
datasource db {
  provider = "sqlite"      // 使用 SQLite（文件数据库）
  url      = env("DATABASE_URL")
}

// 数据表定义
model task {
  id        String   @id @default(uuid())    // 主键
  title     String                            // 任务标题
  completed Boolean  @default(false)          // 是否完成
  userId    String                            // 关联用户 ID
  createdAt DateTime @default(now())          // 创建时间
  updatedAt DateTime @updatedAt               // 自动更新时间

  // 关联关系
  user user @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**为什么这样设计？**
- `@id` - 每条记录需要唯一标识
- `@default(uuid())` - 自动生成唯一 ID，不用手动管理
- `@default(now())` - 创建时自动记录时间
- `@updatedAt` - 修改时自动更新，方便追踪
- `@relation` - 建立表之间的关联（如任务属于某个用户）
- `onDelete: Cascade` - 删除用户时，自动删除其所有任务（数据一致性）

---

## 常用字段类型

| Prisma 类型 | SQLite 实际类型 | 示例值 | 用途 |
|-------------|-----------------|--------|------|
| `String` | TEXT | `"hello"` | 文本内容（标题、描述等） |
| `Int` | INTEGER | `42` | 整数（数量、分数等） |
| `Boolean` | INTEGER (0/1) | `true/false` | 是/否状态 |
| `DateTime` | TEXT (ISO 8601) | `"2024-01-01T12:00:00Z"` | 时间记录 |
| `Float` | REAL | `3.14` | 小数（价格、评分等） |

**可选字段**（允许为空）：
```prisma
description String?    // 加了 ?，这个字段可以是 null
```

---

## 常用修饰符

### @id - 主键
```prisma
id String @id @default(uuid())
```
**为什么需要**：每条数据需要唯一标识，就像身份证号。`uuid()` 生成全局唯一 ID，避免冲突。

### @default - 默认值
```prisma
completed Boolean @default(false)
createdAt DateTime @default(now())
```
**为什么需要**：创建记录时自动填充，不用每次手动提供。

### @unique - 唯一约束
```prisma
email String @unique
```
**为什么需要**：确保字段值不重复。比如邮箱不能重复注册。

### @updatedAt - 自动更新
```prisma
updatedAt DateTime @updatedAt
```
**为什么需要**：每次修改记录时自动更新为当前时间，方便排序和追踪。

---

## 表关联（关系）

### 一对多关系

**场景**：一个用户有多个任务

```prisma
model user {
  id    String  @id @default(uuid())
  name  String
  tasks task[]  // 一个用户的多个任务（注意是复数）
}

model task {
  id      String @id @default(uuid())
  title   String
  userId  String              // 任务属于哪个用户
  user    user   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**为什么这样设计？**
1. `tasks task[]` - 表示一个用户有多个任务（数组）
2. `userId` - 在任务表存储用户 ID（外键）
3. `@relation` - 告诉 Prisma 这两个字段有关联
4. `onDelete: Cascade` - 删除用户时自动删除其任务，避免孤立数据

**使用时**：
```typescript
// 获取用户的所有任务
const userWithTasks = await prisma.user.findUnique({
  where: { id: userId },
  include: { tasks: true }
})

// 创建任务时自动关联用户
await prisma.task.create({
  data: {
    title: '新任务',
    userId: userId  // 通过 userId 关联
  }
})
```

---

## 数据迁移

### 什么是迁移？

迁移是数据库结构的版本控制。每次修改 schema 后，需要创建迁移来应用修改。

```bash
# 创建迁移
pnpm prisma migrate dev --name add_user_table

# 这个命令会：
# 1. 检查 schema.prisma 的变化
# 2. 生成对应的 SQL 语句
# 3. 执行 SQL 修改数据库
# 4. 生成 Prisma Client（类型定义）
```

**为什么需要迁移？**
- 记录数据库结构的每次修改
- 可以回滚到之前的版本
- 团队协作时保持数据库同步

### 查看数据库

```bash
pnpm prisma studio
```

打开一个可视化界面，可以：
- 查看所有表和数据
- 手动添加/修改/删除记录
- 方便调试

### 重置数据库

```bash
pnpm prisma migrate reset
```

**警告**：会删除所有数据！只在开发时使用。

---

## 代码中使用

### 导入 Prisma Client

```typescript
import { prisma } from '@/lib/db'
```

### CRUD 操作

```typescript
// Create - 创建
const task = await prisma.task.create({
  data: {
    title: '新任务',
    userId: 'user-id'
  }
})

// Read - 查询
const tasks = await prisma.task.findMany({
  where: { userId: 'user-id' },     // 过滤条件
  orderBy: { createdAt: 'desc' }     // 排序
})

// Update - 更新
const task = await prisma.task.update({
  where: { id: 'task-id' },
  data: { title: '新标题' }
})

// Delete - 删除
await prisma.task.delete({
  where: { id: 'task-id' }
})
```

**为什么这样写？**
- `findMany` 返回数组，`findUnique` 返回单个
- `where` 指定要操作哪条记录
- `data` 提供要修改的数据
- 所有操作都是异步的（需要 await）

---

## 添加新表的完整流程

**示例：添加一个"评论"功能**

### 1. 定义 Schema

在 `prisma/schema.prisma` 添加：

```prisma
model comment {
  id        String   @id @default(uuid())
  content   String
  userId    String
  taskId    String
  createdAt DateTime @default(now())

  user user @relation(fields: [userId], references: [id], onDelete: Cascade)
  task task @relation(fields: [taskId], references: [id], onDelete: Cascade)
}
```

同时在 `user` 和 `task` model 中添加：
```prisma
model user {
  // ... 其他字段
  comments comment[]    // 新增
}

model task {
  // ... 其他字段
  comments comment[]    // 新增
}
```

### 2. 创建迁移

```bash
pnpm prisma migrate dev --name add_comments
```

### 3. 在代码中使用

```typescript
// 创建评论
await prisma.comment.create({
  data: {
    content: '评论内容',
    userId: 'user-id',
    taskId: 'task-id'
  }
})

// 获取某个任务的所有评论
const comments = await prisma.comment.findMany({
  where: { taskId: 'task-id' }
})
```

---

## 常见问题

**Q: 修改 schema 后数据库没变化？**
→ 运行 `pnpm prisma migrate dev --name 描述`

**Q: 如何查看数据库内容？**
→ 运行 `pnpm prisma studio`

**Q: 迁移失败怎么办？**
```bash
rm dev.db                           # 删除数据库
pnpm prisma migrate dev              # 重新创建
```

**Q: 字段类型可以修改吗？**
→ 可以，但需要创建迁移。注意：删除字段会丢失数据。

---

## 总结

**Prisma 的核心价值**：
1. **类型安全** - 自动补全，减少错误
2. **迁移管理** - 安全地修改数据库结构
3. **关系映射** - 轻松处理表之间的关联
4. **开发体验** - 像操作对象一样操作数据库

**记住这几点**：
- 修改 `schema.prisma` → 运行 `migrate dev`
- 所有操作都要用 `await`
- 关系字段用 `@relation` 定义
- 删除数据考虑 `onDelete: Cascade`
