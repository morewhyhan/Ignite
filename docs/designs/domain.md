# 当前领域模型

Ignite 当前有认证域和 Tasks 参考业务域。认证域使用 Better Auth 的 `user`、`session`、`account` 和 `verification` 模型。`verification` 是兼容性预留，模板不发送验证邮件。Tasks 域由用户与任务的归属关系组成。字段、校验与用户行为分别见[认证规格](../features/auth.md)和[Tasks 规格](../features/tasks.md)。

首页、工作台、设置和主题选择是产品界面模块，不构成额外领域实体。Tasks 是可保留、改造或删除的参考切片，采用时由具体项目决定去留。

## 模块入口

| 当前能力       | 模块入口                                          | 页面入口                                                         |
| -------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| 认证           | [Auth](../../src/modules/auth/index.ts)           | 页面中的认证弹窗                                                 |
| Tasks 参考业务 | [Tasks](../../src/modules/tasks/index.ts)         | [/dashboard/tasks](../../src/app/dashboard/tasks/page.tsx)       |
| 首页外壳       | [Landing](../../src/modules/landing/index.ts)     | [/](../../src/app/page.tsx)                                      |
| 工作台外壳     | [Dashboard](../../src/modules/dashboard/index.ts) | [/dashboard](../../src/app/dashboard/page.tsx)                   |
| 设置外壳       | [Settings](../../src/modules/settings/index.ts)   | [/dashboard/settings](../../src/app/dashboard/settings/page.tsx) |
| 主题选择       | [Theme](../../src/modules/theme/index.ts)         | 由页面外壳引用                                                   |

路由壳在 [src/app](../../src/app/)。业务 API 的 `AppType` 从 [API 注册入口](../../src/server/api/index.ts) 导出，Tasks 路由在 [Tasks API](../../src/server/api/routes/tasks/index.ts)，认证是 [Better Auth](../../src/server/auth/index.ts) 的独立边界。数据库字段以 [Prisma schema](../../prisma/schema.prisma) 为准。当前的接口和关系说明见 [API 设计](./api.md)与[数据库设计](./database.md)。

```text
user
├─ session[]
├─ account[]
└─ task[]

verification  （Better Auth 兼容性预留的临时凭证表；模板默认不发送邮件）
```

## 领域不变量

- `user.email` 唯一。
- `task.userId` 必须指向现有用户。
- 用户只能读取、更新和删除自己的任务。
- `task.title` 创建时非空，长度 1–200 个字符。
- 任务更新至少包含 `title` 或 `completed` 其中一个字段。
- 删除用户时级联删除其 session、account 和 task。
