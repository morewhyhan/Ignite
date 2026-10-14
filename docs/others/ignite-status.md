# Ignite 状态摘要

模板状态：`template-baseline`
输入指纹：`7e58daa8620d`
当前 Plan：1；结构化历史：2；未迁移历史：0

## 当前工作

- `IGT-1791976482786711869` · `active` · `startup-focus-v1`

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
- `startup-focus-v1` · `active`
  - Plan：`IGT-1791976482786711869`
  - 缺少证据：无
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-1791976482786711869
  - 未完成原始目标：GOAL-1 同版本方法正文优先直接读取并复用，减少重复阅读和不必要的 WSL 审批调用；依赖安装等待期间先整理已明确需求，只在实际依赖测试工具时等待环境；隔离各项目 node_modules 并复用现有下载缓存，不用项目准备改全局配置；修正同一开工流程的多行目标误拒绝

## 结构问题

- 无。

> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。
