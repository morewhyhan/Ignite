# Ignite 状态摘要

模板状态：`template-baseline`
输入指纹：`4ef96b372645`
当前 Plan：1；结构化历史：4；未迁移历史：0

## 当前工作

- `IGT-1790466964730388559` · `active` · `workflow-entry-reliability-v1`

## 发布范围

- `ai-execution-trust-v1` · `invalid`
  - Plan：`IGT-006`、`IGT-007`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite next --plan IGT-006
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
- `workflow-entry-reliability-v1` · `active`
  - Plan：`IGT-1790466964730388559`
  - 缺少证据：`IGT-1790466964730388559:check-integration`（stale：repository or Plan inputs changed after this run）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-1790466964730388559
  - 未完成原始目标：GOAL-001 审计并完善模板从首次采用到交付的 AI 开发执行流程，修复已证实的采用与执行可靠性问题

## 结构问题

- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-016: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-001: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-002: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-003: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-005: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-004: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-006: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-007: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-008: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-009: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-010: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-011: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-012: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-013: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-014: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-015: TDD red proof is invalid or its test changed before green
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-001: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-002: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-003: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-004: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-005: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-006: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-007: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-008: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-009: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-010: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-011: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-012: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-013: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-014: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-015: done Plan requires a matching behavior-test red result
- docs/plans/20260925-ai-execution-trust.md: AC-TRUST-016: done Plan requires a matching behavior-test red result
- docs/plans/20260927-template-history-evidence.md: AC-EXECUTION-011: TDD red proof is invalid or its test changed before green
- docs/plans/20260927-template-history-evidence.md: AC-EXECUTION-011: done Plan requires a matching behavior-test red result

> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。
