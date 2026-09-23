# Ignite AI 开发规则

## 模板定位

Ignite 是一个可复制、可增量演进的个人全栈模板，不是固定产品。功能与工程规则改动都要判断是 `[新增模块]` 还是 `[存量改动]`，并在对应 Plan 中同步受影响的 Feature、Design 和测试证据。默认优先做小步、可回滚的增量修改。

模板基线验收只证明 Ignite 当前配置可用；换品牌、删改 Tasks、切换数据库或部署到某个平台，属于具体项目采用后的独立验收。未给定项目目标时，保留可替换入口与检查规则，不猜测产品决定，也不把模板的绿色结果当作衍生项目已通过。

## 增量与存量

- 一个 Plan 对应一个可独立验收、集成和回滚的交付结果。API、页面、测试、格式修复和状态回写是同一 Plan 的子任务，不为“收口”另建 Plan。
- 先接续覆盖本轮目标的未完成 Plan；只有新的独立交付结果才创建 Plan。本轮检查失败后的修复、同目标的完善和验证都留在原 Plan。已交付结果的后续改动保留原记录，并建立新的存量改动 Plan。仅安全说明文字或静态展示资产可免业务 Plan，具体范围以 `docs/standards/workflow.md` 和检查器为准。
- 新 Plan 使用 `docs/plans/_template.md` 顶部的结构化元数据；状态只能使用 `draft`、`ready`、`active`、`verifying`、`done`、`blocked`、`cancelled`、`superseded`。历史未迁移 Plan 保留为 `legacy_unverified`，不能自动视为完成。
- 当前发布只由 `docs/plans/releases/*.json` 定义；状态表由 `pnpm ignite status --write` 生成，不手工维护派生副本。
- 新 Plan 使用 `execution_contract: 1`；`tasks` 是唯一任务状态，正文进度由 `pnpm ignite plan refresh <ID>` 生成，使用 `pnpm ignite task set-status <ID> <task> <todo|doing|done>` 更新任务。
- Release 的 `scope` 逐条保存原始目标、来源、REQ 和负责的 Plan。缺账号、未实现或等待外部条件都属于延期，不能自动改成排除；排除必须记录用户的具体授权来源。
- 每次检查由 `pnpm ignite check --plan <IGT-ID> --level auto` 选择范围并记录运行证据。相同输入的活动或已通过运行必须复用，不重复启动。

## 规范真源

- 长期方法：`docs/standards/`
- 功能规格：`docs/features/`
- 本轮计划：`docs/plans/`
- 当前事实设计：`docs/designs/`
- 验收和 ADR：`docs/others/`
- 本文件是 AI 执行规则；发生冲突时，先更新文档再改代码。
- 规格驱动 Loop：Feature → Plan → Contract/Test → Implementation → Verify → Design。
- Plan 进入 ready 前，逐条对照用户已确定的原始目标和约束，把对应关系写入 Plan；`open_questions=[]` 不能替代完整性审查。语义完整性不能只凭标签或测试数自动证明。
- 每条 AC 声明 `required_layers` 和带层级的 `checks`：unit、database、browser、external。模拟数据库的 API 测试只证明 unit 层；新增业务页面、持久化及外部集成必须有对应真实行为验收。
- 脚手架产物是待完善的草稿。进入 ready 前补齐实际用户行为、测试路径和验收层级；占位失败测试、页面外壳或结构校验通过均不能视为功能完成。

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

- 运行时以 `.node-version`、`packageManager` 和 `.ai/runtime.json` 为准；默认使用 WSL/Linux。Windows 与 WSL 不得共享 `node_modules`，先运行 `pnpm runtime:check`。
- `.env.example` 只放变量名和安全本地示例；不得提交 `.env`、生产 secret 或真实邮箱配置。
- `APP_ENV` 必须显式设置为 `development`、`test` 或 `production`。
- 生产必须使用 HTTPS 纯 origin、高熵 `BETTER_AUTH_SECRET` 和持久化数据库；不得使用 localhost、开发 secret 或 `file:` SQLite。
- API 从 session 获取当前用户，绝不信任客户端传入的 `userId`。
- 用户无权访问私有资源时返回 `404`；未登录访问受保护 API 返回 `401`。

## 数据库与迁移

修改 Prisma schema 必须生成具名 migration，并运行 `pnpm test:migrations`。已应用 migration 不得重写、重命名或删除。升级 Better Auth 先运行 `pnpm auth:schema`，再审查 schema diff。

## 验证与交付

Plan 内的改动通过 `pnpm ignite check --plan <IGT-ID> --level auto` 选择开发或集成检查；发布候选运行 `pnpm ignite check --plan <IGT-ID> --level release`。统一入口保留差异检查和证据，并按范围运行迁移、构建和生产态 E2E。已有匹配证据时复用，不再手工重复同一检查；额外验收按 Plan 的真实行为要求补齐。最终只报告实际执行并通过的检查，不把 typecheck/lint 当行为测试。

## 推荐开发流程

用户明确要求暂不测试时，先实现并保留待验证任务；不运行检查、不生成通过证据、不进入 `done`。测试资产可以编写，是否执行以当前用户指令为准。

并行开发时，`depends_on` 约束最终集成；开发阶段可用 `dependency_contracts` 引用上游已提交的明确文件快照。接口变化后重新对齐。Prisma Schema、API 注册、导航等共享文件在 `shared_files` 声明同一负责人。非负责人提交业务切片与 `handoff`，由集成人接管计划 owner 并处理共享文件。交接记录包含接口、迁移、测试入口和未完成项。

1. 在安装依赖前执行 `node scripts/runtime-doctor.mjs --preflight`；安装后运行 `pnpm runtime:check` 和 `pnpm ignite status --json`，先识别模板状态、当前 Plan 与结构问题。
2. 只读取本轮相关的 Feature、Plan、Standards、Design 和测试；用 `pnpm ignite next --plan <IGT-ID>` 接续匹配的现有 Plan。需要新 Plan 时，新模块用 `pnpm create:module <plural-kebab-name>`，存量改动用 `pnpm create:change <kebab-name>` 起草。
3. 明确增量/存量、基线 commit、写入范围和验收标准；关闭开放问题后再进入实现。
4. 先写或更新契约测试，再实现最小代码；页面只消费 module screen，业务请求只走 Hook 与 RPC。
5. 在提交实现后运行集成检查，进入 `verifying` 再运行 release 检查；最后回写 Design、完成 Plan 并刷新状态摘要。
