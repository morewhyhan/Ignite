<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060003",
  "release": "spec-closure-p2-v1",
  "status": "verifying",
  "outcome": "新计划必须为每条需求与验收声明唯一绑定，缺一条就进不了 ready",
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
      "source": "DSH subagent ed3c40cb independent draft review of IGT-202611060003, two rounds, approved at 351d764",
      "subject_fingerprint": "e2af8c34e78d9e44c208b43a135c01df7cf3c0e698bc4fc4227437b17d75713e",
      "verdict": "approved",
      "findings": [
        {
          "id": "P2-001",
          "severity": "blocking",
          "summary": "Resolved: behavioural validatePlan assertion on real P2 metadata; intact returns [], broken returns [] today and must return AC-SPEC-006: no binding after T3.",
          "resolved": true
        },
        {
          "id": "P2-002",
          "severity": "blocking",
          "summary": "Resolved: template must declare contract, non-empty bindings and pass validateBindings.",
          "resolved": true
        },
        {
          "id": "P2-003",
          "severity": "blocking",
          "summary": "Resolved: missing-AC case present; REQ/AC/duplicate/unknown-task all verified.",
          "resolved": true
        },
        {
          "id": "P2-004",
          "severity": "blocking",
          "summary": "Resolved: feature non-goal and module map reconciled.",
          "resolved": true
        },
        {
          "id": "P2-005",
          "severity": "nonblocking",
          "summary": "base_commit is the P2 prep commit; prep diff outside delivery scope.",
          "resolved": false
        },
        {
          "id": "P2-006",
          "severity": "nonblocking",
          "summary": "Test design names two assertions; name the validatePlan behaviour assertion too.",
          "resolved": false
        },
        {
          "id": "P2-007",
          "severity": "nonblocking",
          "summary": "Resolved: feature map and update list include P2 files.",
          "resolved": true
        },
        {
          "id": "P2-008",
          "severity": "nonblocking",
          "summary": "T3 result still present tense; prefer expected phrasing.",
          "resolved": false
        },
        {
          "id": "P2-009",
          "severity": "nonblocking",
          "summary": "Resolved: non-object binding entries return a failure; branch untested (optional).",
          "resolved": false
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T18:27:59.717Z"
    },
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-ed3c40cb",
      "executor": "ignite-executor",
      "source": "DSH subagent ed3c40cb independent draft review of IGT-202611060003, two rounds, approved at 351d764",
      "subject_fingerprint": "74747fedf11f36ee8f7a378ad70cd2a8f24a43c0bf38bffdf3195913a38a7a64",
      "verdict": "approved",
      "findings": [
        {
          "id": "P2-001",
          "severity": "blocking",
          "summary": "Resolved: behavioural validatePlan assertion on real P2 metadata; intact returns [], broken returns [] today and must return AC-SPEC-006: no binding after T3.",
          "resolved": true
        },
        {
          "id": "P2-002",
          "severity": "blocking",
          "summary": "Resolved: template must declare contract, non-empty bindings and pass validateBindings.",
          "resolved": true
        },
        {
          "id": "P2-003",
          "severity": "blocking",
          "summary": "Resolved: missing-AC case present; REQ/AC/duplicate/unknown-task all verified.",
          "resolved": true
        },
        {
          "id": "P2-004",
          "severity": "blocking",
          "summary": "Resolved: feature non-goal and module map reconciled.",
          "resolved": true
        },
        {
          "id": "P2-005",
          "severity": "nonblocking",
          "summary": "base_commit is the P2 prep commit; prep diff outside delivery scope.",
          "resolved": false
        },
        {
          "id": "P2-006",
          "severity": "nonblocking",
          "summary": "Test design names two assertions; name the validatePlan behaviour assertion too.",
          "resolved": false
        },
        {
          "id": "P2-007",
          "severity": "nonblocking",
          "summary": "Resolved: feature map and update list include P2 files.",
          "resolved": true
        },
        {
          "id": "P2-008",
          "severity": "nonblocking",
          "summary": "T3 result still present tense; prefer expected phrasing.",
          "resolved": false
        },
        {
          "id": "P2-009",
          "severity": "nonblocking",
          "summary": "Resolved: non-object binding entries return a failure; branch untested (optional).",
          "resolved": false
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T18:28:35.104Z"
    }
  ],
  "verification_contract": 2,
  "binding_contract": 1,
  "goals": [
    {
      "text": "声明绑定契约的计划必须为每条 REQ 与 AC 提供唯一绑定",
      "requirements": ["REQ-SPEC-006"]
    }
  ],
  "constraints": ["不追溯改造已完成计划", "绑定字段只对新契约计划强制", "模板本身必须示范完整绑定"],
  "non_goals": ["不改写 P0/P1 已完成计划", "不引入跨计划传播检查"],
  "authorization": {
    "source": "用户 2026-11-06 指令：按方案自行持续推进"
  },
  "deliverables": ["绑定契约校验模块与模板变更", "P2 计划自身的绑定矩阵", "AC-SPEC-006 的三条断言"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "86c8e52298ca80d1b84eede09466754b147f117e",
  "requirements": ["REQ-SPEC-006"],
  "acceptance": [
    {
      "id": "AC-SPEC-006",
      "tests": ["tests/contracts/spec-closure-bindings.test.ts::[AC-SPEC-006]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/spec-closure-bindings.test.ts::[AC-SPEC-006]",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "登记需求、计划与断言并提交基线",
      "phase": "prepare",
      "status": "done",
      "result": "Feature 增量、计划、发布范围与断言写入并提交基线，准备检查通过。",
      "scope": [
        "docs/features/spec-closure.md",
        "docs/plans/20261106-spec-closure-bindings.md",
        "docs/plans/releases/spec-closure-p2-v1.json",
        "tests/contracts/spec-closure-bindings.test.ts",
        "scripts/ignite/binding-contract.mjs"
      ],
      "depends_on": [],
      "owner": "ignite-executor"
    },
    {
      "id": "T2",
      "title": "运行绑定断言并记录原生红灯",
      "phase": "red",
      "acceptance": ["AC-SPEC-006"],
      "status": "done",
      "result": "模板尚未声明绑定时断言真实失败并写入原生回执。",
      "scope": ["tests/contracts/spec-closure-bindings.test.ts", "docs/others/evidence/tdd/"],
      "depends_on": ["T1"],
      "owner": "ignite-executor"
    },
    {
      "id": "T3",
      "title": "模板声明绑定契约并接入校验",
      "phase": "implement",
      "acceptance": ["AC-SPEC-006"],
      "status": "done",
      "result": "模板带 binding_contract 与 bindings，检查器在缺失、重复或未知任务时拒绝，计划校验实际调用该检查。",
      "scope": ["docs/plans/_template.md", "scripts/ignite/state.mjs", "scripts/check-docs.mjs"],
      "depends_on": ["T2"],
      "owner": "ignite-executor"
    },
    {
      "id": "T4",
      "title": "完成检查与回写",
      "phase": "verify",
      "acceptance": ["AC-SPEC-006"],
      "status": "done",
      "result": "计划校验调用绑定检查后，断言与文档检查通过，执行设计记录绑定契约现状。",
      "scope": ["docs/designs/execution.md"],
      "depends_on": ["T3"],
      "owner": "ignite-executor"
    }
  ],
  "bindings": [
    {
      "id": "BIND-001",
      "source": "REQ-SPEC-006",
      "applicable": "本轮产品要求",
      "status": "missing",
      "task": "T3",
      "check": "AC-SPEC-006"
    },
    {
      "id": "BIND-002",
      "source": "AC-SPEC-006",
      "applicable": "本轮验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-SPEC-006"
    },
    {
      "id": "BIND-003",
      "source": "STD-CLOSE-101",
      "applicable": "闭环标准要求逐条绑定",
      "status": "missing",
      "task": "T3",
      "check": "AC-SPEC-006"
    },
    {
      "id": "BIND-004",
      "source": "DES-EXEC-101",
      "applicable": "执行设计记录契约",
      "status": "missing",
      "task": "T4",
      "check": "文档检查"
    },
    {
      "id": "BIND-005",
      "source": "ADR-0004",
      "applicable": "闭环契约决策",
      "status": "met",
      "task": "T3",
      "check": "AC-SPEC-006"
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
    "rollback": "撤销提交即可恢复，绑定字段为可选。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/spec-closure.md",
    "docs/plans/20261106-spec-closure-bindings.md",
    "docs/plans/releases/spec-closure-p2-v1.json",
    "docs/plans/_template.md",
    "docs/designs/execution.md",
    "docs/others/evidence/",
    "tests/contracts/spec-closure-bindings.test.ts",
    "scripts/ignite/binding-contract.mjs",
    "scripts/ignite/state.mjs",
    "scripts/check-docs.mjs"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-SPEC-006",
      "test": "tests/contracts/spec-closure-bindings.test.ts::[AC-SPEC-006]",
      "run_id": "tdd-20261105183628-c337fe"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20261105192720-627d03"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "b711c2621da0be97ac51d9545074366920820901",
  "updated_at": "2026-11-05"
}
-->

# Ignite 实施计划：spec-closure-bindings

> 让新计划为每条需求与验收声明唯一绑定，缺一条就进不了 ready。

## 状态

顶部元数据的 status 是唯一状态；tasks 是唯一子任务状态。

## 目标

新计划声明 binding_contract 后，缺少 REQ/AC 绑定、绑定重号或指向不存在任务时，准备检查失败。

## 原始目标与覆盖核对

| 用户原话或可追溯来源   | 本轮目标                 | REQ          | AC          | 处理结果 |
| ---------------------- | ------------------------ | ------------ | ----------- | -------- |
| 每条规格都能被执行清楚 | 每条需求与验收有唯一绑定 | REQ-SPEC-006 | AC-SPEC-006 | 保留     |
| 不依赖大模型的能力     | 缺失与重复由校验器拒绝   | REQ-SPEC-006 | AC-SPEC-006 | 保留     |

## 整体判断与推进顺序

- 整体链路与事实：计划目前用正文描述覆盖，检查器只看结构。
- 当前主要问题：没有绑定，无法回答某条需求由哪个任务、哪个检查负责。
- 推进与尺度：先做计划内部的绑定，跨计划传播留到后续。
- 纠偏与停止：模板缺字段就补模板，校验逻辑错就修校验。

## 来源与绑定矩阵

| Source ID     | 来源                                                  | 适用理由         | 状态    | Binding  | 任务 | 验证        |
| ------------- | ----------------------------------------------------- | ---------------- | ------- | -------- | ---- | ----------- |
| REQ-SPEC-006  | docs/features/spec-closure.md                         | 本轮产品要求     | missing | BIND-001 | T3   | AC-SPEC-006 |
| AC-SPEC-006   | docs/features/spec-closure.md                         | 本轮验收         | missing | BIND-002 | T2   | AC-SPEC-006 |
| STD-CLOSE-101 | docs/standards/specification-to-implementation-ddd.md | 闭环要求逐条绑定 | missing | BIND-003 | T3   | AC-SPEC-006 |
| DES-EXEC-101  | docs/designs/execution.md                             | 执行设计记录契约 | missing | BIND-004 | T4   | 文档检查    |
| ADR-0004      | docs/others/adr/0004-spec-closure-contract.md         | 闭环契约决策     | met     | BIND-005 | T3   | AC-SPEC-006 |

## 主要矛盾

目标要求每条需求都有负责人。
当前计划只声明 requirements 数组，没有把条目接到任务与检查。
因此覆盖与只有清单不能同时成立。
支撑事实：P0/P1 的 requirements 与 acceptance 之间只有人工叙述。
推翻条件：若检查器已能拒绝缺绑定的计划，本矛盾降级为实现细节。

## 次要矛盾

- 跨计划传播尚未做：本轮只覆盖单个计划内部。
- 历史计划没有绑定字段：通过 binding_contract 区分，不追溯改造。

## 决策原则与方案比较

- 原则：只对新契约计划强制；模板自己先示范。
- 采用方案：计划元数据增加 bindings 数组，校验器放在 scripts/ignite。
- 替代方案：写在正文表格里（否决，机器读不到）。
- 代价：新计划多写一段绑定。

## 回退

绑定字段可选，撤销提交即恢复；已有计划不受影响。

## 变更类型

存量改动：改模板与检查器，无数据库与接口变更。

## 非目标

跨计划传播、绑定到 Release 条目、自动生成绑定。

## 输入规格

- 需求：docs/features/spec-closure.md（REQ-SPEC-006、AC-SPEC-006）
- 标准：docs/standards/specification-to-implementation-ddd.md §6、§10.1、§10.4、§10.5
- 决策：docs/others/adr/0004-spec-closure-contract.md

## 已关闭问题

无未决问题；绑定只对新契约计划强制。

## 测试与验收设计

三条断言：模板必须声明 binding_contract 与 bindings；校验器必须拒绝缺绑定、重号与未知任务，并接受完整夹具。

## 实现任务

见顶部 tasks：T1 准备，T2 红灯，T3 模板与校验接入，T4 验证回写。

## 验收方式

运行 tests/contracts/spec-closure-bindings.test.ts；node scripts/check-docs.mjs；pnpm ignite check --plan IGT-202611060003 --level auto。

## 设计回写

在 docs/designs/execution.md 记录绑定契约现状。

## 状态记录

- 2026-11-06：建立计划；模板尚未声明绑定契约，断言失败。
- 2026-11-06：首次红灯在格式化测试后失效，按 restart 重做：回退实现 6becef1 → 红灯 tdd-20261105183628-c337fe → 重放实现 f152fb0。
- 2026-11-06：实现包含模板契约、validatePlan 接线、非对象条目防御，以及 check-docs 仅扫描计划正文。
- 2026-11-06：宿主切换到 WSL（Node 24.19 + linux/x64 依赖），同一提交上 check --level auto 以 exit 0 通过，run-20261105192720-627d03；此前 Windows 上的 ignite-cli 失败属于宿主不兼容，已不再阻塞。该 run 的目标测试集合覆盖 P2 验收与改动文件相关用例，不是完整契约套件。

<!-- ignite-progress -->

状态：`verifying`（由元数据生成）

- [x] T1 · 登记需求、计划与断言并提交基线 · done
- [x] T2 · 运行绑定断言并记录原生红灯 · done
- [x] T3 · 模板声明绑定契约并接入校验 · done
- [x] T4 · 完成检查与回写 · done

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20261105192720-627d03
<!-- /ignite-progress -->

## 准出条件

三条断言通过、文档检查退出码 0、check-integration 有效、设计已回写。

## TDD 恢复记录

2026-11-05，AC-SPEC-006：formatting changed the acceptance test after red。保留原回执 tdd-20261105183029-5d46d0；对应任务重新进入真实红灯，旧验收绑定已撤销。本次恢复没有生成通过或失败凭证。
