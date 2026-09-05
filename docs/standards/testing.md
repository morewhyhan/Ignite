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

常用命令：

```text
pnpm check             # typecheck + lint + format + Vitest
pnpm docs:check        # 文档、Plan、链接和结构化规格
pnpm test:migrations   # migration smoke checks
pnpm test:e2e          # Playwright
pnpm verify            # check + migrations + production build
pnpm ignite:check -- --plan IGT-000 --level auto --dry-run # 查看本轮最小检查范围
pnpm ignite run status # 查看运行中、已完成或需要重试的证据
```

### 分级检查

`ignite:check` 根据工作树改动选择三层检查：

| 层级          | 用途                 | 默认范围                                             |
| ------------- | -------------------- | ---------------------------------------------------- |
| `dev`         | 实现中的快速反馈     | 文档结构/相关格式，或受影响源码 lint                 |
| `integration` | 一个 Plan 的集成验证 | 类型、lint、Vitest；认证和 Schema 变化追加 migration |
| `release`     | 固定候选版本准出     | `verify`、关键 E2E 和发布门槛                        |

普通说明文字不会启动 Next、Prisma 或 E2E。改动分类不明确、公共契约、认证、数据库、脚本和锁文件会自动提高等级；不能为了提速手工降低风险等级。每个运行都保存内容指纹，源码、测试、Schema、锁文件或 runner 改变后旧证据不能复用。

### 证据等级

结构检查、行为测试、真实数据库集成、浏览器旅程和真实外部走查是不同证据。源码中存在按钮、mock 请求成功或类型检查通过，不能替代用户操作和外部 provider 的真实证据。`done` 只在 Plan 元数据引用所需的 `passed` 运行记录后成立。

行为、权限、缓存或输入契约变化必须更新对应测试；不能用 typecheck、lint 或 build
代替行为测试。

## 测试先行

- API 和业务行为先写或更新测试，运行并确认因目标行为尚未实现而失败。
- 实现后先跑最小目标测试，再跑完整回归。
- 测试不能只断言成功路径；按风险覆盖未登录、非法输入、无权/不存在和缓存更新。
- UI 需求先在 `docs/others/test-cases/` 写用户路径，再把稳定路径固化为 E2E。
- 视觉、动画或 Canvas 等无法可靠通过 DOM 断言的场景使用截图或人工验证，并在 Plan 记录。

完整闭环见 [`workflow.md`](./workflow.md)。
