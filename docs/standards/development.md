# 开发标准

- 组件和 Hook 使用 PascalCase/camelCase；模块、API 资源和 URL 使用复数 kebab-case。
- screen 使用 `<module>-screen.tsx`，Hook 使用 `use-<module>.ts`。
- module 内部通过相对路径访问自己的实现；跨 module 只通过公开 `index.ts`。
- `src/components/ui/` 只能放无业务含义的基础 UI。
- 本地表单、弹窗、主题和布局状态使用 React state；服务端状态使用 React Query。
- 每个行为变化都要补充适用的 API、单元或 E2E 测试。
- 业务变更按 [Feature 规则](../features/README.md) 明确行为、按 [Plan 规则](../plans/README.md) 组织本轮交付、按 [测试标准](./testing.md) 先行验证，最终事实回写 [Design](../designs/README.md)。
- 不手工猜测检查范围。统一运行 `pnpm ignite check --plan <IGT-ID> --level auto`；它按真实 Plan diff 选择最低层级，且所有层级都执行 `git diff --check`。
- 新版 Plan（`verification_contract: 2`）先完成 Plan integration 和本 Plan 验收，再将 Plan 标为 `done`；所有纳入 Release 的 Plan 完成后，运行 `pnpm ignite release verify <release-id> --plan <IGT-ID>` 验证组合版本的生产构建与生产态 E2E。旧 Plan（`verification_contract: 1`）继续使用 `pnpm ignite check --plan <IGT-ID> --level release`。
