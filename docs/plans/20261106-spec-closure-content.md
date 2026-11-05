<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060005",
  "release": "spec-closure-content-v1",
  "status": "active",
  "outcome": "声明内容契约的计划，分析章节必须有实质内容，空壳与模板语被拒",
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
      "source": "DSH subagent ed3c40cb independent draft review of IGT-202611060005, three rounds, approved at 23833f6",
      "subject_fingerprint": "df3d2d89dde09b76dceb023fd4a4ab581109c4e076ec538c8e5d58157f89d6de",
      "verdict": "approved",
      "findings": [
        {
          "id": "CT-006",
          "severity": "nonblocking",
          "summary": "base_commit is the plan creation commit; prep diff outside delivery scope.",
          "resolved": false
        },
        {
          "id": "CT-009",
          "severity": "blocking",
          "summary": "Resolved: separator/header excluded; data rows only; header-only fixture covered.",
          "resolved": true
        },
        {
          "id": "CT-001",
          "severity": "blocking",
          "summary": "Resolved: validatePlan imported.",
          "resolved": true
        },
        {
          "id": "CT-002",
          "severity": "blocking",
          "summary": "Resolved: plan sections satisfy contentGaps.",
          "resolved": true
        },
        {
          "id": "CT-003",
          "severity": "blocking",
          "summary": "Resolved: table data rows count; plan contentGaps empty.",
          "resolved": true
        },
        {
          "id": "CT-004",
          "severity": "blocking",
          "summary": "Resolved: full contentGaps asserted before gutted case.",
          "resolved": true
        },
        {
          "id": "CT-005",
          "severity": "blocking",
          "summary": "Resolved: boilerplate anchored.",
          "resolved": true
        },
        {
          "id": "CT-007",
          "severity": "nonblocking",
          "summary": "Resolved: import fixed.",
          "resolved": true
        },
        {
          "id": "CT-008",
          "severity": "nonblocking",
          "summary": "Resolved: plan matrix and rollback satisfy contract.",
          "resolved": true
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T21:26:46.197Z"
    },
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-ed3c40cb",
      "executor": "ignite-executor",
      "source": "DSH subagent ed3c40cb independent draft review of IGT-202611060005, three rounds, approved at 23833f6",
      "subject_fingerprint": "a0d1a0681b47aa5f3d19de5805e803fcb4a7b688a5ecb554d5d32224fcca7982",
      "verdict": "approved",
      "findings": [
        {
          "id": "CT-006",
          "severity": "nonblocking",
          "summary": "base_commit is the plan creation commit; prep diff outside delivery scope.",
          "resolved": false
        },
        {
          "id": "CT-009",
          "severity": "blocking",
          "summary": "Resolved: separator/header excluded; data rows only; header-only fixture covered.",
          "resolved": true
        },
        {
          "id": "CT-001",
          "severity": "blocking",
          "summary": "Resolved: validatePlan imported.",
          "resolved": true
        },
        {
          "id": "CT-002",
          "severity": "blocking",
          "summary": "Resolved: plan sections satisfy contentGaps.",
          "resolved": true
        },
        {
          "id": "CT-003",
          "severity": "blocking",
          "summary": "Resolved: table data rows count; plan contentGaps empty.",
          "resolved": true
        },
        {
          "id": "CT-004",
          "severity": "blocking",
          "summary": "Resolved: full contentGaps asserted before gutted case.",
          "resolved": true
        },
        {
          "id": "CT-005",
          "severity": "blocking",
          "summary": "Resolved: boilerplate anchored.",
          "resolved": true
        },
        {
          "id": "CT-007",
          "severity": "nonblocking",
          "summary": "Resolved: import fixed.",
          "resolved": true
        },
        {
          "id": "CT-008",
          "severity": "nonblocking",
          "summary": "Resolved: plan matrix and rollback satisfy contract.",
          "resolved": true
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T21:27:27.409Z"
    }
  ],
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
  "base_commit": "23833f6bca8825f21e72c7b8d4177b7fc75e1f4a",
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
      "status": "done",
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
      "status": "doing",
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
        "scripts/ignite/state.mjs",
        "scripts/ignite/document-contract.mjs",
        "scripts/check-docs.mjs"
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
    "scripts/ignite/state.mjs",
    "scripts/ignite/document-contract.mjs",
    "scripts/check-docs.mjs"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-SPEC-008",
      "test": "tests/contracts/spec-closure-content.test.ts::[AC-SPEC-008]",
      "run_id": "tdd-20261105213148-3cb15b"
    }
  ],
  "required_evidence": [
    "check-integration"
  ],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-05"
}
-->

# Ignite 实施计划：spec-closure-content

> 声明内容契约的计划，分析章节必须有实质内容，空壳与模板语被拒。

## 状态

顶部元数据的 status 是唯一状态；tasks 是唯一子任务状态。

## 目标

计划的分析章节要么有真实判断，要么进不了 ready。

## 原始目标与覆盖核对

| 用户原话或可追溯来源               | 本轮目标         | REQ          | AC          | 处理结果 |
| ---------------------------------- | ---------------- | ------------ | ----------- | -------- |
| 章节内容不许是空壳或残留模板提示语 | 八节最小实质内容 | REQ-SPEC-008 | AC-SPEC-008 | 保留     |

## 整体判断与推进顺序

- 整体链路与事实：计划模板有章节，检查只比对标题是否存在。
- 当前主要问题：空壳章节与模板提示语可以通过，判断无法被验证。
- 推进与尺度：先做机械可判定的最小内容门禁，语义质量仍交独立审查。
- 纠偏与停止：模板合规且空壳被拒即停止，不扩张到评分。

## 来源规格

- 需求：docs/features/spec-closure-content.md（REQ-SPEC-008 / AC-SPEC-008）。
- 标准：docs/standards/specification-to-implementation-ddd.md §10.1、§10.4。
- 决策：docs/others/adr/0004-spec-closure-contract.md。

## 目标映射

- REQ-SPEC-008 → BIND-001 → T3。
- AC-SPEC-008 → BIND-002 → T2/T3。

## 约束绑定矩阵

| Source ID    | Binding  | 任务 | 验证        |
| ------------ | -------- | ---- | ----------- |
| REQ-SPEC-008 | BIND-001 | T3   | AC-SPEC-008 |
| AC-SPEC-008  | BIND-002 | T2   | AC-SPEC-008 |

矩阵由来源条目逐条收束：每条 REQ/AC 对应唯一绑定与主要任务，标准与设计作为附加约束。
表内每一行都必须能回指到真源文件与验证方式。

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
回退后 check-docs 与 validatePlan 仍按旧规则运行，不会留下半开状态。

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
- 2026-11-06：governance 失败根因：新增模板标题被所有计划强制要求；改为仅 content_contract=1 的计划要求八节，需同步 document-contract 与 check-docs，故扩展 T3 写入范围。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 登记规格、计划与断言并提交基线 · done
- [ ] T2 · 运行内容断言并记录原生红灯 · doing
- [ ] T3 · 模板补齐章节并接入内容校验 · todo
- [ ] T4 · 完成检查与回写 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

断言通过、文档检查退出码 0、check-integration 有效、设计已回写。
