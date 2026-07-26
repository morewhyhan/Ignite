# 数据库标准

- 当前数据模型真源是 `prisma/schema.prisma`。
- 已发布 migration 不得修改、重命名或删除，只能追加新的具名 migration。
- 新 schema 变化必须审查生成 SQL，并运行 `pnpm test:migrations`。
- Better Auth schema 变化必须先运行锁定版本的 `pnpm auth:schema`，再审查 Prisma
  diff 和 migration。
- SQLite 只作为本地默认值；切换生产 provider 必须同步 schema、migration、驱动和部署流程。
- 未经明确许可，不执行 `prisma migrate reset` 或删除数据库。
