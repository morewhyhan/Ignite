<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060004",
  "release": "spec-closure-ledger-v1",
  "status": "active",
  "outcome": "账本为每条差异记录真实实施结果，met 条目必须指向真实计划",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-ed3c40cb",
      "executor": "ignite-executor",
      "source": "DSH subagent ed3c40cb independent draft review of IGT-202611060004, three rounds, approved at 18929b4",
      "subject_fingerprint": "115767c65215b888962f75f993cb916e92af56beed41d8f13cec9435cebde95c",
      "verdict": "approved",
      "findings": [
        {
          "id": "LB-009",
          "severity": "blocking",
          "summary": "Resolved: EXPECTED_MET_PLAN pins each met item to its agreed live plan.",
          "resolved": true
        },
        {
          "id": "LB-010",
          "severity": "nonblocking",
          "summary": "Resolved: T3 records the P0 cancellation and b03c24f landing for GAP-01.",
          "resolved": true
        },
        {
          "id": "LB-011",
          "severity": "nonblocking",
          "summary": "Resolved: contradiction says exactly 5 and the test design names sets, order and mapping.",
          "resolved": true
        },
        {
          "id": "LB-003",
          "severity": "nonblocking",
          "summary": "Text/stage immutability is not asserted; delivery diff review must catch it.",
          "resolved": false
        },
        {
          "id": "LB-007",
          "severity": "nonblocking",
          "summary": "base_commit is the plan creation commit; T1 prep outside delivery diff.",
          "resolved": false
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T20:18:55.172Z"
    },
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-ed3c40cb",
      "executor": "ignite-executor",
      "source": "DSH subagent ed3c40cb independent draft review of IGT-202611060004, three rounds, approved at 18929b4",
      "subject_fingerprint": "4ee9bc8bf6ea31484699072d558859c84535a9ae5be94bdd951649e8c1a76242",
      "verdict": "approved",
      "findings": [
        {
          "id": "LB-009",
          "severity": "blocking",
          "summary": "Resolved: EXPECTED_MET_PLAN pins each met item to its agreed live plan.",
          "resolved": true
        },
        {
          "id": "LB-010",
          "severity": "nonblocking",
          "summary": "Resolved: T3 records the P0 cancellation and b03c24f landing for GAP-01.",
          "resolved": true
        },
        {
          "id": "LB-011",
          "severity": "nonblocking",
          "summary": "Resolved: contradiction says exactly 5 and the test design names sets, order and mapping.",
          "resolved": true
        },
        {
          "id": "LB-003",
          "severity": "nonblocking",
          "summary": "Text/stage immutability is not asserted; delivery diff review must catch it.",
          "resolved": false
        },
        {
          "id": "LB-007",
          "severity": "nonblocking",
          "summary": "base_commit is the plan creation commit; T1 prep outside delivery diff.",
          "resolved": false
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T20:19:15.296Z"
    },
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-ed3c40cb",
      "executor": "ignite-executor",
      "source": "DSH subagent ed3c40cb independent draft review of IGT-202611060004, three rounds, approved at 18929b4",
      "subject_fingerprint": "8580ad2924a8ab557556ca47883ddd71934734d4663f7fb937fd657e85b0b289",
      "verdict": "approved",
      "findings": [
        {
          "id": "LB-009",
          "severity": "blocking",
          "summary": "Resolved: EXPECTED_MET_PLAN pins each met item to its agreed live plan.",
          "resolved": true
        },
        {
          "id": "LB-010",
          "severity": "nonblocking",
          "summary": "Resolved: T3 records the P0 cancellation and b03c24f landing for GAP-01.",
          "resolved": true
        },
        {
          "id": "LB-011",
          "severity": "nonblocking",
          "summary": "Resolved: contradiction says exactly 5 and the test design names sets, order and mapping.",
          "resolved": true
        },
        {
          "id": "LB-003",
          "severity": "nonblocking",
          "summary": "Text/stage immutability is not asserted; delivery diff review must catch it.",
          "resolved": false
        },
        {
          "id": "LB-007",
          "severity": "nonblocking",
          "summary": "base_commit is the plan creation commit; T1 prep outside delivery diff.",
          "resolved": false
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T20:26:37.527Z"
    }
  ],
  "verification_contract": 2,
  "binding_contract": 1,
  "goals": [
    {
      "text": "账本每条记录实施结果，且 met 条目有计划",
      "requirements": ["REQ-SPEC-007"]
    }
  ],
  "constraints": ["不重写条目文本", "不改变负责阶段", "不追溯修改已完成计划证据"],
  "non_goals": ["不改 P0–P2 的计划与证据", "不重排条目"],
  "authorization": {
    "source": "用户 2026-11-06 收尾 goal 指令"
  },
  "deliverables": ["带 result 字段的 52 条账本", "账本校验断言", "执行设计回写"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "2bb56368a18b5204b65b3aa7b8dba2fcc3f8f249",
  "requirements": ["REQ-SPEC-007"],
  "acceptance": [
    {
      "id": "AC-SPEC-007",
      "tests": ["tests/contracts/spec-closure-ledger.test.ts::[AC-SPEC-007]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/spec-closure-ledger.test.ts::[AC-SPEC-007]",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "登记规格、计划与断言并提交基线",
      "phase": "prepare",
      "status": "done",
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
      "acceptance": ["AC-SPEC-007"],
      "status": "doing",
      "result": "账本缺少 result 时断言真实失败并写入原生回执。",
      "scope": ["tests/contracts/spec-closure-ledger.test.ts", "docs/others/evidence/tdd/"],
      "depends_on": ["T1"],
      "owner": "ignite-executor"
    },
    {
      "id": "T3",
      "title": "为 52 条回填实施结果",
      "phase": "implement",
      "acceptance": ["AC-SPEC-007"],
      "status": "todo",
      "result": "为 52 条回填 result：met 为 GAP-01（IGT-202611060001，P0 已取消，登记随 b03c24f 落地）、GAP-10（IGT-202611060002）、GAP-20/21/24（IGT-202611060003）；kept 为基线已满足的 11 条（GAP-14/18/25/35/38/39/40/45/48/51/52）；partial 为 GAP-23；其余为 missing。",
      "scope": ["docs/others/spec-closure/ledger.json"],
      "depends_on": ["T2"],
      "owner": "ignite-executor"
    },
    {
      "id": "T4",
      "title": "完成检查与回写",
      "phase": "verify",
      "acceptance": ["AC-SPEC-007"],
      "status": "todo",
      "result": "检查通过，执行设计记录账本结果字段。",
      "scope": ["docs/designs/execution.md"],
      "depends_on": ["T3"],
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
  "risk": "infrastructure",
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
  "tdd_evidence": [
    {
      "acceptance_id": "AC-SPEC-007",
      "test": "tests/contracts/spec-closure-ledger.test.ts::[AC-SPEC-007]",
      "run_id": "tdd-20261105202456-dbbbcc"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-05"
}
-->

# Ignite 实施计划：spec-closure-ledger

> 账本为每条差异记录真实实施结果，met 条目必须指向真实计划。

## 状态

顶部元数据的 status 是唯一状态；tasks 是唯一子任务状态。

## 目标

维护者读账本时能直接看出每条差异是已实现、部分实现还是未实现。

## 原始目标与覆盖核对

| 用户原话或可追溯来源    | 本轮目标         | REQ          | AC          | 处理结果 |
| ----------------------- | ---------------- | ------------ | ----------- | -------- |
| 账本校准：39 条如实回填 | 每条记录实施结果 | REQ-SPEC-007 | AC-SPEC-007 | 保留     |

## 整体判断与推进顺序

- 整体链路与事实：账本有 52 条，只有 stage/plan/disposition，没有实施结果。
- 当前主要问题：读者无法区分计划意图与已实现事实。
- 推进与尺度：只加字段并如实回填，不改条目文本。
- 纠偏与停止：字段缺失就补，取值错就修；断言通过即停止。

## 来源与绑定矩阵

| Source ID    | 来源                                          | 适用理由     | 状态    | Binding  | 任务 | 验证        |
| ------------ | --------------------------------------------- | ------------ | ------- | -------- | ---- | ----------- |
| REQ-SPEC-007 | docs/features/spec-closure-ledger.md          | 本轮产品要求 | missing | BIND-001 | T3   | AC-SPEC-007 |
| AC-SPEC-007  | docs/features/spec-closure-ledger.md          | 本轮验收     | missing | BIND-002 | T2   | AC-SPEC-007 |
| DES-EXEC-101 | docs/designs/execution.md                     | 记录账本事实 | missing | BIND-003 | T4   | 文档检查    |
| ADR-0004     | docs/others/adr/0004-spec-closure-contract.md | 闭环契约决策 | met     | BIND-004 | T3   | AC-SPEC-007 |

## 主要矛盾

目标要求账本可判断完成度。
当前账本只有意图字段，没有结果字段。
因此完成度判断与现有账本不能同时成立。
支撑事实：39 条标 implement，实际只有 5 条落地（GAP-01/10/20/21/24）。
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

一条断言：52 条都必须有合法 result（met/kept/partial/missing）；met 集合精确等于 GAP-01/10/20/21/24 且各自指向约定的实时计划；kept 集合为基线已满足的 11 条；partial 为 GAP-23；GAP-02/03/05/06/08/46 必须为 missing；条目顺序与总数不变。

## 实现任务

见顶部 tasks：T1 准备，T2 红灯，T3 回填，T4 验证回写。

## 验收方式

运行 tests/contracts/spec-closure-ledger.test.ts；node scripts/check-docs.mjs；pnpm ignite check --plan IGT-202611060004 --level auto。

## 设计回写

在 docs/designs/execution.md 记录账本结果字段。

## 状态记录

- 2026-11-06：建立计划；账本没有 result 字段，断言失败。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 登记规格、计划与断言并提交基线 · done
- [ ] T2 · 运行账本断言并记录原生红灯 · doing
- [ ] T3 · 为 52 条回填实施结果 · todo
- [ ] T4 · 完成检查与回写 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

断言通过、文档检查退出码 0、check-dev 有效、设计已回写。

## TDD 恢复记录

2026-11-05，AC-SPEC-007：add。保留原回执 tdd-20261105202145-5e0d5c；对应任务重新进入真实红灯，旧验收绑定已撤销。本次恢复没有生成通过或失败凭证。
