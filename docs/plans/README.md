# Plans

这里存放每一轮任务的实现计划、Tasking、验证方式和状态。

计划是过程规格：每次任务新建文件，不把旧计划改写成新的最终事实。具体产品中的已完成 Plan 保留在该产品的仓库；Ignite 模板的发布快照只带当前基线交付记录，建设模板的旧 Plan 由 Git 历史保存，不让新项目继承一串无关任务。
模板见 [`_template.md`](./_template.md)。

新计划必须包含顶部 `ignite-plan` JSON 元数据。一个 Plan 对应一个可验收交付切片，内部的代码、测试、修复和设计回写都是子任务。使用 `pnpm ignite plan validate` 检查，使用 `pnpm ignite status --write` 读取派生状态。当前发布只在 [`releases/`](./releases/) 维护。

不要在这里手工维护“当前计划”列表；运行 `pnpm ignite status --write`，从 Plan 元数据和 Release 范围生成当前视图。复制为新项目后，先按采用规范处理继承的基线记录，再建立该产品自己的 Plan。
