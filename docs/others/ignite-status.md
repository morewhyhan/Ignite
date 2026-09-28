# Ignite 状态摘要

模板状态：`template-baseline`
输入指纹：`c1b95f5a4096`
当前 Plan：1；结构化历史：5；未迁移历史：0

## 当前工作

- `IGT-1790564355969714854` · `active` · `template-clean-start-v1`

## 发布范围

- `ai-execution-trust-v1` · `verifying`
  - Plan：`IGT-006`、`IGT-007`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify ai-execution-trust-v1 --plan IGT-007
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `execution-hardening-v1` · `done`
  - Plan：`IGT-005`
  - 缺少证据：无
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `release-artifacts-v1` · `verifying`
  - Plan：`IGT-1790459700497465269`
  - 缺少证据：无
  - 最终版本验收：missing
  - 下一步：pnpm ignite release verify release-artifacts-v1 --plan IGT-1790459700497465269
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `template-clean-start-v1` · `active`
  - Plan：`IGT-1790564355969714854`
  - 缺少证据：`IGT-1790564355969714854:check-integration`（missing：no run is bound to this evidence requirement）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-1790564355969714854
  - 未完成原始目标：GOAL-001 清理不适合从零开始的模板材料，保留工程能力并修复历史记录与工作区的耦合
- `workflow-entry-reliability-v1` · `verifying`
  - Plan：`IGT-1790466964730388559`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify workflow-entry-reliability-v1 --plan IGT-1790466964730388559
  - 未完成原始目标：无已登记缺口（仍需语义核对）

## 结构问题

- 无。

> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。
