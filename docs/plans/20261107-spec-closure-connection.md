<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1793982738195660699",
  "release": "spec-closure-connection-v1",
  "status": "verifying",
  "outcome": "设计文档能区分当前事实与目标设计，并留下计划到设计文档的回写台账",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [
    {
      "reviewer": "ignite-reviewer",
      "executor": "ignite-executor",
      "source": "self-review checklist against feature and acceptance",
      "stage": "draft",
      "identity_assurance": "declared",
      "verdict": "approved",
      "subject_fingerprint": "a423480e2eb25f4bc9689b4f559a3c88e5788f9da9c74008765c9735af65b92d",
      "findings": [
        {
          "id": "CR-001",
          "severity": "nonblocking",
          "summary": "状态标记规则只覆盖 designs 目录，README 例外已显式排除。",
          "resolved": true
        },
        {
          "id": "CR-002",
          "severity": "nonblocking",
          "summary": "回写台账未与 plan 自动同步，属于本轮非目标。",
          "resolved": true
        },
        {
          "id": "CR-003",
          "severity": "nonblocking",
          "summary": "模块级 AC（GAP-47）未纳入本计划，留给后续计划。",
          "resolved": true
        }
      ],
      "recorded_at": "2026-11-06T16:37:35.248Z"
    },
    {
      "reviewer": "ignite-reviewer",
      "executor": "ignite-executor",
      "source": "self-review checklist against feature and acceptance",
      "stage": "draft",
      "identity_assurance": "declared",
      "verdict": "approved",
      "subject_fingerprint": "362b31cf35cd585e282e60d4f66c0708f5cac62a3fb22398b35fe3ecfb1bb690",
      "findings": [
        {
          "id": "CR-001",
          "severity": "nonblocking",
          "summary": "标记规则仅覆盖 designs，README 例外已排除。",
          "resolved": true
        }
      ],
      "recorded_at": "2026-11-06T16:37:55.394Z"
    },
    {
      "reviewer": "ignite-reviewer",
      "executor": "ignite-executor",
      "source": "self-review checklist against feature and acceptance",
      "stage": "draft",
      "identity_assurance": "declared",
      "verdict": "approved",
      "subject_fingerprint": "2404560bed7e1c33a2d6f8e45be246afe9bfdd4e74d3e0e5fcee3a265f78ff24",
      "findings": [
        {
          "id": "CR-001",
          "severity": "nonblocking",
          "summary": "标记规则覆盖 designs 目录，README 已排除。",
          "resolved": true
        }
      ],
      "recorded_at": "2026-11-06T16:47:44.566Z"
    },
    {
      "reviewer": "ignite-reviewer",
      "executor": "ignite-executor",
      "source": "self-review checklist",
      "stage": "draft",
      "identity_assurance": "declared",
      "verdict": "approved",
      "subject_fingerprint": "2404560bed7e1c33a2d6f8e45be246afe9bfdd4e74d3e0e5fcee3a265f78ff24",
      "findings": [],
      "recorded_at": "2026-11-06T16:56:10.421Z"
    },
    {
      "reviewer": "ignite-reviewer",
      "executor": "ignite-executor",
      "source": "delivery review checklist",
      "stage": "delivery",
      "identity_assurance": "declared",
      "verdict": "approved",
      "subject_fingerprint": "ce0326ca420bc43fd862f221e136c6a4ebb1cd2f43f50c3c8b47755c5e53374c",
      "findings": [
        {
          "id": "DR-001",
          "severity": "nonblocking",
          "summary": "台账只登记本轮新增的计划归属，历史归属未回填。",
          "resolved": false
        }
      ],
      "recorded_at": "2026-11-06T17:30:24.572Z"
    }
  ],
  "verification_contract": 2,
  "goals": [
    {
      "text": "设计文档区分当前事实与目标设计，并留下计划到设计文档的回写台账",
      "requirements": [
        "REQ-SPEC-012",
        "REQ-SPEC-013"
      ]
    }
  ],
  "constraints": [
    "只改文档与测试，不改业务代码",
    "标记必须可机器检查"
  ],
  "non_goals": [
    "重写设计正文",
    "把检查并入 check-docs 门禁"
  ],
  "authorization": {
    "source": "用户 2026-11-06 收尾指令：设计文档区分当前事实与目标设计并加回写总表"
  },
  "deliverables": [
    "设计文档状态标记",
    "回写台账 docs/others/design-writeback.md",
    "AC-SPEC-012 / AC-SPEC-013 断言"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "7f580c44592870674ed7bfc0b3212dd6ba0c486f",
  "requirements": [
    "REQ-SPEC-012",
    "REQ-SPEC-013"
  ],
  "acceptance": [
    {
      "id": "AC-SPEC-012",
      "tests": [
        "tests/contracts/spec-closure-connection.test.ts::[AC-SPEC-012]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/spec-closure-connection.test.ts::[AC-SPEC-012]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-SPEC-013",
      "tests": [
        "tests/contracts/spec-closure-connection.test.ts::[AC-SPEC-013]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/spec-closure-connection.test.ts::[AC-SPEC-013]",
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
      "result": "Feature、计划、发布与断言已写入并提交基线。",
      "scope": [
        "docs/features/spec-closure-connection.md",
        "docs/plans/20261107-spec-closure-connection.md",
        "docs/plans/releases/spec-closure-connection-v1.json",
        "tests/contracts/spec-closure-connection.test.ts"
      ],
      "depends_on": [],
      "owner": "ignite-executor"
    },
    {
      "id": "T2",
      "title": "运行真实断言并记录目标行为红灯",
      "phase": "red",
      "acceptance": [
        "AC-SPEC-012",
        "AC-SPEC-013"
      ],
      "status": "done",
      "result": "原生 red 运行确认已提交测试的目标断言失败，并记录真实红灯。",
      "scope": [
        "tests/contracts/spec-closure-connection.test.ts",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": [
        "T1"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T3",
      "title": "实现标记、台账与模板顺序",
      "phase": "implement",
      "acceptance": [
        "AC-SPEC-012",
        "AC-SPEC-013"
      ],
      "status": "done",
      "result": "设计文档带状态标记，回写台账覆盖全部设计文档，断言通过。",
      "scope": [
        "docs/designs/",
        "docs/others/design-writeback.md",
        "docs/features/_template.md"
      ],
      "depends_on": [
        "T2"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "phase": "verify",
      "acceptance": [
        "AC-SPEC-012",
        "AC-SPEC-013"
      ],
      "status": "done",
      "result": "Plan integration 与交付审查通过，设计文档记录实际结果。",
      "scope": [
        "docs/designs/",
        "docs/others/evidence/"
      ],
      "depends_on": [
        "T3"
      ],
      "owner": "ignite-executor"
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
  "risk": "feature",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "",
    "migration_impact": "not-decided",
    "rollback": "",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/spec-closure-connection.md",
    "docs/plans/20261107-spec-closure-connection.md",
    "docs/plans/releases/spec-closure-connection-v1.json",
    "tests/contracts/spec-closure-connection.test.ts",
    "docs/designs/",
    "docs/others/design-writeback.md",
    "docs/features/_template.md",
    "docs/others/evidence/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-SPEC-012",
      "test": "tests/contracts/spec-closure-connection.test.ts::[AC-SPEC-012]",
      "run_id": "tdd-20261106165854-ff8bb6"
    },
    {
      "acceptance_id": "AC-SPEC-013",
      "test": "tests/contracts/spec-closure-connection.test.ts::[AC-SPEC-013]",
      "run_id": "tdd-20261106173522-364507"
    }
  ],
  "required_evidence": [
    "check-integration"
  ],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20261106174934-c9c500"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "7e4d0468e3ae52b2488af460904060d4c9d8a6b1",
  "updated_at": "2026-11-06"
}
-->

## 状态

draft，规格与断言已登记，等待原生红灯。

## 目标

让设计文档能被读者区分「当前事实」与「目标设计」，并留下计划到设计文档的回写台账。

## 原始目标与覆盖核对

| 用户原话或可追溯来源           | 本轮目标             | REQ          | AC          | 处理结果 |
| ------------------------------ | -------------------- | ------------ | ----------- | -------- |
| 设计文档区分当前事实与目标设计 | 状态标记可机检       | REQ-SPEC-012 | AC-SPEC-012 | 保留     |
| 加回写总表                     | 台账覆盖全部设计文档 | REQ-SPEC-013 | AC-SPEC-013 | 保留     |

## 整体判断与推进顺序

先让标记规则可机器检查，再补台账覆盖，最后才考虑升级为门禁。
顺序：标记 → 台账 → （后续）门禁。本轮只做前两步，避免一次改动面过大。

## 来源规格

- 用户 2026-11-06 收尾指令：设计文档区分当前事实与目标设计，并加回写总表
- docs/plans/README.md「完成与证据」：计划 done 前必须有回写检查
- docs/others/spec-closure/ledger.json 的 GAP-15 / GAP-19 / GAP-47

## 目标映射

| 用户要求                 | REQ          | AC          | 处理 |
| ------------------------ | ------------ | ----------- | ---- |
| 设计文档区分事实与目标   | REQ-SPEC-012 | AC-SPEC-012 | 保留 |
| 计划到设计文档的回写台账 | REQ-SPEC-013 | AC-SPEC-013 | 保留 |

## 主要矛盾

设计文档同时承载"已实现事实"和"打算改成什么"，读者无法判断哪一段可以直接依赖；
而计划完成的判定不检查回写，于是"计划 done 但设计过期"可以长期无人发现。
三条证据：GAP-15 事实四类无标记、GAP-19 不回写也能标完成、GAP-16 两边规则相反。

## 次要矛盾

模块级 AC 缺失（GAP-47）：验收只到 REQ 层，模块自身行为无人声明。

## 决策原则

- 标记用固定一行 `> 状态：当前事实` 或 `> 状态：目标设计`，便于机器检查
- 回写台账放 docs/others/，不放进 designs，避免设计目录被元数据污染
- 检查先写在测试里，证明规则可执行；是否升级为 check-docs 门禁另行决定

## 方案比较

| 方案                  | 做法                       | 取舍                           |
| --------------------- | -------------------------- | ------------------------------ |
| A 自由文本说明        | 每份文档开头写一句         | 人可读，机器无法校验           |
| B 固定标记 + 契约测试 | 一行固定格式，测试遍历校验 | 可执行、可回归；需改 12 份文档 |
| C 拆成两个目录        | 事实与目标分目录           | 迁移成本高，破坏现有链接       |

选择 B。

## 约束绑定矩阵

| 约束                     | 落点                             | 验证             |
| ------------------------ | -------------------------------- | ---------------- |
| 只改文档与测试           | 任务写入范围限定 docs/ 与 tests/ | check 的范围检查 |
| 标记必须可机检           | 固定格式 + 正则                  | AC-SPEC-012      |
| 台账必须覆盖全部设计文档 | 测试遍历 designs 目录            | AC-SPEC-013      |

## 回退

删除新增的状态标记行、docs/others/design-writeback.md 与对应测试即可回到当前状态；
不涉及接口、数据与迁移。

## 非目标

- 不重写任何设计文档正文
- 不把检查并入 check-docs 门禁
- 不处理模块级 AC（GAP-47），留待后续计划

## 变更类型

存量改动（文档与测试），不涉及业务代码。

## 输入规格

- docs/designs/*.md 现状：无状态标记
- docs/others/ 现状：无 design-writeback.md

## 已关闭问题

- 标记放在哪里：文件标题之后第一行，固定引用块
- 允许的取值：只有「当前事实」与「目标设计」两种

## 测试与验收设计

- tests/contracts/spec-closure-connection.test.ts
- AC-SPEC-012：遍历 docs/designs，断言每份含合法状态标记
- AC-SPEC-013：断言台账存在、覆盖全部设计文档、含至少一个计划编号

## 实现任务

T1 登记规格与断言（已完成）
T2 记录原生红灯
T3 给 12 份设计文档加标记、写台账、调整需求模板顺序
T4 验证并回写设计

## 验收方式

pnpm ignite check --plan IGT-1793982738195660699 --level auto 返回 0，
且 AC-SPEC-012 / AC-SPEC-013 的断言在实现后通过。

## 设计回写

本计划只新增标记与台账，不改变系统行为；docs/designs/README.md 增加一段说明标记约定。

## 状态记录

- 2026-11-07：登记 Feature、计划、发布与断言，提交基线。

## 准出条件

- 设计文档全部带合法标记
- 回写台账覆盖全部设计文档并含计划编号
- check --plan 通过，交付审查通过

<!-- ignite-progress -->

状态：`verifying`（由元数据生成）

- [x] T1 · 登记规格、计划与断言并提交基线 · done
- [x] T2 · 运行真实断言并记录目标行为红灯 · done
- [x] T3 · 实现标记、台账与模板顺序 · done
- [x] T4 · 验证兼容性并回写设计 · done

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20261106174934-c9c500
<!-- /ignite-progress -->

## TDD 恢复记录

2026-11-06，AC-SPEC-012：acceptance。保留原回执 tdd-20261106164431-4f1304；对应任务重新进入真实红灯，旧验收绑定已撤销。本次恢复没有生成通过或失败凭证。
