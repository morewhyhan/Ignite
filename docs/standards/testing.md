# 测试标准

测试按风险分层：

| 层级     | 工具                           | 当前职责                                |
| -------- | ------------------------------ | --------------------------------------- |
| 静态检查 | TypeScript / ESLint / Prettier | 类型、边界、格式和禁止依赖              |
| API 行为 | Vitest                         | 认证、校验、所有权、CRUD 和错误码       |
| 迁移契约 | `scripts/test-migrations.mjs`  | 干净数据库部署、重复部署和 schema drift |
| 用户流程 | Playwright                     | 路由守卫、认证和任务完整流程            |
| 视觉检查 | Playwright 截图 / 人工浏览器   | 布局、响应式、动效和 DOM 难以断言的状态 |
| 代码审查 | 人 + AI                        | 复杂度、安全、边界和可维护性            |

`test:e2e:production` 使用已经编译的 Next.js 产物，以 `next start` 和隔离的测试数据库执行浏览器用例；这里的“production”指生产构建与启动方式，不代表真实生产环境、真实数据或部署验收。

桌面与移动项目共用每次运行新建的临时 SQLite，因此默认单 worker 串行执行，避免并发写锁把基础设施抖动误报成产品失败。

常用命令：

```text
pnpm ignite check --plan IGT-000 --level auto --dry-run # 查看不可降低的检查范围
pnpm ignite check --plan IGT-000 --level integration    # 生成集成证据
pnpm ignite check --plan IGT-000 --level release        # 生产构建 + 生产态 E2E
pnpm ignite run status                                  # 只读查看运行状态
pnpm ignite release status                              # 查看派生发布状态
```

### 分级检查

`ignite check` 根据 Plan 声明的风险，以及 `base_commit...HEAD`、暂存区、工作区和未跟踪文件选择三层检查；两者取更高等级：

| 层级          | 用途                 | 默认范围                                             |
| ------------- | -------------------- | ---------------------------------------------------- |
| `dev`         | 实现中的快速反馈     | 文档结构/相关格式，或受影响源码 lint                 |
| `integration` | 一个 Plan 的集成验证 | 类型、lint、Vitest；认证和 Schema 变化追加 migration |
| `release`     | 固定候选版本准出     | `verify`、生产态桌面/移动 E2E 和发布门槛             |

普通说明文字不会启动 Next、Prisma 或 E2E。公共契约、认证、数据库、脚本、CSS、模块 Hook、设计快照、CI 和锁文件至少进入 integration；不能为了提速手工降低风险等级。真实运行不接受调用者提供的 `--files`。每个运行都保存输入与环境指纹，源码、测试、Schema、锁文件、Node、pnpm 或平台改变后旧运行不能复用。

`risk: docs` 只适用于 README、文档入口和静态资源等安全说明修改；如果实际差异触及 Feature、Design、Standards、测试或工程配置，CLI 会要求提高 Plan 风险和必需证据，而不是留下一个无法完成的低风险 Plan。

### 证据等级

结构检查、行为测试、真实数据库集成、浏览器旅程和真实外部走查是不同证据。源码中存在按钮、mock 请求成功或类型检查通过，不能替代用户操作和外部 provider 的真实证据。`done` 只在 Plan 元数据引用当前输入、允许运行时、真实 commit 的 `passed` manifest 后成立。

每条 Feature 验收标准使用稳定 `AC-*` ID，并在覆盖它的测试标题中写成 `[AC-*]`。Plan 的 `acceptance` 字段必须把 AC 映射到包含该标记的具体测试文件；文档检查会拒绝断链、重复 ID 或不存在的 Design 契约。

静态标记只能证明关联。Vitest 与 Playwright 在运行结束后还必须检查实际结果：带 AC 标记的测试若跳过、未完成、预期失败或重试后才通过，均不能作为通过证据。统一检查入口会传入当前 Plan，并要求本层适用的每条 AC 在所声明文件中实际通过；只运行其他测试不能补足缺失的验收结果。

CI 是合并门槛，本次改动的 schema 2 Plan 必须达到终态，对应 Release 也必须完成或明确取消；未改动的未来草稿不阻塞本次交付。CI 还会确认本次 diff 中每个非状态文件都落在本次完成 Plan 的 `write_scope` 内，且内容与被测提交一致，防止没有验证的夹带改动。开发中可以提交分支进度，但在合并前必须完成证据闭环并刷新生成状态。

行为、权限、缓存或输入契约变化必须更新对应测试；不能用 typecheck、lint 或 build
代替行为测试。

## 测试先行

- API 和业务行为先写或更新测试，运行并确认因目标行为尚未实现而失败。
- 实现后先跑最小目标测试，再跑完整回归。
- 测试不能只断言成功路径；按风险覆盖未登录、非法输入、无权/不存在和缓存更新。
- UI 需求先在 `docs/others/test-cases/` 写用户路径，再把稳定路径固化为 E2E。
- 视觉、动画或 Canvas 等无法可靠通过 DOM 断言的场景使用截图或人工验证，并在 Plan 记录。

完整闭环见 [`workflow.md`](./workflow.md)。
