# 数据库标准

- 当前数据模型真源是 `prisma/schema.prisma`。
- 已发布 migration 不得修改、重命名或删除，只能追加新的具名 migration。
- 新 schema 变化必须审查生成 SQL，并运行 `pnpm test:migrations`。
- 对已有数据的迁移还要从前一版本保留代表性记录执行升级；当前治理检查会对每个相邻 migration 边界注入样本行，并拒绝表结构重建后数据消失。涉及特定业务不变量时，仍须补对应迁移契约测试。
- Better Auth schema 变化必须先运行锁定版本的 `pnpm auth:schema`，再审查 Prisma
  diff 和 migration。
- SQLite 只作为本地默认值；切换生产 provider 必须同步 schema、migration、驱动和部署流程。
- 当前隔离验证能力集中在 `scripts/testing/database-adapter.mjs`；它明确只支持 SQLite。项目选择新 provider 时必须同步替换隔离库、迁移和数据比对能力；运行检查会拒绝未经适配的 provider，而不能通过删除数据库测试绕过。
- 未经明确许可，不执行 `prisma migrate reset` 或删除数据库。
