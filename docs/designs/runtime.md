# 当前运行时设计

## 规范化运行环境

| 真源                                 | 职责                                  |
| ------------------------------------ | ------------------------------------- |
| `.node-version`                      | 固定 Node 精确版本                    |
| `package.json#packageManager`        | 固定 pnpm 精确版本                    |
| `.ai/runtime.json`                   | 声明首选平台、允许平台/架构和隔离规则 |
| `node_modules/.ignite-platform.json` | 记录本次依赖实际由哪个平台和版本安装  |

默认执行环境是 WSL/Linux，当前支持 x64。Windows 也可使用，但两个平台必须各自安装依赖，不能共享同一个 `node_modules`。`postinstall` 写入平台标记，`pnpm runtime:check` 在验证前比较 Node、pnpm、平台和架构。

## 环境变量

| 变量                 | 本地示例                | 生产约束                          |
| -------------------- | ----------------------- | --------------------------------- |
| `APP_ENV`            | `development`           | 必须显式为 `production`           |
| `APP_URL`            | `http://localhost:3000` | HTTPS 纯 origin，不能是 localhost |
| `DATABASE_URL`       | `file:./dev.db`         | 不能使用 `file:` SQLite           |
| `BETTER_AUTH_SECRET` | 本地示例值              | 至少 32 字符高熵随机值            |

本模板的注册登录不依赖外部邮件服务。若产品需要邮箱所有权验证，应作为独立增量模块增加 provider、环境变量、契约测试和 E2E。

## 请求时序

```text
Browser → Next.js route page → module screen → module Hook / React Query
  → Hono Typed Client → Next.js Hono adapter → Hono route
  → session + Zod → Prisma → database
```

服务端 layout 负责 session redirect；业务数据仍统一走 Hook → Hono Typed RPC → Prisma。

## AI 执行状态

```text
Feature REQ/AC
      ↓
schema 2 Plan（base commit + write scope + tests + required evidence）
      ↓
真实 Git diff → 最低风险等级 → 不可降级检查命令
      ↓
.ignite/runs（锁 + 心跳 + 完整本地日志）
      ↓ 仅成功且输入已提交
脱敏 evidence manifest → Plan evidence → 派生 Release 状态
```

- Plan 的 `base_commit` 决定本轮真实改动范围；即使实现已经提交，差异仍可追踪。最低检查等级取声明风险与实际文件风险中的较高者。
- `--files` 只允许 dry-run 演示，真实检查不能由调用者删减文件。
- 同一工作区的检查共享一个原子锁，保护构建和测试产物。相同 Plan、输入、环境和命令可复用成功记录。活动进程返回 pending 非零状态；失去心跳且不属于存活 runner 的运行变为 `orphaned`。
- 原始状态和日志只在 `.ignite/`，不会进入 Git。通过后导出的 manifest 不含绝对路径、PID、日志正文和 secret。
- 输入指纹包含源码、测试、规范化设计、依赖锁、Plan 模板及使用说明和稳定 Plan 契约；Plan 状态、派生摘要和 evidence 自身不参与指纹，避免“记录证据导致证据立刻过期”。
- `pnpm ignite validate` 检查 AI 桥接、REQ/AC/Test 追踪和 Design 快照；源码架构边界统一由 `pnpm lint` 中的 ESLint 规则检查。集成检查会运行这两个入口，客户端越过 Hook/Typed RPC、直接导入服务端代码或跨模块引用内部实现都会被拒绝。

## 完成与发布推导

Plan 进入 `done` 前必须满足：所有 `required_evidence` 都存在且为 schema 2、结果通过、输入指纹仍然匹配当前提交、运行时被允许、工作区输入已提交、commit 真实存在且不早于 `integrated_commit`。进入 `done` 后，证据改为对照当时 commit 的仓库快照，后续合法增量不会让历史完成记录失效。

普通结构校验检查旧证据与其被测提交的一致性，允许开发中继续修改和重测；`set-status done` 额外执行当前输入校验。这样修改代码后仍能恢复执行，过期记录也无法被用来宣布完成。

Release JSON 只声明 `plan_ids`、`must_pass` 和排除项，不保存状态。CLI 根据 Plan 状态与有效证据推导 `draft`、`ready`、`active`、`verifying`、`blocked`、`done` 或 `invalid`，从结构上消除手工“宣布完成”。

CI 还会用本次 Git diff 做反向覆盖检查：每一个非状态文件的改动，都必须落在本次完成 Plan 的 `write_scope` 内，且文件内容与该 Plan 的被测提交一致。已有的未改动草稿不阻塞本次交付；本次改动的 Plan 必须达到终态。这样既保留历史证据，又能检测同一路径在验证后追加的修改。
