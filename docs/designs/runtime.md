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
| `BETTER_AUTH_SECRET` | 本地示例值              | 至少 32 字符高熵随机值            |

`scripts/template-doctor.mjs` 与服务端 `src/server/env.ts` 共用 `src/server/env-policy.mjs` 检查 URL origin、密钥长度和生产环境限制；诊断只报告问题，不输出密钥值。

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

## AI 执行状态

```text
Feature REQ/AC
      ↓
schema 2 Plan（稳定目标/约束 + base commit + write scope + tests）
      ↓
真实 Git diff → 最低风险等级 → 不可降级检查命令
      ↓
.ignite/runs（锁 + 心跳 + 完整本地日志）
      ↓ 仅成功且输入已提交
脱敏 evidence manifest → Plan evidence → 派生 Release 状态
```

- Plan 的 `base_commit` 与 `Ignite-Plan:` 实现提交标记决定本轮修改归属；未标记的单任务提交仍按兼容规则识别，其他 Plan 标记的提交不计入本任务范围。合并后的全仓输入指纹仍要求整体重新验证。最低检查等级取声明风险与实际文件风险中的较高者。
- `--files` 只允许 dry-run 演示，真实检查不能由调用者删减文件。
- 同一工作区的检查共享一个原子锁，保护构建和测试产物。相同 Plan、输入、环境和命令可复用成功记录。活动进程返回 pending 非零状态；本机 runner 和其 worker 均已退出时立即标为 `orphaned`，异机记录按心跳期限判断。命令有总时限，记录当前步骤与最后输出时间；`run cancel` 只对本机的指定活动运行写取消请求。独立 worker 通过 IPC 感知 runner 崩溃，先终止自己创建的进程组，3 秒后强制清理仍存活的后代，不扫描或终止其它任务的进程。孤儿运行可以重新获得锁，但不得发布成功证据。坏记录单独标记，不阻断整个运行列表。
- 原始状态和日志只在 `.ignite/`，不会进入 Git。通过后导出的 manifest 不含绝对路径、PID、日志正文和 secret。
- 输入指纹包含源码、测试、规范化设计、依赖锁、Plan 模板及使用说明和稳定 Plan 契约；Plan 状态、派生摘要和 evidence 自身不参与指纹，避免“记录证据导致证据立刻过期”。
- `pnpm ignite validate` 检查 AI 桥接、REQ/AC/Test 追踪和 Design 快照；源码架构边界统一由 `pnpm lint` 中的 ESLint 规则检查。集成检查会运行这两个入口，客户端越过 Hook/Typed RPC、直接导入服务端代码或跨模块引用内部实现都会被拒绝。

## 完成与发布推导

Plan 进入 `done` 前必须满足：所有 `required_evidence` 都存在且为 schema 2、结果通过、输入指纹仍然匹配当前提交、运行时被允许、工作区输入已提交、commit 真实存在且不早于 `integrated_commit`。进入 `done` 后，证据改为对照当时 commit 的仓库快照，后续合法增量不会让历史完成记录失效。

普通结构校验检查旧证据与其被测提交的一致性，允许开发中继续修改和重测；`set-status done` 额外执行当前输入校验。这样修改代码后仍能恢复执行，过期记录也无法被用来宣布完成。

运行清单的 `check_policy_version` 固定本次命令选择规则。没有此字段的 schema 2 历史清单按策略 1 解释；旧策略 2、3 仍按历史命令校验。新运行使用策略 4：沿用 Plan 映射测试与集成证据复用，并在迁移运行器、数据库适配器或迁移样本工具变化时强制选择迁移检查。发布检查只执行生产构建与生产态 E2E，不再重复整套 `verify`。当前 Plan 完成必须使用当前策略，并核对本地运行记录与日志摘要。历史记录仍按原策略解释。

Vitest 和 Playwright 的验收结果检查器在运行结束时确认 AC 的实际结果，并校验当前 Plan 在该测试层映射的文件。跳过、预期失败、遗漏或重试后才通过的验收测试会使检查失败；源码里有 AC 标记不能替代通过结果。

Release JSON 只声明 `plan_ids`、`must_pass` 和排除项，不保存状态。CLI 根据 Plan 状态与有效证据推导 `draft`、`ready`、`active`、`verifying`、`blocked`、`done` 或 `invalid`，从结构上消除手工“宣布完成”。

`cancelled` 与 `superseded` Plan 保留在历史范围中，并列入派生的 `excluded_plans`，不要求它们补交付证据。其余 Plan 全部完成后，Release 可以完成；若全部取消或被替代，Release 显示 `cancelled`，不会计为交付成功。

CI 还会用本次 Git diff 做反向覆盖检查：每一个非状态文件的改动，都必须落在本次完成 Plan 的 `write_scope` 内，且文件内容与该 Plan 的被测提交一致。已有的未改动草稿不阻塞本次交付；本次改动的 Plan 必须达到终态，但同 Release 未来任务不阻止其独立合并。首推没有 before commit 时以仓库根提交为明确基线。这样既保留历史证据，又能检测同一路径在验证后追加的修改。

`pnpm ignite next --plan <ID>` 是派生的接续摘要：列出目标、约束、非目标、授权来源、开放问题、最近运行、`remaining_work` 和允许的下一步。`context` 包含当前工作区、基线、允许写入范围、按 REQ 定位的 Feature 路径、AC 与测试映射，以及规范和事实设计入口；新会话不必从全量历史猜测任务边界，不维护第二份状态。若剩余验收非空，即使所有命令通过也不建议 `done`，状态校验同样拒绝。成果交付只报告已核实的本地提交、远端同步或部署状态；`done` 自身不等于已上线。Squash/rebase 改写提交后需 `plan reintegrate` 并在最终集成提交重测，不能移植源提交的通过摘要。
