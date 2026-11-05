<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060004",
  "release": "spec-closure-ledger-v1",
  "status": "draft",
  "outcome": "账本为每条差异记录真实实施结果，met 条目必须指向真实计划",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "binding_contract": 1,
  "goals": [
    {
      "text": "账本每条记录实施结果，且 met 条目有计划",
      "requirements": [
        "REQ-SPEC-007"
      ]
    }
  ],
  "constraints": [
    "不重写条目文本",
    "不改变负责阶段",
    "不追溯修改已完成计划证据"
  ],
  "non_goals": [
    "不改 P0–P2 的计划与证据",
    "不重排条目"
  ],
  "authorization": {
    "source": "用户 2026-11-06 收尾 goal 指令"
  },
  "deliverables": [
    "带 result 字段的 52 条账本",
    "账本校验断言",
    "执行设计回写"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "2bb56368a18b5204b65b3aa7b8dba2fcc3f8f249",
  "requirements": [
    "REQ-SPEC-007"
  ],
  "acceptance": [
    {
      "id": "AC-SPEC-007",
      "tests": [
        "tests/contracts/spec-closure-ledger.test.ts::[AC-SPEC-007]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/spec-closure-ledger.test.ts::[AC-SPEC-007]",
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
      "title": "登记规格、计划与断言并提交基线",
      "phase": "prepare",
      "status": "todo",
      "result": "Feature、计划、发布范围与断言写入并提交基线，准备检查通过。",
      "scope": [
        "docs/features/spec-closure-ledger.md",
        "docs/plans/20261106-spec-closure-ledger.md",
        "docs/plans/releases/spec-closure-ledger-v1.json",
        "tests/contracts/spec-closure-ledger.test.ts"
      ],
      "depends_on": [],
      "owner": "ignite-executor"
    },
    {
      "id": "T2",
      "title": "运行账本断言并记录原生红灯",
      "phase": "red",
      "acceptance": [
        "AC-SPEC-007"
      ],
      "status": "todo",
      "result": "账本缺少 result 时断言真实失败并写入原生回执。",
      "scope": [
        "tests/contracts/spec-closure-ledger.test.ts",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": [
        "T1"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T3",
      "title": "为 52 条回填实施结果",
      "phase": "implement",
      "acceptance": [
        "AC-SPEC-007"
      ],
      "status": "todo",
      "result": "每条带 result，met 条目指向真实计划，断言转绿。",
      "scope": [
        "docs/others/spec-closure/ledger.json"
      ],
      "depends_on": [
        "T2"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T4",
      "title": "完成检查与回写",
      "phase": "verify",
      "acceptance": [
        "AC-SPEC-007"
      ],
      "status": "todo",
      "result": "检查通过，执行设计记录账本结果字段。",
      "scope": [
        "docs/designs/execution.md"
      ],
      "depends_on": [
        "T3"
      ],
      "owner": "ignite-executor"
    }
  ],
  "bindings": [
    {
      "id": "BIND-001",
      "source": "REQ-SPEC-007",
      "applicable": "本轮产品要求",
      "status": "missing",
      "task": "T3",
      "check": "AC-SPEC-007"
    },
    {
      "id": "BIND-002",
      "source": "AC-SPEC-007",
      "applicable": "本轮验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-SPEC-007"
    },
    {
      "id": "BIND-003",
      "source": "DES-EXEC-101",
      "applicable": "执行设计记录账本事实",
      "status": "missing",
      "task": "T4",
      "check": "文档检查"
    },
    {
      "id": "BIND-004",
      "source": "ADR-0004",
      "applicable": "闭环契约决策",
      "status": "met",
      "task": "T3",
      "check": "AC-SPEC-007"
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
  "owner": "ignite-executor",
  "risk": "docs",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "只改治理记录与断言，不读写业务数据。",
    "migration_impact": "none",
    "rollback": "撤销提交即可恢复，字段为纯增量。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/spec-closure-ledger.md",
    "docs/plans/20261106-spec-closure-ledger.md",
    "docs/plans/releases/spec-closure-ledger-v1.json",
    "docs/others/spec-closure/ledger.json",
    "docs/designs/execution.md",
    "docs/others/evidence/",
    "tests/contracts/spec-closure-ledger.test.ts"
  ],
  "tdd_evidence": [],
  "required_evidence": [
    "check-dev"
  ],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-06"
}
-->
# Ignite 实施计划：spec-closure-ledger

> 账本为每条差异记录真实实施结果，met 条目必须指向真实计划。

## 状态

顶部元数据的 status 是唯一状态；tasks 是唯一子任务状态。

## 目标

维护者读账本时能直接看出每条差异是已实现、部分实现还是未实现。

## 原始目标与覆盖核对

| 用户原话或可追溯来源 | 本轮目标 | REQ | AC | 处理结果 |
| --- | --- | --- | --- | --- |
| 账本校准：39 条如实回填 | 每条记录实施结果 | REQ-SPEC-007 | AC-SPEC-007 | 保留 |

## 整体判断与推进顺序

- 整体链路与事实：账本有 52 条，只有 stage/plan/disposition，没有实施结果。
- 当前主要问题：读者无法区分计划意图与已实现事实。
- 推进与尺度：只加字段并如实回填，不改条目文本。
- 纠偏与停止：字段缺失就补，取值错就修；断言通过即停止。

## 来源与绑定矩阵

| Source ID | 来源 | 适用理由 | 状态 | Binding | 任务 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-SPEC-007 | docs/features/spec-closure-ledger.md | 本轮产品要求 | missing | BIND-001 | T3 | AC-SPEC-007 |
| AC-SPEC-007 | docs/features/spec-closure-ledger.md | 本轮验收 | missing | BIND-002 | T2 | AC-SPEC-007 |
| DES-EXEC-101 | docs/designs/execution.md | 记录账本事实 | missing | BIND-003 | T4 | 文档检查 |
| ADR-0004 | docs/others/adr/0004-spec-closure-contract.md | 闭环契约决策 | met | BIND-004 | T3 | AC-SPEC-007 |

## 主要矛盾

目标要求账本可判断完成度。
当前账本只有意图字段，没有结果字段。
因此完成度判断与现有账本不能同时成立。
支撑事实：39 条标 implement，实际落地约 6 条。
推翻条件：若账本已记录结果，本矛盾不成立。

## 次要矛盾

- 历史条目缺少证据引用：本轮只要求 met 条目有计划，证据引用留到后续。

## 决策原则与方案比较

- 原则：只加字段，不改文本；如实回填，不美化。
- 采用方案：result 枚举 met/partial/missing，met 必须有 plan。
- 替代方案：用布尔 implemented（否决，无法表达部分实现）。
- 代价：一次性回填 52 条。

## 回退

撤销提交即可恢复；字段为纯增量。

## 变更类型

存量改动：治理记录与断言，无数据库与接口变更。

## 非目标

不改 P0–P2 计划与证据，不重排条目。

## 输入规格

- 需求：docs/features/spec-closure-ledger.md
- 决策：docs/others/adr/0004-spec-closure-contract.md

## 已关闭问题

无未决问题。

## 测试与验收设计

一条断言：52 条都必须有合法 result，met 条目必须有 plan。

## 实现任务

见顶部 tasks：T1 准备，T2 红灯，T3 回填，T4 验证回写。

## 验收方式

运行 tests/contracts/spec-closure-ledger.test.ts；node scripts/check-docs.mjs；pnpm ignite check --plan IGT-202611060004 --level auto。

## 设计回写

在 docs/designs/execution.md 记录账本结果字段。

## 状态记录

- 2026-11-06：建立计划；账本没有 result 字段，断言失败。

<!-- ignite-progress -->

状态：draft（由元数据生成）

- [ ] T1 · 登记规格、计划与断言并提交基线 · todo
- [ ] T2 · 运行账本断言并记录原生红灯 · todo
- [ ] T3 · 为 52 条回填实施结果 · todo
- [ ] T4 · 完成检查与回写 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

断言通过、文档检查退出码 0、check-dev 有效、设计已回写。
