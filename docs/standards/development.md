# 开发标准

- 组件和 Hook 使用 PascalCase/camelCase；模块、API 资源和 URL 使用复数 kebab-case。
- screen 使用 `<module>-screen.tsx`，Hook 使用 `use-<module>.ts`。
- module 内部通过相对路径访问自己的实现；跨 module 只通过公开 `index.ts`。
- `src/components/ui/` 只能放无业务含义的基础 UI。
- 本地表单、弹窗、主题和布局状态使用 React state；服务端状态使用 React Query。
- 每个行为变化都要补充适用的 API、单元或 E2E 测试。
- 业务变更遵循 [`workflow.md`](./workflow.md) 的规格、Plan、测试先行和设计回写闭环。
- 不手工猜测检查范围。统一运行 `pnpm ignite check --plan <IGT-ID> --level auto`；它按真实 Plan diff 选择最低层级，且所有层级都执行 `git diff --check`。
- 发布前把 Plan 进入 `verifying` 并运行 `pnpm ignite check --plan <IGT-ID> --level release`；该层级包含完整验证、生产构建和生产态 E2E。
