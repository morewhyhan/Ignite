# Plans

这里存放每一轮任务的实现计划、Tasking、验证方式和状态。

计划是过程规格：每次任务新建文件，完成后保留，不把旧计划改写成新的最终事实。
模板见 [`_template.md`](./_template.md)。

新计划必须包含顶部 `ignite-plan` JSON 元数据。一个 Plan 对应一个可验收交付切片，内部的代码、测试、修复和设计回写都是子任务。使用 `pnpm ignite plan validate` 检查，使用 `pnpm ignite status --write` 读取派生状态。当前发布只在 [`releases/`](./releases/) 维护。

不要在这里手工维护“当前计划”列表；运行 `pnpm ignite status --write`，从 Plan 元数据和 Release 范围生成当前视图。历史 Plan 留作过程记录，但不会进入 AI 的当前工作表。
