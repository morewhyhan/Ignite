# Ignite 状态摘要

模板状态：`template-baseline`
输入指纹：`bd76c806031f`
当前 Plan：2；结构化历史：11；未迁移历史：0

## 当前工作

- `IGT-1794029824186174768` · `active` · `spec-closure-docs-v1`
- `IGT-1793990498597924061` · `verifying` · `spec-closure-glossary-v1`

## 发布范围

- `doc-fill-v1` · `done`
  - Plan：`IGT-1794061076111244240`
  - 缺少证据：无
  - 最终版本验收：passed（c21bc4b0788c）
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `doc-spec-closure-v1` · `done`
  - Plan：`IGT-1794057232553297948`
  - 缺少证据：无
  - 最终版本验收：passed（c21bc4b0788c）
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `spec-closure-connection-v1` · `verifying`
  - Plan：`IGT-1793982738195660699`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify spec-closure-connection-v1 --plan IGT-1793982738195660699
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `spec-closure-content-v1` · `verifying`
  - Plan：`IGT-202611060005`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify spec-closure-content-v1 --plan IGT-202611060005
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `spec-closure-docs-v1` · `active`
  - Plan：`IGT-1794029824186174768`
  - 缺少证据：`IGT-1794029824186174768:check-docs`（missing：no run is bound to this evidence requirement）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-1794029824186174768
  - 未完成原始目标：GOAL-001 把纯文档类缺口按判据落到文档，并用 docs:check 复现
- `spec-closure-domain-v1` · `cancelled`
  - Plan：`IGT-202611060008`
  - 缺少证据：无
  - 最终版本验收：missing
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `spec-closure-glossary-v1` · `verifying`
  - Plan：`IGT-1793990498597924061`
  - 缺少证据：`IGT-1793990498597924061:check-docs`（stale：repository or Plan inputs changed after this run）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-1793990498597924061
  - 未完成原始目标：GOAL-001 仓库内三组术语与三套状态词唯一定义，两条历史延期项各有处置
- `spec-closure-ledger-maintenance-v1` · `verifying`
  - Plan：`IGT-202611060006`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify spec-closure-ledger-maintenance-v1 --plan IGT-202611060006
  - 未完成原始目标：无已登记缺口（仍需语义核对）
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
- `spec-closure-truth-v1` · `verifying`
  - Plan：`IGT-202611060007`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify spec-closure-truth-v1 --plan IGT-202611060007
  - 未完成原始目标：无已登记缺口（仍需语义核对）

## 结构问题

- 无。

> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。
