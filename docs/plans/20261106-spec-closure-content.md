<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060005",
  "release": "spec-closure-content-v1",
  "status": "draft",
  "outcome": "声明内容契约的计划，分析章节必须有实质内容，空壳与模板语被拒",
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
      "text": "内容契约计划的分析章节必须有实质内容",
      "requirements": [
        "REQ-SPEC-008"
      ]
    }
  ],
  "constraints": [
    "只对新契约计划强制",
    "不追溯 P0–P3 已完成计划",
    "不做语义质量评分"
  ],
  "non_goals": [
    "不改历史计划正文",
    "不引入模型评分"
  ],
  "authorization": {
    "source": "用户 2026-11-06 收尾 goal 指令"
  },
  "deliverables": [
    "模板八个章节与内容契约",
    "content-contract 校验与接线",
    "AC-SPEC-008 断言"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "6b4cdb9",
  "requirements": [
    "REQ-SPEC-008"
  ],
  "acceptance": [
    {
      "id": "AC-SPEC-008",
      "tests": [
        "tests/contracts/spec-closure-content.test.ts::[AC-SPEC-008]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/spec-closure-content.test.ts::[AC-SPEC-008]",
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
      "result": "Feature、计划、发布与断言写入并提交基线，准备检查通过。",
      "scope": [
        "docs/features/spec-closure-content.md",
        "docs/plans/20261106-spec-closure-content.md",
        "docs/plans/releases/spec-closure-content-v1.json",
        "tests/contracts/spec-closure-content.test.ts",
        "scripts/ignite/content-contract.mjs"
      ],
      "depends_on": [],
      "owner": "ignite-executor"
    },
    {
      "id": "T2",
      "title": "运行内容断言并记录原生红灯",
      "phase": "red",
      "acceptance": [
        "AC-SPEC-008"
      ],
      "status": "todo",
      "result": "模板缺章节时断言真实失败并写入原生回执。",
      "scope": [
        "tests/contracts/spec-closure-content.test.ts",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": [
        "T1"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T3",
      "title": "模板补齐章节并接入内容校验",
      "phase": "implement",
      "acceptance": [
        "AC-SPEC-008"
      ],
      "status": "todo",
      "result": "模板含八节与 content_contract，validatePlan 调用 contentGaps。",
      "scope": [
        "docs/plans/_template.md",
        "scripts/ignite/state.mjs"
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
        "AC-SPEC-008"
      ],
      "status": "todo",
      "result": "断言与检查通过，执行设计记录内容门禁。",
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
      "source": "REQ-SPEC-008",
      "applicable": "本轮产品要求",
      "status": "missing",
      "task": "T3",
      "check": "AC-SPEC-008"
    },
    {
      "id": "BIND-002",
      "source": "AC-SPEC-008",
      "applicable": "本轮验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-SPEC-008"
    },
    {
      "id": "BIND-003",
      "source": "STD-CLOSE-101",
      "applicable": "闭环要求判断成立",
      "status": "missing",
      "task": "T3",
      "check": "AC-SPEC-008"
    },
    {
      "id": "BIND-004",
      "source": "DES-EXEC-101",
      "applicable": "执行设计记录门禁",
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
    "access_rationale": "只改模板与检查器，不读写业务数据。",
    "migration_impact": "none",
    "rollback": "撤销提交即可恢复，门禁只对新契约生效。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/spec-closure-content.md",
    "docs/plans/20261106-spec-closure-content.md",
    "docs/plans/releases/spec-closure-content-v1.json",
    "docs/plans/_template.md",
    "docs/designs/execution.md",
    "docs/others/evidence/",
    "tests/contracts/spec-closure-content.test.ts",
    "scripts/ignite/content-contract.mjs",
    "scripts/ignite/state.mjs"
  ],
  "tdd_evidence": [],
  "required_evidence": [
    "check-integration"
  ],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-06"
}
-->
# Ignite 实施计划：spec-closure-content

> 声明内容契约的计划，分析章节必须有实质内容，空壳与模板语被拒。

## 状态

顶部元数据的 status 是唯一状态；tasks 是唯一子任务状态。

## 目标

计划的分析章节要么有真实判断，要么进不了 ready。

## 原始目标与覆盖核对

| 用户原话或可追溯来源 | 本轮目标 | REQ | AC | 处理结果 |
| --- | --- | --- | --- | --- |
| 章节内容不许是空壳或残留模板提示语 | 八节最小实质内容 | REQ-SPEC-008 | AC-SPEC-008 | 保留 |

## 来源规格

- 需求：docs/features/spec-closure-content.md（REQ-SPEC-008 / AC-SPEC-008）。
- 标准：docs/standards/specification-to-implementation-ddd.md §10.1、§10.4。
- 决策：docs/others/adr/0004-spec-closure-contract.md。

## 目标映射

- REQ-SPEC-008 → BIND-001 → T3。
- AC-SPEC-008 → BIND-002 → T2/T3。

## 约束绑定矩阵

| Source ID | Binding | 任务 | 验证 |
| --- | --- | --- | --- |
| REQ-SPEC-008 | BIND-001 | T3 | AC-SPEC-008 |
| AC-SPEC-008 | BIND-002 | T2 | AC-SPEC-008 |

## 主要矛盾

目标要求判断成立。
当前检查只比对标题存在。
因此实质内容与现有门禁不能同时成立，空壳计划总能通过。
支撑事实：P0 计划至今保留模板提示语仍能通过。
推翻条件：若检查已能拒绝空壳，本矛盾降级。

## 次要矛盾

- 语义质量无法机器判定：本轮只做最小行数与模板语，不做评分。

## 决策原则

- 原则：能机械判断的先做，语义判断留给独立审查。
- 取舍：只对新契约生效，避免追溯改造历史计划。

## 方案比较

- 采用：八节最小行数 + 模板语黑名单 + 只对 content_contract 生效。
- 替代：人工评审（否决，无法拦截）；模型评分（否决，不可复现）。

## 回退

撤销提交即可恢复；content_contract 为可选字段，历史计划不受影响。

## 变更类型

存量改动：模板与检查器，无数据库与接口变更。

## 非目标

不改历史计划正文，不引入模型评分。

## 输入规格

- docs/features/spec-closure-content.md
- docs/standards/specification-to-implementation-ddd.md

## 已关闭问题

无未决问题；只对新契约生效。

## 测试与验收设计

两条断言：模板必须通过内容校验；空章节与模板提示语必须被拒。

## 实现任务

见顶部 tasks。

## 验收方式

运行 tests/contracts/spec-closure-content.test.ts；node scripts/check-docs.mjs；pnpm ignite check --plan IGT-202611060005 --level auto。

## 设计回写

在 docs/designs/execution.md 记录内容门禁。

## 状态记录

- 2026-11-06：建立计划；模板缺八节，断言失败。

<!-- ignite-progress -->

状态：draft（由元数据生成）

- [ ] T1 · 登记规格、计划与断言并提交基线 · todo
- [ ] T2 · 运行内容断言并记录原生红灯 · todo
- [ ] T3 · 模板补齐章节并接入内容校验 · todo
- [ ] T4 · 完成检查与回写 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

断言通过、文档检查退出码 0、check-integration 有效、设计已回写。
