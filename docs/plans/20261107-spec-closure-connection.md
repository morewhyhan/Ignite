<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1793982738195660699",
  "release": "spec-closure-connection-v1",
  "status": "draft",
  "outcome": "设计文档能区分当前事实与目标设计，并留下计划到设计文档的回写台账",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "goals": [
    "每份设计文档声明事实或目标",
    "建立回写台账并覆盖全部设计文档"
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
      "status": "doing",
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
      "status": "todo",
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
      "status": "todo",
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
  "risk": "docs",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "",
    "migration_impact": "not-decided",
    "rollback": "",
    "destructive_authorization": null
  },
  "write_scope": [
    "<feature-path>",
    "<test-path>",
    "<affected-path>",
    "<design-path>",
    "docs/others/evidence/",
    "docs/plans/20261107-spec-closure-connection.md",
    "docs/plans/releases/spec-closure-connection-v1.json",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [],
  "required_evidence": [
    "check-integration"
  ],
  "evidence": [],
  "blocker": null,
  "open_questions": [
    "填写目标、受影响的现有 Feature/Design、验收标准与写入范围"
  ],
  "integrated_commit": null,
  "updated_at": "2026-11-07"
}
-->
## 状态

draft，元数据与断言已登记，等待原生红灯。

## 目标

让设计文档能被读者区分「当前事实」与「目标设计」，并留下计划到设计文档的回写台账。

## 来源规格

- 用户 2026-11-06 收尾指令：设计文档区分当前事实与目标设计，并加回写总表
- docs/plans/README.md「完成与证据」：计划 done 前必须有回写检查
- docs/others/spec-closure/ledger.json 的 GAP-15 / GAP-19 / GAP-47：事实无标记、不回写也能完成、模块级 AC 缺失

## 目标映射

| 用户要求 | REQ | AC | 处理 |
| -------- | --- | -- | ---- |
| 设计文档区分事实与目标 | REQ-SPEC-012 | AC-SPEC-012 | 保留 |
| 计划到设计文档的回写台账 | REQ-SPEC-013 | AC-SPEC-013 | 保留 |

## 主要矛盾

设计文档同时承载"已实现事实"和"打算改成什么"，读者无法判断哪一段可以直接依赖；
而计划完成的判定不检查回写，于是"计划 done 但设计过期"可以长期无人发现。
三条对应证据：GAP-15 事实四类无标记、GAP-19 不回写也能标完成、GAP-16 设计能否承载目标设计两边规则相反。

## 次要矛盾

模块级 AC 缺失（GAP-47）：验收只到 REQ 层，模块自身行为无人声明，跨模块连接无法验收。

## 决策原则

- 标记采用固定一行 `> 状态：当前事实` 或 `> 状态：目标设计`，不用自由文本，便于机器检查
- 回写台账放 docs/others/，不放进 designs，避免设计目录被元数据污染
- 检查先写在测试里，证明规则可执行；是否升级为 check-docs 门禁另行决定

## 方案比较

| 方案 | 做法 | 取舍 |
| ---- | ---- | ---- |
| A 自由文本说明 | 每份文档开头写一句 | 人可读，机器无法校验 |
| B 固定标记 + 契约测试 | 一行固定格式，测试遍历校验 | 可执行、可回归；需要改 12 份文档 |
| C 拆成两个目录 | 事实与目标分目录 | 迁移成本高，破坏现有链接 |

选择 B。

## 约束绑定矩阵

| 约束 | 落点 | 验证 |
| ---- | ---- | ---- |
| 只改文档与测试 | 任务写入范围限定 docs/ 与 tests/ | check 的范围检查 |
| 标记必须可机检 | 固定格式 + 正则 | AC-SPEC-012 |
| 台账必须覆盖全部设计文档 | 测试遍历 designs 目录 | AC-SPEC-013 |

## 回退

删除新增的状态标记行、docs/others/design-writeback.md 与对应测试即可回到当前状态；
不涉及接口、数据与迁移，无破坏性变更。
