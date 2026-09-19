# 数据库标准

- 当前数据模型真源是 `prisma/schema.prisma`。
- 已发布 migration 不得修改、重命名或删除，只能追加新的具名 migration。
- 新 schema 变化必须审查生成 SQL，并运行 `pnpm test:migrations`。
- 对已有数据的迁移还要从前一版本保留代表性记录执行升级。`pnpm test:migrations` 在隔离文件库中按历史顺序执行真实 `prisma migrate deploy`，每次升级前为尚无记录的业务表补充外键有效的样本，升级后核对已有字段值、行数下限和外键完整性；最后验证重复部署无变化、全新安装与当前 Schema 一致。治理入口复用同一数据比较规则进行内存快速检查。
- 样本生成、数据比较位于 `scripts/testing/migration-probe.mjs`，不对 `_prisma_migrations` 写入样本，也不读取业务数据库。现有 migration 自带的记录会保留；新增行、表和字段允许通过，旧记录消失、归属关系损坏或已有值被改动会被拒绝。
- 这是保守的数据保留基线，不是任意业务转换的证明。计划内的删表、列重命名或数据转换需要在同一 Plan 中声明目标、补专门的迁移数据与转换断言，再适配对应比较规则；不得删除旧迁移、关闭外键检查或直接绕过失败。复杂 CHECK 约束无法由通用样本满足时，同样补项目专用样本。
- Better Auth schema 变化必须先运行锁定版本的 `pnpm auth:schema`，再审查 Prisma
  diff 和 migration。
- SQLite 只作为本地默认值；切换生产 provider 必须同步 schema、migration、驱动和部署流程。
- 当前隔离验证能力集中在 `scripts/testing/database-adapter.mjs`；它明确只支持 SQLite。项目选择新 provider 时必须同步替换隔离库、迁移和数据比对能力；运行检查会拒绝未经适配的 provider，而不能通过删除数据库测试绕过。
- 未经明确许可，不执行 `prisma migrate reset` 或删除数据库。
