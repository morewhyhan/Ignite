<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-007",
  "release": "ai-execution-trust-v1",
  "status": "done",
  "outcome": "模板副本能完整、安全地归档所有继承的交付与验收证据",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "所有继承的 Plan、Release、运行记录和 TDD 证据都能随模板历史一起归档",
      "requirements": [
        "REQ-EXECUTION-011"
      ]
    }
  ],
  "constraints": [
    "保留已有 Plan、Release、运行和 TDD 证据，不因模板采用而删除原始内容",
    "归档到新 Git 历史项目后，完整克隆和浅克隆的现有安全边界保持不变"
  ],
  "non_goals": [
    "不更改业务功能、数据库、API 或前端行为",
    "不把模板自身的验收证据解释为衍生产品的验收结果"
  ],
  "authorization": {
    "source": "用户要求完成本轮全部验收并推送 v2.0；最终全量检查发现历史归档验收遗漏 TDD 证据，授权在推送前修复"
  },
  "deliverables": [
    "scripts/ignite/adoption.mjs",
    "docs/features/execution.md",
    "docs/standards/adoption.md",
    "tests/contracts/template-history.test.ts",
    "tests/contracts/execution-reliability.test.ts"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "只归档模板自带的本地规格与验收记录，不读取或迁移业务数据。",
    "migration_impact": "none",
    "rollback": "回滚本 Plan 的代码、规格和文档提交；归档命令保留原有事务式回滚行为。"
  },
  "base_commit": "6dfd30678b05c51144aa7458e0cc9c0a57e4ad19",
  "requirements": [
    "REQ-EXECUTION-011"
  ],
  "acceptance": [
    {
      "id": "AC-EXECUTION-011",
      "tests": [
        "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-011]",
        "tests/contracts/template-history.test.ts::[AC-EXECUTION-011]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-011]",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/template-history.test.ts::[AC-EXECUTION-011]",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": [
    "unit"
  ],
  "tasks": [
    {
      "id": "T1",
      "title": "确认模板副本中各类基线记录和归档边界",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "增加多记录与 TDD 证据归档回归验收",
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实现 TDD 证据与其余继承记录的统一归档",
      "status": "done"
    },
    {
      "id": "T4",
      "title": "完成本 Plan 验收并归档状态",
      "status": "done"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": [],
    "remaining": []
  },
  "owner": "template-maintainer",
  "risk": "infrastructure",
  "write_scope": [
    "scripts/ignite/adoption.mjs",
    "tests/contracts/execution-reliability.test.ts",
    "tests/contracts/template-history.test.ts",
    "docs/features/execution.md",
    "docs/standards/adoption.md",
    "docs/plans/20260927-template-history-evidence.md",
    "docs/plans/releases/ai-execution-trust-v1.json",
    "docs/others/ignite-status.md",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-011",
      "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-011]",
      "run_id": "tdd-20260926202644-532a49"
    }
  ],
  "required_evidence": [
    "check-integration"
  ],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20260926205000-8f3ecd"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "e79841c330c1efa046d1009f2e2b0a3b932dd0cf",
  "updated_at": "2026-09-26"
}
-->

# Ignite 实施计划：template-history-evidence

## 目标

模板副本可能带有多个有效的基线交付记录。使用新 Git 历史采用模板时，所有 Plan、Release、运行清单和 TDD 红灯记录都应被统一归档；保留完整 Git 历史的克隆继续保持原样。

## 原始目标与覆盖核对

| 来源                                                                                                     | 本轮目标                                           | REQ               | AC               | 处理结果                   |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------- | ---------------- | -------------------------- |
| 用户要求最终完成全部验收并推送 v2.0；`pnpm verify` 暴露模板历史检查对记录数量的硬编码以及 TDD 证据未归档 | 让归档规则与当前多 Plan 基线一致，并保留可追溯证据 | REQ-EXECUTION-011 | AC-EXECUTION-011 | 修正规格、归档器和回归测试 |

## 非目标

不修改业务功能、数据库、API 或前端，不将 Ignite 模板自身的验收记录解释为具体项目的交付证据。

## 变更类型

- 类型：`[存量改动]`
- 影响：模板历史归档器、相关功能规格、采用说明和回归测试。
- 回滚：回滚本 Plan 代码与文档提交；已运行的归档命令有索引清单和异常回滚，不修改业务数据。

## 输入规格

- `docs/features/execution.md`：REQ-EXECUTION-011 与 AC-EXECUTION-011。
- `docs/standards/adoption.md`：模板复制后的历史采用步骤。
- `scripts/ignite/adoption.mjs`：已有 Plan、Release、运行记录归档实现。
- `tests/contracts/template-history.test.ts` 与 `tests/contracts/execution-reliability.test.ts`：当前基线和复制场景。

## 测试与验收设计

单元/集成式文件系统夹具覆盖多个 Plan、Release、run manifest 和 TDD 红灯 JSON。确认所有继承文件都被移入同一基于初始提交的归档目录，索引逐条可查，原始路径全部清空；另检查当前仓库中 Plan/Release/run/TDD 目录恰好对应元数据，不允许有未追踪的额外或缺失证据。

## 验收方式

首先以多 Plan、Release、运行记录和 TDD 红灯文件构造重新初始化 Git 的模板副本，确认 `adopt-history --apply` 会将它们全部移入同一索引目录，且源目录不残留。随后用当前仓库静态清单验证所有基线记录都与其 Plan、Release 和证据文件匹配。

执行 `pnpm ignite tdd red --plan IGT-007 --ac AC-EXECUTION-011` 后，补齐归档实现；再运行 `pnpm ignite check --plan IGT-007 --level auto`，绑定本 Plan 集成证据并完成状态归档。Release 级生产构建和浏览器回归属于所有 Plan 完成后的独立 Release 验收，不属于本 Plan 的任务，因此不会阻塞单个 Plan 完成。

## 实现任务

T1 核对当前模板记录；T2 加入多记录归档与静态清单验收；T3 让归档器递归收集 TDD 证据并纳入索引；T4 完成本 Plan 验收并归档状态。最终 Release 验收在所有 Plan 完成后统一执行。

## 设计回写

不改变系统设计事实；采用步骤与 Feature 规格同步更新，保证复制模板后的证据边界准确。

## 状态

顶部元数据为唯一状态源；任务状态由 `pnpm ignite task set-status` 更新。完成后保留本 Plan 的证据，模板采用时统一归档当前所有交付记录。

## 状态记录

<!-- ignite-progress -->

状态：`done`（由元数据生成）

- [x] T1 · 确认模板副本中各类基线记录和归档边界 · done
- [x] T2 · 增加多记录与 TDD 证据归档回归验收 · done
- [x] T3 · 实现 TDD 证据与其余继承记录的统一归档 · done
- [x] T4 · 完成本 Plan 验收并归档状态 · done

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20260926205000-8f3ecd
<!-- /ignite-progress -->

## 准出条件

AC-EXECUTION-011 的测试通过；当前基线的 Plan、Release、运行和 TDD 证据逐项匹配；`pnpm ignite check --plan IGT-007 --level auto` 通过；本 Plan 状态完成。Release 生产构建和浏览器回归由 Release 验收负责，并在全部纳入的 Plan 完成后执行。
