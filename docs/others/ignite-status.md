# Ignite 状态摘要

模板状态：`template-baseline`
输入指纹：`fc1b4b01dbd0`
当前 Plan：1；结构化历史：5；未迁移历史：0

## 当前工作

- `IGT-202611060006` · `verifying` · `spec-closure-ledger-maintenance-v1`

## 发布范围

- `spec-closure-content-v1` · `verifying`
  - Plan：`IGT-202611060005`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify spec-closure-content-v1 --plan IGT-202611060005
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `spec-closure-ledger-maintenance-v1` · `verifying`
  - Plan：`IGT-202611060006`
  - 缺少证据：无
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-202611060006
  - 未完成原始目标：GOAL-SPEC-LEDGER-OWN 账本期望值由维护计划拥有，可持续刷新
- `spec-closure-ledger-v1` · `cancelled`
  - Plan：`IGT-202611060004`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：null
  - 未完成原始目标：GOAL-SPEC-LEDGER 账本记录真实实施结果，met 条目指向真实计划
- `spec-closure-p0-v1` · `cancelled`
  - Plan：`IGT-202611060001`
  - 缺少证据：无
  - 最终版本验收：missing
  - 下一步：null
  - 未完成原始目标：GOAL-SPEC-CLOSURE-P0 把规格闭环标准登记为有效来源，并把本轮差异与历史归属固化为可检查的记录；GOAL-SPEC-CONNECTION 解决各板块、各领域模块之间的连接可靠性，并让约束尽量由代码与文档体系承担
- `spec-closure-p1-v1` · `verifying`
  - Plan：`IGT-202611060002`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify spec-closure-p1-v1 --plan IGT-202611060002
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `spec-closure-p2-v1` · `verifying`
  - Plan：`IGT-202611060003`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify spec-closure-p2-v1 --plan IGT-202611060003
  - 未完成原始目标：无已登记缺口（仍需语义核对）

## 结构问题

- 无。

> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。
