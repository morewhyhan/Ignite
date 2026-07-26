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
```

行为、权限、缓存或输入契约变化必须更新对应测试；不能用 typecheck、lint 或 build
代替行为测试。

## 测试先行

- API 和业务行为先写或更新测试，运行并确认因目标行为尚未实现而失败。
- 实现后先跑最小目标测试，再跑完整回归。
- 测试不能只断言成功路径；按风险覆盖未登录、非法输入、无权/不存在和缓存更新。
- UI 需求先在 `docs/others/test-cases/` 写用户路径，再把稳定路径固化为 E2E。
- 视觉、动画或 Canvas 等无法可靠通过 DOM 断言的场景使用截图或人工验证，并在 Plan 记录。

完整闭环见 [`workflow.md`](./workflow.md)。
