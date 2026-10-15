# Ignite 状态摘要

模板状态：`template-baseline`
输入指纹：`f7ef19ee129f`
当前 Plan：1；结构化历史：4；未迁移历史：0

## 当前工作

- `IGT-1792029176916013864` · `active` · `tdd-evidence-format-v1`

## 发布范围

- `agent-run-recovery-v1` · `verifying`
  - Plan：`IGT-1791813346292559552`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify agent-run-recovery-v1 --plan IGT-1791813346292559552
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `document-workflow-v1` · `verifying`
  - Plan：`IGT-1791708512635291997`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify document-workflow-v1 --plan IGT-1791708512635291997
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `prepare-test-ownership-v1` · `verifying`
  - Plan：`IGT-1792007450670818648`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify prepare-test-ownership-v1 --plan IGT-1792007450670818648
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `startup-focus-v1` · `verifying`
  - Plan：`IGT-1791976482786711869`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify startup-focus-v1 --plan IGT-1791976482786711869
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `tdd-evidence-format-v1` · `active`
  - Plan：`IGT-1792029176916013864`
  - 缺少证据：`IGT-1792029176916013864:check-integration`（missing：no run is bound to this evidence requirement）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-1792029176916013864
  - 未完成原始目标：GOAL-001 修复 TDD runner 生成的 JSON 证据不符合仓库 Prettier 格式的问题，同时保留 receipt 字段和哈希值。

## 结构问题

- 无。

> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。
