<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060007",
  "release": "spec-closure-truth-v1",
  "status": "draft",
  "outcome": "账本 result 与本轮实际交付一致，期望值与账本同步",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "binding_contract": 1,
  "content_contract": 1,
  "goals": [
    {
      "text": "账本反映真实交付",
      "requirements": [
        "REQ-SPEC-009"
      ]
    }
  ],
  "constraints": [
    "不改条目文本",
    "不新增条目"
  ],
  "non_goals": [
    "不重算历史 result",
    "不改测试断言"
  ],
  "authorization": {
    "source": "用户 2026-11-06 收尾指令"
  },
  "deliverables": [
    "账本 result 刷新",
    "期望值同步",
    "设计回写"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "bbec1a834fdb45be7dddfce89a82e4c6a720e3cb",
  "requirements": [
    "REQ-SPEC-009"
  ],
  "acceptance": [
    {
      "id": "AC-SPEC-009",
      "tests": [
        "tests/contracts/spec-closure-ledger-maintenance.test.ts::[AC-SPEC-009]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/spec-closure-ledger-maintenance.test.ts::[AC-SPEC-009]",
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
      "title": "登记规格与计划并提交基线",
      "phase": "prepare",
      "status": "todo",
      "result": "规格、计划、发布与基线提交完成，准备检查通过。",
      "scope": [
        "docs/features/spec-closure-truth.md",
        "docs/plans/20261106-spec-closure-truth.md",
        "docs/plans/releases/spec-closure-truth-v1.json"
      ],
      "depends_on": [],
      "owner": "ignite-executor"
    },
    {
      "id": "T2",
      "title": "运行账本断言并记录红灯",
      "phase": "red",
      "acceptance": [
        "AC-SPEC-009"
      ],
      "status": "todo",
      "result": "账本与期望不一致时断言真实失败。",
      "scope": [
        "docs/others/spec-closure/ledger.json",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": [
        "T1"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T3",
      "title": "刷新账本与期望值",
      "phase": "implement",
      "acceptance": [
        "AC-SPEC-009"
      ],
      "status": "todo",
      "result": "账本 result 与期望集合同步，断言通过。",
      "scope": [
        "docs/others/spec-closure/ledger.json",
        "docs/others/spec-closure/ledger-expectations.json"
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
        "AC-SPEC-009"
      ],
      "status": "todo",
      "result": "检查通过，设计记录刷新规则。",
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
      "source": "REQ-SPEC-009",
      "applicable": "本轮产品要求",
      "status": "met",
      "task": "T3",
      "check": "AC-SPEC-010"
    },
    {
      "id": "BIND-002",
      "source": "AC-SPEC-009",
      "applicable": "本轮验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-SPEC-010"
    },
    {
      "id": "BIND-003",
      "source": "STD-CLOSE-101",
      "applicable": "闭环要求判断成立",
      "status": "missing",
      "task": "T3",
      "check": "AC-SPEC-010"
    },
    {
      "id": "BIND-004",
      "source": "DES-EXEC-101",
      "applicable": "执行设计记录规则",
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
  "risk": "docs",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "只改文档数据，不读写业务数据。",
    "migration_impact": "none",
    "rollback": "恢复上一版账本与期望值。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/plans/20261106-spec-closure-truth.md",
    "docs/plans/releases/spec-closure-truth-v1.json",
    "docs/others/spec-closure/ledger.json",
    "docs/others/spec-closure/ledger-expectations.json",
    "docs/designs/execution.md",
    "docs/others/evidence/"
  ],
  "tdd_evidence": [],
  "required_evidence": [
    "check-dev",
    "check-integration"
  ],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-06"
}
-->
# Ignite 实施计划：spec-closure-truth

> 账本 result 必须与本轮实际交付一致。

## 状态

顶部元数据 status 唯一；tasks 是唯一子任务状态。

## 目标

把账本从上一轮快照刷新到真实状态。

## 原始目标与覆盖核对

| 用户原话 | 本轮目标 | REQ | AC | 处理结果 |
| --- | --- | --- | --- | --- |
| 账本每条 result 与代码一致 | 刷新账本 | REQ-SPEC-009 | AC-SPEC-009 | 保留 |

## 整体判断与推进顺序

- 整体链路：账本被测试比对，期望值单独存放。
- 当前问题：交付已完成但 result 未刷新。
- 推进与尺度：只改 result 与期望集合。
- 停止条件：账本与期望一致且校验通过。

## 来源规格

- 需求：docs/features/spec-closure-ledger-ownership.md（REQ-SPEC-009 / AC-SPEC-009）。
- 标准：docs/standards/specification-to-implementation-ddd.md。
- 决策：账本维护计划 IGT-202611060006 已交付期望值机制。

## 目标映射

- REQ-SPEC-009 → BIND-001 → T3。
- AC-SPEC-009 → BIND-002 → T2/T3。

## 约束绑定矩阵

| Source ID | Binding | 任务 | 验证 |
| --- | --- | --- | --- |
| REQ-SPEC-009 | BIND-001 | T3 | AC-SPEC-009 |
| AC-SPEC-009 | BIND-002 | T2 | AC-SPEC-009 |

矩阵逐行回指真源与验证方式。
每行都必须能在账本或测试中找到对应位置。

## 主要矛盾

目标要求账本可信。
当前账本停留在旧快照。
不刷新则后续判断全部失真，两者不能同时成立。
支撑事实：P3 已交付但 GAP 仍标 missing。
推翻条件：刷新后与代码一致。

## 次要矛盾

- 刷新需要同时改账本与期望值，任何单边改动都会让测试红。

## 决策原则

- 以实际交付为准，不以计划愿望为准。
- 集合与映射同步修改，不单边改。

## 方案比较

- 采用：同时改 ledger.json 与 ledger-expectations.json。
- 否决：只改期望值（账本与代码不一致，等于自欺）。

## 回退

恢复上一版账本与期望值即可。
回退后校验按旧数据运行，不留半开状态。

## 变更类型

存量改动：只改文档数据。

## 非目标

不改条目文本，不新增条目。

## 输入规格

- docs/features/spec-closure-truth.md
- docs/others/spec-closure/ledger.json

## 已关闭问题

无未决问题。

## 测试与验收设计

沿用账本维护测试：账本与期望集合一致即通过。

## 实现任务

见顶部 tasks。

## 验收方式

tests/contracts/spec-closure-ledger-maintenance.test.ts、node scripts/ignite.mjs validate、ignite check --plan IGT-202611060007 --level integration。

## 设计回写

在 docs/designs/execution.md 记录账本刷新规则。

## 状态记录

- 2026-11-06：建立计划；账本仍为旧快照。

<!-- ignite-progress -->

<!-- /ignite-progress -->

## 准出条件

账本与期望一致、校验通过、设计回写。
