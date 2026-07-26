# 当前数据库设计

当前 provider 是 SQLite，本地连接由 `DATABASE_URL` 提供；生产切换数据库必须同步
Prisma provider、schema、migration 和部署流程。

当前核心实体：

```text
user 1 ─── n task
```

- `user`、`session`、`account`、`verification` 由 Better Auth 使用；`verification` 在模板中作为 schema 兼容性预留，不代表启用真实邮件验证。
- `task.userId` 是任务所有权字段。
- 任务查询、更新和删除必须包含当前 session 的 `userId`。
- 当前 migration 真源位于 `prisma/migrations/`。

## 表与索引

| 模型           | 关键字段                                          | 约束/索引                                       |
| -------------- | ------------------------------------------------- | ----------------------------------------------- |
| `user`         | `id`, `email`, `emailVerified`, `name`, `image`   | `email` unique                                  |
| `session`      | `id`, `userId`, `expiresAt`, `token`              | `token` unique，`userId` index                  |
| `account`      | `userId`, `accountId`, `providerId`, token fields | `providerId + accountId` unique，`userId` index |
| `verification` | `identifier`, `value`, `expiresAt`                | `identifier + value` unique                     |
| `task`         | `id`, `title`, `completed`, `userId`, timestamps  | `userId + createdAt` index                      |

完整字段和关系以 [`prisma/schema.prisma`](../../prisma/schema.prisma) 为准。
