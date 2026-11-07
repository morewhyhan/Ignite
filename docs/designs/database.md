# 当前数据库设计

> 状态：当前事实

当前 provider 是 SQLite，本地连接由 `DATABASE_URL` 提供；生产默认拒绝 SQLite，单机低流量展示可通过 `ALLOW_PRODUCTION_SQLITE=true` 限定使用持久文件。其他生产切换数据库必须同步
Prisma provider、schema、migration 和部署流程。

当前核心实体：

```text
user 1 ─── n task
```

- `user`、`session`、`account`、`verification` 由 Better Auth 使用；`verification` 在模板中作为 schema 兼容性预留，不代表启用真实邮件验证。
- `task.userId` 是任务所有权字段。
- 任务查询、更新和删除必须包含当前 session 的 `userId`。
- 当前 migration 真源位于 `prisma/migrations/`。

来源：AGENTS.md 数据库与迁移一节；schema 见 prisma/schema.prisma。

## 表与索引

| 模型           | 关键字段                                          | 约束/索引                                       |
| -------------- | ------------------------------------------------- | ----------------------------------------------- |
| `user`         | `id`, `email`, `emailVerified`, `name`, `image`   | `email` unique                                  |
| `session`      | `id`, `userId`, `expiresAt`, `token`              | `token` unique，`userId` index                  |
| `account`      | `userId`, `accountId`, `providerId`, token fields | `providerId + accountId` unique，`userId` index |
| `verification` | `identifier`, `value`, `expiresAt`                | `identifier + value` unique                     |
| `task`         | `id`, `title`, `completed`, `userId`, timestamps  | `userId + createdAt` index                      |

完整字段和关系以 [`prisma/schema.prisma`](../../prisma/schema.prisma) 为准。

- DES-DB-101：当前数据模型与迁移事实以本编号引用。

## 事件与命令

按 §9.3 的顺序记录。

| 已发生的变化 | 发起变化的请求     | 责任者     | 规则或策略               | 后续变化                                  | 分歧和热点         |
| ------------ | ------------------ | ---------- | ------------------------ | ----------------------------------------- | ------------------ |
| 迁移被应用   | 修改 schema 的请求 | 数据维护者 | 已应用迁移不得重写或删除 | 生成具名 migration 并运行 test:migrations | 旧数据如何回填     |
| 数据归属变更 | 需求变更访问范围   | 数据维护者 | 私有资源无权访问返回 404 | 查询条件与索引同步调整                    | 跨组织数据是否迁移 |
