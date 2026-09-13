# Ignite 模板演练

这是模板自己的独立验收样例，不代表采用项目必须保留 Tasks 语义。它验证一个最小的真实纵向切片同时具备：

- 认证 session 作为权限边界；
- Prisma 持久化和当前用户归属；
- Hono API 的输入校验、404/401 错误出口；
- Hook 驱动的页面入口和浏览器操作。

从干净版本复现：

```text
corepack pnpm install --frozen-lockfile
corepack pnpm runtime:check
corepack pnpm template:doctor
corepack pnpm verify
corepack pnpm test:e2e:production
```

验收入口对应 [`docs/features/tasks.md`](../../features/tasks.md)、[`tests/api/tasks.test.ts`](../../../tests/api/tasks.test.ts) 和 [`tests/e2e/tasks.spec.ts`](../../../tests/e2e/tasks.spec.ts)。升级机制自身还必须通过 `tests/contracts/ignite-cli.test.ts`，两类证据不能互相替代。

完整运行时由 `pnpm ignite check --plan <IGT-ID> --level release` 记录到 `docs/others/evidence/runs/`；只能对 schema 2 且处于 `verifying` 的当前 Plan 运行。历史 schema 1 记录保持 `legacy_unverified`，不冒充当前证据。如果浏览器、数据库或外部凭据不可用，保留准确的阻塞状态，不把静态检查当作用户流程通过。
