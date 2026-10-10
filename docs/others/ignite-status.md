# Ignite 状态摘要

模板状态：`template-baseline`
输入指纹：`d21c7667dd91`
当前 Plan：1；结构化历史：0；未迁移历史：0

## 当前工作

- `IGT-1791616797429443754` · `active` · `selected-acceptance-v1`

## 发布范围

- `selected-acceptance-v1` · `invalid`
  - Plan：`IGT-1791616797429443754`
  - 缺少证据：`IGT-1791616797429443754:check-integration`（missing：no run is bound to this evidence requirement）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-1791616797429443754
  - 未完成原始目标：GOAL-1 修正手动选择单项测试时报告器对未选择验收的误报，保持绑定运行严格校验

## 结构问题

- docs/plans/20261010-selected-acceptance.md: Plan progress block is stale; run pnpm ignite plan refresh <ID>
- docs/plans/20261010-selected-acceptance.md: scripts/testing/vitest-acceptance-reporter.mjs: implementation changed before the first valid red; restore it, complete preparation and record a real red first

> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。
