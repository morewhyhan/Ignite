# 开发标准

- 组件和 Hook 使用 PascalCase/camelCase；模块、API 资源和 URL 使用复数 kebab-case。
- screen 使用 `<module>-screen.tsx`，Hook 使用 `use-<module>.ts`。
- module 内部通过相对路径访问自己的实现；跨 module 只通过公开 `index.ts`。
- `src/components/ui/` 只能放无业务含义的基础 UI。
- 本地表单、弹窗、主题和布局状态使用 React state；服务端状态使用 React Query。
- 每个行为变化都要补充适用的 API、单元或 E2E 测试。
- 业务变更遵循 [`workflow.md`](./workflow.md) 的规格、Plan、测试先行和设计回写闭环。
- 最少运行 `git diff --check`、`pnpm docs:check` 和 `pnpm check`；生产路径或依赖变化额外运行 `pnpm build`。
