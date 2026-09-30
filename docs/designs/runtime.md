# 当前运行时设计

## 规范化运行环境

| 真源                                 | 职责                                  |
| ------------------------------------ | ------------------------------------- |
| `.node-version`                      | 固定 Node 精确版本                    |
| `package.json#packageManager`        | 固定 pnpm 精确版本                    |
| `.ai/runtime.json`                   | 声明首选平台、允许平台/架构和隔离规则 |
| `node_modules/.ignite-platform.json` | 记录本次依赖实际由哪个平台和版本安装  |

默认执行环境是 WSL/Linux，当前支持 x64。Windows 也可使用，但两个平台必须各自安装依赖，不能共享同一个 `node_modules`。安装前可运行 `node scripts/runtime-doctor.mjs --preflight` 获取下一条安装动作；`postinstall` 写入平台标记，`pnpm runtime:check` 在验证前比较 Node、pnpm、平台和架构。

## 环境变量

| 变量                 | 本地示例                | 生产约束                          |
| -------------------- | ----------------------- | --------------------------------- |
| `APP_ENV`            | `development`           | 必须显式为 `production`           |
| `APP_URL`            | `http://localhost:3000` | HTTPS 纯 origin，不能是 localhost |
| `DATABASE_URL`       | `file:./dev.db`         | 不能使用 `file:` SQLite           |
| `ALLOW_PRODUCTION_SQLITE` | `false`             | 默认关闭；仅单机展示部署可显式设为 `true` |
| `BETTER_AUTH_SECRET` | 本地示例值              | 至少 32 字符高熵随机值            |

`scripts/template-doctor.mjs` 与服务端 `src/server/env.ts` 共用 `src/server/env-policy.mjs` 检查 URL origin、密钥长度和生产环境限制；诊断只报告问题，不输出密钥值。

生产 SQLite 默认仍会被拒绝。只有低流量单机展示部署明确设置 `ALLOW_PRODUCTION_SQLITE=true`，并将 `DATABASE_URL` 指向版本目录外的持久化绝对路径（例如 `file:/var/lib/ignite/app.db`）时才允许启动；操作者负责定期备份。该例外不适用于多实例、高可用或通用生产部署。

本模板的注册登录不依赖外部邮件服务。若产品需要邮箱所有权验证，应作为独立增量模块增加 provider、环境变量、契约测试和 E2E。

隔离数据库的当前适配入口是 `scripts/testing/database-adapter.mjs`，支持 SQLite 的临时文件 URL、文件连接与内存快照。E2E、迁移测试和治理检查共用这项能力；Prisma 切换到其他 provider 时会先报不支持，而不会把原有 SQLite 绿色结果冒充新 provider 的验收。

`scripts/testing/migration-probe.mjs` 负责关联有效的代表性样本与数据保留检查，排除 Prisma 内部记录。`pnpm test:migrations` 在临时文件库中逐个加入历史 migration 并实际调用 Prisma 部署，在每个升级边界检查旧数据和外键，最后验证幂等部署与全新安装；内存治理检查复用同一比较规则。允许增加字段、表和记录；有意转换旧数据时必须补项目专用的转换契约。临时库在成功或失败后清理，不接触应用的 `DATABASE_URL`。

## 请求时序

```text
Browser → Next.js route page → module screen → module Hook / React Query
  → Hono Typed Client → Next.js Hono adapter → Hono route
  → session + Zod → Prisma → database
```

服务端 layout 负责 session redirect；业务数据仍统一走 Hook → Hono Typed RPC → Prisma。

## 执行工具

Plan、Release、运行恢复和证据契约统一见 [AI 执行系统](./execution.md)。实际检查策略以 `scripts/ignite/checks.mjs` 为准，运行清单记录所用版本；本文件只维护应用与测试的运行环境。
