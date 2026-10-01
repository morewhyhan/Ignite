# Ignite 状态摘要

模板状态：`template-baseline`
输入指纹：`80f6d60097c8`
当前 Plan：2；结构化历史：5；未迁移历史：0

## 当前工作

- `IGT-1790620890185389037` · `blocked` · `landing-value-and-auth-panel-v1`
- `IGT-1790791844798755166` · `blocked` · `production-sqlite-opt-in-v1`

## 发布范围

- `document-line-coordination-v1` · `done`
  - Plan：`IGT-1790848085501147562`
  - 缺少证据：无
  - 最终版本验收：passed（0f006e88d3ce）
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `execution-prompts-v1` · `verifying`
  - Plan：`IGT-1790833767681868205`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify execution-prompts-v1 --plan IGT-1790833767681868205
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `landing-value-and-auth-panel-v1` · `blocked`
  - Plan：`IGT-1790620890185389037`
  - 缺少证据：`IGT-1790620890185389037:check-integration`（missing：no run is bound to this evidence requirement）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-1790620890185389037
  - 未完成原始目标：GOAL-001 访客能理解 Ignite 的核心价值和文档体系，并顺畅使用响应式登录/注册面板
- `native-execution-standards-v1` · `verifying`
  - Plan：`IGT-1790838314910384474`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify native-execution-standards-v1 --plan IGT-1790838314910384474
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `production-sqlite-opt-in-v1` · `blocked`
  - Plan：`IGT-1790791844798755166`
  - 缺少证据：`IGT-1790791844798755166:check-integration`（missing：no run is bound to this evidence requirement）
  - 最终版本验收：stale
  - 下一步：pnpm ignite next --plan IGT-1790791844798755166
  - 未完成原始目标：GOAL-001 为低流量单机展示部署显式启用持久化 SQLite，同时保留生产环境默认拒绝
- `systematic-execution-v1` · `verifying`
  - Plan：`IGT-1790826869649125989`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify systematic-execution-v1 --plan IGT-1790826869649125989
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `ui-visual-refresh-v1` · `verifying`
  - Plan：`IGT-1790601198510423198`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify ui-visual-refresh-v1 --plan IGT-1790601198510423198
  - 未完成原始目标：无已登记缺口（仍需语义核对）

## 结构问题

- 无。

> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。
