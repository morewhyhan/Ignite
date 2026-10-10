<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791594029506382263",
  "release": "agent-preparation-v1",
  "status": "active",
  "outcome": "修复开工顺序、目标覆盖和测试脚手架，并重新观察独立 Agent 的完整执行",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "requirements": ["REQ-PREP-001"],
      "text": "修复准备阶段提前修改产品代码的问题"
    },
    {
      "requirements": ["REQ-PREP-002"],
      "text": "修复一个行为对应多个原始目标的误报"
    },
    {
      "requirements": ["REQ-PREP-003"],
      "text": "脚手架只生成准备资料并提供真实数据库测试起点"
    }
  ],
  "constraints": [
    "使用 WSL/NVM；保留历史 task_contract 1 的兼容行为",
    "修复后重新克隆，不额外提示子智能体使用技能"
  ],
  "non_goals": [
    "不能用一次廉价模型运行证明所有模型总能完整执行",
    "不修改学生产品业务或采用真实外部数据"
  ],
  "authorization": {
    "source": "用户明确要求依上一轮观察修复，清理 TEMP 后重新调用廉价子智能体"
  },
  "deliverables": ["原生开工检查、Release 覆盖判定、准备脚手架", "同普通需求的新副本执行观察"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "37bfdb04f186fc2a473cf22da3ce36c5b620786b",
  "requirements": ["REQ-PREP-001", "REQ-PREP-002", "REQ-PREP-003"],
  "acceptance": [
    {
      "checks": [
        {
          "test": "tests/contracts/preparation-contract.test.ts::[AC-PREP-001]",
          "layer": "unit"
        }
      ],
      "required_layers": ["unit"],
      "id": "AC-PREP-001",
      "tests": ["tests/contracts/preparation-contract.test.ts::[AC-PREP-001]"]
    },
    {
      "checks": [
        {
          "test": "tests/contracts/preparation-contract.test.ts::[AC-PREP-002]",
          "layer": "unit"
        }
      ],
      "required_layers": ["unit"],
      "id": "AC-PREP-002",
      "tests": ["tests/contracts/preparation-contract.test.ts::[AC-PREP-002]"]
    },
    {
      "checks": [
        {
          "test": "tests/contracts/template-runtime.test.ts::[AC-PREP-003]",
          "layer": "unit"
        }
      ],
      "required_layers": ["unit"],
      "id": "AC-PREP-003",
      "tests": ["tests/contracts/template-runtime.test.ts::[AC-PREP-003]"]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "识别现有行为、写入边界和原始目标",
      "phase": "prepare",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "提交真实行为测试并记录红灯",
      "phase": "red",
      "acceptance": ["AC-PREP-001", "AC-PREP-002", "AC-PREP-003"],
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "phase": "implement",
      "acceptance": ["AC-PREP-001", "AC-PREP-002", "AC-PREP-003"],
      "status": "doing"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "phase": "verify",
      "status": "todo"
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
  "owner": "root",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "migration_impact": "none",
    "rollback": "回滚本轮原生工具和规则提交",
    "access_rationale": "只调整执行检查和脚手架，无业务数据访问",
    "destructive_authorization": null
  },
  "write_scope": [
    "scripts/ignite/",
    "scripts/create-module.mjs",
    "scripts/create-change.mjs",
    "tests/contracts/preparation-contract.test.ts",
    "tests/contracts/template-runtime.test.ts",
    "docs/features/ai-execution-trust.md",
    "docs/plans/",
    "docs/standards/",
    "docs/designs/execution.md",
    "docs/others/evidence/",
    "AGENTS.md"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-PREP-001",
      "test": "tests/contracts/preparation-contract.test.ts::[AC-PREP-001]",
      "run_id": "tdd-20261010011650-f5032c"
    },
    {
      "acceptance_id": "AC-PREP-002",
      "test": "tests/contracts/preparation-contract.test.ts::[AC-PREP-002]",
      "run_id": "tdd-20261010011709-58abf4"
    },
    {
      "acceptance_id": "AC-PREP-003",
      "test": "tests/contracts/template-runtime.test.ts::[AC-PREP-003]",
      "run_id": "tdd-20261010011731-99f951"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-10"
}
-->

# Ignite 实施计划：agent-preparation

> 复制本文件到 `docs/plans/YYYYMMDD-agent-preparation.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

依据当前 Plan 元数据执行。

## 目标

依据当前 Plan 元数据执行。

## 原始目标与覆盖核对

依据当前 Plan 元数据执行。

## 整体判断与推进顺序

依据当前 Plan 元数据执行。

## 非目标

依据当前 Plan 元数据执行。

## 变更类型

依据当前 Plan 元数据执行。

## 输入规格

依据当前 Plan 元数据执行。

## 已关闭问题

依据当前 Plan 元数据执行。

## 测试与验收设计

依据当前 Plan 元数据执行。

## 实现任务

依据当前 Plan 元数据执行。

## 验收方式

依据当前 Plan 元数据执行。

## 设计回写

依据当前 Plan 元数据执行。

## 状态记录

依据当前 Plan 元数据执行。

## 准出条件

依据当前 Plan 元数据执行。

上一轮完整读取了所需技能，但在 prepare 未通过前改了 src/config/site.ts。Release 对同一 AC 的多目标引用误报重复。真实数据库与浏览器资料经 Agent 自行修正，但父任务在 30 分钟中断，因此不能判定完整开发最终失败。此次先通过原生行为回归再做独立完整运行。按 how、figure-it-out、show-me-your-work、tdd 和真实行为验证方法推进，不以提速衡量技能。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [x] T2 · 提交真实行为测试并记录红灯 · done
- [ ] T3 · 实施最小存量修改 · doing
- [ ] T4 · 验证兼容性并回写设计 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
