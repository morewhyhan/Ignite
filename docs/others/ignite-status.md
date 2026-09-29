# Ignite 状态摘要

模板状态：`template-baseline`
输入指纹：`d9f222cd125f`
当前 Plan：2；结构化历史：1；未迁移历史：0

## 当前工作

- `IGT-1790620890185389037` · `blocked` · `landing-value-and-auth-panel-v1`
- `IGT-1790683745143711116` · `active` · `public-demo-and-capabilities-v1`

## 发布范围

- `landing-value-and-auth-panel-v1` · `blocked`
  - Plan：`IGT-1790620890185389037`
  - 缺少证据：`IGT-1790620890185389037:check-integration`（missing：no run is bound to this evidence requirement）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-1790620890185389037
  - 未完成原始目标：GOAL-001 访客能理解 Ignite 的核心价值和文档体系，并顺畅使用响应式登录/注册面板
- `public-demo-and-capabilities-v1` · `active`
  - Plan：`IGT-1790683745143711116`
  - 缺少证据：`IGT-1790683745143711116:check-integration`（missing：no run is bound to this evidence requirement）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-1790683745143711116
  - 未完成原始目标：GOAL-001 首页分别提供 GitHub 获取模板、免登录 Demo 预览和集成能力说明入口；Demo 使用临时样例数据，不写入真实账号或服务端业务数据。
- `ui-visual-refresh-v1` · `verifying`
  - Plan：`IGT-1790601198510423198`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify ui-visual-refresh-v1 --plan IGT-1790601198510423198
  - 未完成原始目标：无已登记缺口（仍需语义核对）

## 结构问题

- 无。

> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。
