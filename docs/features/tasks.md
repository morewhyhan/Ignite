# Tasks 参考模块

## 背景与目标

Tasks 是仓库当前可运行的参考纵向切片。它说明需求如何连接数据库、API、Hook、页面和测试；新增真实业务时应复制工程不变量，不机械复制任务语义。

## 模块边界

- 类型：存量模板示例；采用时必须明确保留、改造或删除。
- 数据模型：`prisma/schema.prisma` 的 `task`
- API：`src/server/api/routes/tasks/index.ts`
- 客户端状态：`src/modules/tasks/hooks/use-tasks.ts`
- 界面：`src/modules/tasks/components/tasks-screen.tsx`
- 页面入口：`src/app/dashboard/tasks/page.tsx`
- 导航注册：`src/config/navigation.ts`

## 字段清单

| 字段        | 类型     | 必填 | 默认值       | 校验               | UI 展示         | 数据来源       |
| ----------- | -------- | ---- | ------------ | ------------------ | --------------- | -------------- |
| `id`        | UUID     | 是   | 服务端生成   | 合法 UUID          | 不直接展示      | Prisma         |
| `title`     | string   | 是   | 无           | trim 后 1–200 字符 | 列表和编辑器    | 用户输入       |
| `completed` | boolean  | 否   | `false`      | boolean            | 复选框/状态分组 | 用户操作       |
| `userId`    | UUID     | 是   | 当前 session | 不接受客户端输入   | 不展示          | 服务端 session |
| `createdAt` | datetime | 是   | 当前时间     | 服务端生成         | 排序依据        | Prisma         |
| `updatedAt` | datetime | 是   | 自动更新     | 服务端生成         | 不直接展示      | Prisma         |

## API 行为

| 操作 | 方法   | 路径             | 成功结果                      |
| ---- | ------ | ---------------- | ----------------------------- |
| 列表 | GET    | `/api/tasks`     | 当前用户任务，按创建时间倒序  |
| 创建 | POST   | `/api/tasks`     | 新建任务，服务端写入 `userId` |
| 更新 | PUT    | `/api/tasks/:id` | 更新标题或完成状态            |
| 删除 | DELETE | `/api/tasks/:id` | 删除当前用户任务              |

## 业务规则

- R1：用户只能读取自己的任务。
- R2：创建任务时 `userId` 只能来自服务端 session。
- R3：标题 trim 后不能为空且不能超过 200 字符。
- R4：更新至少包含 `title` 或 `completed` 之一，未知字段返回 `422`。
- R5：更新或删除非本人任务统一返回 `404`，不泄露资源是否存在。
- R6：列表按 `createdAt` 倒序返回。

## 原型与交互

- 当前没有外部原型，以 `/dashboard/tasks` 的可执行页面和 [`../designs/design.md`](../designs/design.md) 为准。
- 页面必须覆盖 loading、error、empty、待完成列表和已完成列表状态。
- 删除操作必须有明确可识别的操作入口，mutation 成功后同步缓存。

## 验收标准

- Given 未登录用户 When 访问任务页面 Then 应跳转到首页。
- Given 已登录用户 When 创建任务 Then 任务只属于当前用户并出现在列表中。
- Given 用户访问其他用户任务 When 更新或删除 Then 返回 `404`。
- Given 输入不合法 When 调用 API Then 返回 `422`。

## 实现与设计映射

- 当前设计：[`../designs/api.md`](../designs/api.md)、[`../designs/database.md`](../designs/database.md)
- API 测试：`tests/api/tasks.test.ts`
- E2E：`tests/e2e/tasks.spec.ts`
