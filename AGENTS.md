# Ignite AI 开发规则

## 模板定位

Ignite 是可复用的个人全栈模板，不是固定产品。任何改动都要判断是 `[新增模块]` 还是 `[存量改动]`，并同步 Feature、Plan、Design 和测试证据。默认优先做小步、可回滚的增量修改。
Ignite 是一个可复制、可增量演进的模板。

## 增量与存量

- 一个 Plan 对应一个可独立验收、集成和回滚的交付结果。API、页面、测试、格式修复和状态回写是同一 Plan 的子任务，不为“收口”另建 Plan。
- 新 Plan 使用 `docs/plans/_template.md` 顶部的结构化元数据；状态只能使用 `draft`、`ready`、`active`、`verifying`、`done`、`blocked`、`cancelled`、`superseded`。历史未迁移 Plan 保留为 `legacy_unverified`，不能自动视为完成。
- 当前发布只由 `docs/plans/releases/*.json` 定义；状态表由 `pnpm ignite:status -- --write` 生成，不手工维护派生副本。
- 每次检查由 `pnpm ignite:check -- --plan <IGT-ID> --level auto` 选择范围并记录运行证据。相同输入的活动或已通过运行必须复用，不重复启动。

## 规范真源

- 长期方法：`docs/standards/`
- 功能规格：`docs/features/`
- 本轮计划：`docs/plans/`
- 当前事实设计：`docs/designs/`
- 验收和 ADR：`docs/others/`
- 本文件是 AI 执行规则；发生冲突时，先更新文档再改代码。
- 规格驱动 Loop：Feature → Plan → Contract/Test → Implementation → Verify → Design。

## AI 工作台

- `AGENTS.md` 是所有 AI 工具共用的唯一项目规则真源。
- `CLAUDE.md`、`.cursor/rules/`、`.opencode/` 和 `.github/copilot-instructions.md` 只负责入口桥接，不复制长期规则。
- `.ai/` 登记项目专属 Skills、MCP 和真源关系；新增资产必须写清用途、权限边界和验证方式。
- 当前系统事实以 `docs/designs/` 为准；需求、计划、标准和验收资料分别位于 `docs/features/`、`docs/plans/`、`docs/standards/` 和 `docs/others/`。

## 规格驱动 Loop

所有功能都按规格驱动 Loop 执行，并在 `docs/standards/adoption.md` 记录采用边界。完成判定必须引用具体 `REQ-*`、`AC-*`、运行记录和被测版本；缺证据、跳过测试或外部依赖未满足时保持未完成或阻塞。

## 架构边界

- `src/app/` 只负责路由壳和页面编排；业务 UI 放到 `src/modules/<module>/`。
- 客户端业务数据统一走 `module Hook → Hono Typed RPC → Hono route → Prisma`。
- 浏览器端只能导入 `src/lib/api-client.ts`，不得直接创建 `hc()` 或 fetch 业务 API。
- Hono route 必须使用统一 `zValidator`、session guard 和统一错误格式。
- 服务端 secret、数据库、Better Auth 配置只允许留在 `src/server/`。
- 认证使用 Better Auth 客户端/服务端配置，是业务 RPC 的明确例外。

## 认证基线

模板只提供自包含的邮箱密码注册、登录、登出和 session。默认不发送真实邮件、验证码，也不依赖 Resend 或其他外部邮件 provider。Better Auth schema 中的 `verification` 表是兼容性预留；如果项目要启用邮箱所有权验证，必须作为独立增量模块补充规格、环境变量、provider、契约测试和 E2E。

## 环境与安全

- `.env.example` 只放变量名和安全本地示例；不得提交 `.env`、生产 secret 或真实邮箱配置。
- `APP_ENV` 必须显式设置为 `development`、`test` 或 `production`。
- 生产必须使用 HTTPS 纯 origin、高熵 `BETTER_AUTH_SECRET` 和持久化数据库；不得使用 localhost、开发 secret 或 `file:` SQLite。
- API 从 session 获取当前用户，绝不信任客户端传入的 `userId`。
- 用户无权访问私有资源时返回 `404`；未登录访问受保护 API 返回 `401`。

## 数据库与迁移

修改 Prisma schema 必须生成具名 migration，并运行 `pnpm test:migrations`。已应用 migration 不得重写、重命名或删除。升级 Better Auth 先运行 `pnpm auth:schema`，再审查 schema diff。

## 验证与交付

每次改动通过 `pnpm ignite:check -- --plan <IGT-ID> --level auto` 选择开发或集成检查；发布候选运行 `pnpm ignite:check -- --plan <IGT-ID> --level release`。所有层级都保留 `git diff --check` 和对应证据；涉及构建、迁移或核心用户流程时，额外运行 `pnpm build`、`pnpm test:migrations` 或 `pnpm test:e2e`。最终只报告实际执行并通过的检查，不把 typecheck/lint 当行为测试。

## 推荐开发流程

1. 先读相关 Feature、Plan、Design 和测试用例。
2. 明确增量/存量边界与验收标准。
3. 先写或更新契约测试，再实现最小代码。
4. 让页面只消费 module screen，让业务请求只走 Hook 与 RPC。
5. 更新事实设计和验收记录，运行准出检查。
