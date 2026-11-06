<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060006",
  "release": "spec-closure-ledger-maintenance-v1",
  "status": "active",
  "outcome": "账本期望值迁到独立文件，由本计划拥有，使账本可持续刷新",
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
      "source": "DSH subagent ed3c40cb independent draft review of IGT-202611060006, approved after LM fixes",
      "subject_fingerprint": "e01673213ec8caf819e799eed87beffd2b6a196f32a31559bdd76f644c752697",
      "verdict": "approved",
      "findings": [
        {
          "id": "LM-007",
          "severity": "nonblocking",
          "summary": "base_commit is the plan creation commit; prep diff outside delivery scope.",
          "resolved": false
        },
        {
          "id": "LM-008",
          "severity": "nonblocking",
          "summary": "Old ledger plan must be superseded in T3 with evidence invalidation.",
          "resolved": false
        },
        {
          "id": "LM-001",
          "severity": "blocking",
          "summary": "Resolved: enum, order, sets and metPlan checked.",
          "resolved": true
        },
        {
          "id": "LM-002",
          "severity": "blocking",
          "summary": "Resolved: T1/T3 scopes include old test deletion.",
          "resolved": true
        },
        {
          "id": "LM-003",
          "severity": "blocking",
          "summary": "Resolved at plan level: superseded_by required by T3.",
          "resolved": true
        },
        {
          "id": "LM-004",
          "severity": "nonblocking",
          "summary": "Resolved: red is the missing expectations file.",
          "resolved": true
        },
        {
          "id": "LM-005",
          "severity": "nonblocking",
          "summary": "Resolved: contentGaps and bindings empty.",
          "resolved": true
        },
        {
          "id": "LM-006",
          "severity": "nonblocking",
          "summary": "Resolved: T3 scope/result explicit.",
          "resolved": true
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-06T03:55:04.617Z"
    },
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-ed3c40cb",
      "executor": "ignite-executor",
      "source": "DSH subagent ed3c40cb independent draft review of IGT-202611060006, approved after LM fixes",
      "subject_fingerprint": "8ff17dff13e8682b3edbdd16635d03cea7f98c95c97194426d68d72f8e129bc6",
      "verdict": "approved",
      "findings": [
        {
          "id": "LM-007",
          "severity": "nonblocking",
          "summary": "base_commit is the plan creation commit; prep diff outside delivery scope.",
          "resolved": false
        },
        {
          "id": "LM-008",
          "severity": "nonblocking",
          "summary": "Old ledger plan must be superseded in T3 with evidence invalidation.",
          "resolved": false
        },
        {
          "id": "LM-001",
          "severity": "blocking",
          "summary": "Resolved: enum, order, sets and metPlan checked.",
          "resolved": true
        },
        {
          "id": "LM-002",
          "severity": "blocking",
          "summary": "Resolved: T1/T3 scopes include old test deletion.",
          "resolved": true
        },
        {
          "id": "LM-003",
          "severity": "blocking",
          "summary": "Resolved at plan level: superseded_by required by T3.",
          "resolved": true
        },
        {
          "id": "LM-004",
          "severity": "nonblocking",
          "summary": "Resolved: red is the missing expectations file.",
          "resolved": true
        },
        {
          "id": "LM-005",
          "severity": "nonblocking",
          "summary": "Resolved: contentGaps and bindings empty.",
          "resolved": true
        },
        {
          "id": "LM-006",
          "severity": "nonblocking",
          "summary": "Resolved: T3 scope/result explicit.",
          "resolved": true
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-06T03:55:54.037Z"
    },
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-ed3c40cb",
      "executor": "ignite-executor",
      "source": "DSH subagent ed3c40cb independent draft review of IGT-202611060006, approved after LM fixes",
      "subject_fingerprint": "f1c0235392457d321b7d792c24bace00784d73c9afaad7facc1a14291398c761",
      "verdict": "approved",
      "findings": [
        {
          "id": "LM-007",
          "severity": "nonblocking",
          "summary": "base_commit is the plan creation commit; prep diff outside delivery scope.",
          "resolved": false
        },
        {
          "id": "LM-008",
          "severity": "nonblocking",
          "summary": "Old ledger plan must be superseded in T3 with evidence invalidation.",
          "resolved": false
        },
        {
          "id": "LM-001",
          "severity": "blocking",
          "summary": "Resolved: enum, order, sets and metPlan checked.",
          "resolved": true
        },
        {
          "id": "LM-002",
          "severity": "blocking",
          "summary": "Resolved: T1/T3 scopes include old test deletion.",
          "resolved": true
        },
        {
          "id": "LM-003",
          "severity": "blocking",
          "summary": "Resolved at plan level: superseded_by required by T3.",
          "resolved": true
        },
        {
          "id": "LM-004",
          "severity": "nonblocking",
          "summary": "Resolved: red is the missing expectations file.",
          "resolved": true
        },
        {
          "id": "LM-005",
          "severity": "nonblocking",
          "summary": "Resolved: contentGaps and bindings empty.",
          "resolved": true
        },
        {
          "id": "LM-006",
          "severity": "nonblocking",
          "summary": "Resolved: T3 scope/result explicit.",
          "resolved": true
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-06T03:56:07.521Z"
    }
  ],
  "verification_contract": 2,
  "binding_contract": 1,
  "content_contract": 1,
  "goals": [
    {
      "text": "账本期望值不再硬编码在测试里",
      "requirements": ["REQ-SPEC-009"]
    }
  ],
  "constraints": ["不改账本条目文本与阶段", "旧账本计划按 superseded 处置", "不自动推断 result"],
  "non_goals": ["不刷新 result 值（仅迁移所有权）", "不改 ledger.json 内容"],
  "authorization": {
    "source": "用户 2026-11-06 选择方案 A"
  },
  "deliverables": ["期望值文件", "维护测试 AC-SPEC-009", "旧计划 superseded 记录", "设计回写"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "de9362a5c6f3848ee2a8663a39d8c4fd925a30f5",
  "requirements": ["REQ-SPEC-009"],
  "acceptance": [
    {
      "id": "AC-SPEC-009",
      "tests": ["tests/contracts/spec-closure-ledger-maintenance.test.ts::[AC-SPEC-009]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/spec-closure-ledger-maintenance.test.ts::[AC-SPEC-009]",
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
      "result": "Feature、计划、发布与断言写入并提交基线，准备检查通过。",
      "scope": [
        "docs/features/spec-closure-ledger-ownership.md",
        "docs/plans/20261106-spec-closure-ledger-maintenance.md",
        "docs/plans/releases/spec-closure-ledger-maintenance-v1.json",
        "tests/contracts/spec-closure-ledger-maintenance.test.ts",
        "tests/contracts/spec-closure-ledger.test.ts"
      ],
      "depends_on": [],
      "owner": "ignite-executor"
    },
    {
      "id": "T2",
      "title": "运行账本断言并记录原生红灯",
      "phase": "red",
      "acceptance": ["AC-SPEC-009"],
      "status": "todo",
      "result": "期望值文件缺失时断言真实失败并写入原生回执。",
      "scope": [
        "tests/contracts/spec-closure-ledger-maintenance.test.ts",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": ["T1"],
      "owner": "ignite-executor"
    },
    {
      "id": "T3",
      "title": "生成期望值文件并迁移所有权",
      "phase": "implement",
      "acceptance": ["AC-SPEC-009"],
      "status": "todo",
      "result": "期望值文件就位、断言通过；旧账本计划标 superseded 并注明其证据因测试删除而失效。",
      "scope": [
        "docs/others/spec-closure/ledger-expectations.json",
        "docs/plans/20261106-spec-closure-ledger.md",
        "tests/contracts/spec-closure-ledger.test.ts"
      ],
      "depends_on": ["T2"],
      "owner": "ignite-executor"
    },
    {
      "id": "T4",
      "title": "完成检查与回写",
      "phase": "verify",
      "acceptance": ["AC-SPEC-009"],
      "status": "todo",
      "result": "检查通过，设计记录期望值所有权。",
      "scope": ["docs/designs/execution.md"],
      "depends_on": ["T3"],
      "owner": "ignite-executor"
    }
  ],
  "bindings": [
    {
      "id": "BIND-001",
      "source": "REQ-SPEC-009",
      "applicable": "本轮产品要求",
      "status": "missing",
      "task": "T3",
      "check": "AC-SPEC-009"
    },
    {
      "id": "BIND-002",
      "source": "AC-SPEC-009",
      "applicable": "本轮验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-SPEC-009"
    },
    {
      "id": "BIND-003",
      "source": "STD-CLOSE-101",
      "applicable": "闭环要求判断成立",
      "status": "missing",
      "task": "T3",
      "check": "AC-SPEC-009"
    },
    {
      "id": "BIND-004",
      "source": "DES-EXEC-101",
      "applicable": "执行设计记录所有权",
      "status": "missing",
      "task": "T4",
      "check": "文档检查"
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
    "access_rationale": "只改文档与测试，不读写业务数据。",
    "migration_impact": "none",
    "rollback": "恢复旧测试并撤销期望值文件。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/spec-closure-ledger-ownership.md",
    "docs/plans/20261106-spec-closure-ledger-maintenance.md",
    "docs/plans/releases/spec-closure-ledger-maintenance-v1.json",
    "docs/plans/20261106-spec-closure-ledger.md",
    "docs/others/spec-closure/ledger-expectations.json",
    "docs/designs/execution.md",
    "docs/others/evidence/",
    "tests/contracts/spec-closure-ledger-maintenance.test.ts",
    "tests/contracts/spec-closure-ledger.test.ts"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-06"
}
-->

# Ignite 实施计划：spec-closure-ledger-maintenance

> 账本期望值迁到独立文件，由本计划拥有，使账本可持续刷新。

## 状态

顶部元数据 status 唯一；tasks 是唯一子任务状态。

## 目标

刷新账本不再需要改已交付计划的测试。

## 原始目标与覆盖核对

| 用户原话或可追溯来源     | 本轮目标   | REQ          | AC          | 处理结果 |
| ------------------------ | ---------- | ------------ | ----------- | -------- |
| 选方案 A：新计划接管测试 | 期望值外置 | REQ-SPEC-009 | AC-SPEC-009 | 保留     |

## 整体判断与推进顺序

- 整体链路：账本被测试比对，期望值写死在旧计划测试里。
- 当前主要问题：刷新账本必须改旧测试，证据随之失效。
- 推进与尺度：先外置期望值，再迁移所有权，不动 result 值。
- 纠偏与停止：期望值文件与账本一致且旧计划 superseded 即停止。

## 来源规格

- 需求：docs/features/spec-closure-ledger-ownership.md（REQ-SPEC-009 / AC-SPEC-009）。
- 标准：docs/standards/specification-to-implementation-ddd.md。
- 决策：用户 2026-11-06 选择方案 A；docs/others/adr/0004-spec-closure-contract.md。

## 目标映射

- REQ-SPEC-009 → BIND-001 → T3。
- AC-SPEC-009 → BIND-002 → T2/T3。

## 约束绑定矩阵

| Source ID    | Binding  | 任务 | 验证        |
| ------------ | -------- | ---- | ----------- |
| REQ-SPEC-009 | BIND-001 | T3   | AC-SPEC-009 |
| AC-SPEC-009  | BIND-002 | T2   | AC-SPEC-009 |

矩阵逐行回指真源与验证方式。
期望值文件是唯一数据源，测试只做比对。

## 主要矛盾

目标要求账本可刷新。
当前期望值写死在旧计划的测试里。
刷新账本必然改动旧测试，使旧证据失效，两者不能同时成立。
支撑事实：账本测试第 21–43 行硬编码四组集合与计划映射。
推翻条件：期望值搬出测试后，本矛盾消失。

## 次要矛盾

- 旧证据必然失效：按 superseded 处置，如实记录。

## 决策原则

- 期望值外置，测试只比对；
- 旧计划 superseded，不假装证据仍有效。

## 方案比较

- 采用：外置期望值文件 + 新测试 AC-SPEC-009。
- 否决：把测试改宽松（失去防虚报能力）。

## 回退

恢复旧测试并撤销期望值文件即可。
回退后账本校验按旧规则运行，不留半开状态。

## 变更类型

存量改动：测试与文档，无数据库与接口变更。

## 非目标

不刷新 result 值，不改账本条目文本。

## 输入规格

- docs/features/spec-closure-ledger-ownership.md
- docs/others/spec-closure/ledger.json

## 已关闭问题

无未决问题；用户已选方案 A。

## 测试与验收设计

单条断言：账本集合与计划映射必须与期望值文件一致；文件缺失即失败。

## 实现任务

见顶部 tasks。

## 验收方式

tests/contracts/spec-closure-ledger-maintenance.test.ts、node scripts/check-docs.mjs、ignite check --plan IGT-202611060006 --level auto。

## 设计回写

在 docs/designs/execution.md 记录期望值所有权。

## 状态记录

- 2026-11-06：建立计划；期望值文件不存在，断言失败。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 登记规格、计划与断言并提交基线 · done
- [ ] T2 · 运行账本断言并记录原生红灯 · todo
- [ ] T3 · 生成期望值文件并迁移所有权 · todo
- [ ] T4 · 完成检查与回写 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

断言通过、文档检查退出码 0、旧计划 superseded、设计已回写。
