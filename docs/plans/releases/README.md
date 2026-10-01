# Release 范围与交付

本页负责发布组合的目标覆盖、版本衔接与完成条件。具体 Release 汇集已纳入的 Plan；单个 Plan 的方法与状态仍由 [Plan 规则](../README.md) 负责。

## 范围与原始目标

当前发布机器源位于本目录，格式见 [_template.json](./_template.json)。Release 不保存 status，状态由 Plan 与有效证据推导；摘要由 ignite status --write 生成，不手工维护派生副本。

新 Release 使用 coverage_version 2、verification_contract 2。scope 逐条连接原始目标、来源、REQ、全部相关 AC、负责 Plan 和 included/deferred/excluded；每个列入 REQ 的 AC 都必须有去向。语义完整性仍需回看用户原始请求，不能只从已拆出的 Plan 判断无遗漏。

缺账号、未实现或等待外部条件是 deferred，保持未完成；excluded 需要用户明确授权来源与理由，不能为了全绿把延期改成排除。真正获授权排除的内容不作本轮阻塞。当前未纳入的独立新目标不悄悄塞入旧 Release，也不批量重写历史 Plan。

## 完成与证据

所有纳入 Plan 完成后，在同一最终提交运行一次组合验收：

```text
pnpm ignite release verify <release-id> --plan <done-plan-id>
pnpm ignite release status
```

新契约的 must_pass 仅为 check-release。该运行验证生产构建与全量生产态 E2E，证据写入 Release，不混成单个 Plan 的必需证据；历史 verification_contract 1 仍按原流程处理。正式范围由工具决定，不用局部排查降低门禁，也不重复执行已经匹配当前输入的有效运行。

工程、Plan、Release 三层不能互相冒充：工程门禁通过不证明用户行为，Plan 完成不证明全部组合，构建通过不证明真实部署或衍生产品完成。被测 commit、package version、该 commit 的 tag 名称集合和 scope 须与证据一致；源码、规则、运行环境、包版本、tags 或范围改变需要重新核对，不能借用不同版本零散绿色结果。

完成结论逐项列出原始目标、真实行为、证据及未完成影响，不只宣称工具绿色。缺失、跳过、环境不足或延期均保持未完成；证据由实际 runner 生成，不能手写通过回执。有效性与复用见 [验收证据](../../others/evidence/README.md)。

## 集成、历史与对外交付

Release 的组合负责人确认接口和迁移交接、依赖 Plan 已完成、最终 Design 与受测实现一致；出现跨 Plan 冲突按 [协作说明](../../standards/workflow.md#跨-plan-依赖与交接) 处理。

CI 只要求本次差异的独立 Plan 完成并覆盖写入；其他未来草稿不阻挡这次合并，却不能让整个 Release 提前完成。普通 merge 可保留原提交证据；squash/rebase 改写身份后由 Plan reintegrate 重新验收，不只修改 integrated_commit 字符串。

有真实集成提交且全部纳入 Plan 已完成时，历史覆盖按被测 Feature 快照解释，后续替换旧能力不把旧记录报成未知需求。这不代替发布证据；当前输入变化后旧组合仍可 stale。

本地完成不自动表示已经推送、部署或用户可访问。远端、平台与实际入口有独立交付目标时按该项目目标验证，授权边界以 AGENTS 和用户决定为准。模板维护记录清理见 [采用规范](../../standards/adoption.md#模板维护记录与发布快照)；采用项目保留自己的历史。
