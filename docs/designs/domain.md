# 当前领域模型

> 状态：当前事实

Ignite 当前有认证域和 Tasks 参考业务域。认证域使用 Better Auth 的 `user`、`session`、`account` 和 `verification` 模型。`verification` 是兼容性预留，模板不发送验证邮件。Tasks 域由用户与任务的归属关系组成。字段、校验与用户行为分别见[认证规格](../features/auth.md)和[Tasks 规格](../features/tasks.md)。

首页、工作台、设置和主题选择是产品界面模块，不构成额外领域实体。Tasks 是可保留、改造或删除的参考切片，采用时由具体项目决定去留。

来源：docs/standards/specification-to-implementation-ddd.md §8 与 §9；实现见 src/modules。

## 关联需求

本文件描述认证与任务两个上下文的边界，对应 REQ-AUTH-001、REQ-AUTH-004、REQ-TASKS-001、REQ-TASKS-005。

## 领域与主导文档

| 领域           | 主导文档                                  | 模块入口          |
| -------------- | ----------------------------------------- | ----------------- |
| 认证           | [features/auth.md](../features/auth.md)   | src/modules/auth  |
| Tasks 参考业务 | [features/tasks.md](../features/tasks.md) | src/modules/tasks |

界面外壳不设领域文档：landing、dashboard、settings、theme 只在上表之外登记为界面模块。

| 界面模块   | 模块入口              |
| ---------- | --------------------- |
| 首页外壳   | src/modules/landing   |
| 工作台外壳 | src/modules/dashboard |
| 设置外壳   | src/modules/settings  |
| 主题选择   | src/modules/theme     |

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

- DES-DOMAIN-101：当前领域对象与不变量事实以本编号引用。

## 事件与命令

按 §9.3 的顺序记录。

| 已发生的变化   | 发起变化的请求   | 责任者     | 规则或策略               | 后续变化                   | 分歧和热点             |
| -------------- | ---------------- | ---------- | ------------------------ | -------------------------- | ---------------------- |
| 领域不变量变化 | 需求改变业务规则 | 领域维护者 | 不变量先写进文档再改代码 | 相关测试与下游模块同步更新 | 是否影响其它限界上下文 |
| 模块入口调整   | 模块拆分或合并   | 领域维护者 | 每个模块只暴露一个入口   | 调用方改为新入口           | 旧入口何时删除         |
