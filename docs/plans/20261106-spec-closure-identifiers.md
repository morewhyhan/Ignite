<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060002",
  "release": "spec-closure-p1-v1",
  "status": "draft",
  "outcome": "标准、设计、ADR 的每条规则都有稳定编号，计划引用未知编号会被拒绝",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "goals": [
    {
      "text": "每份标准、设计与 ADR 文件都携带至少一个全仓唯一编号",
      "requirements": [
        "REQ-SPEC-004"
      ]
    },
    {
      "text": "计划引用不存在的编号时校验失败并列出该编号",
      "requirements": [
        "REQ-SPEC-005"
      ]
    }
  ],
  "constraints": [
    "编号只加在可判定条目上，不给散文段落编号",
    "已有文件内容不改写，只在条目行首追加编号",
    "检查失败必须指出文件与编号"
  ],
  "non_goals": [
    "不引入绑定矩阵字段与 ready 门禁",
    "不改动已完成计划与归档补录",
    "不为 ADR 之外的决策文件新建编号体系"
  ],
  "authorization": {
    "source": "用户 2026-11-06 指令：按方案自行持续推进"
  },
  "deliverables": [
    "带编号的标准、设计与 ADR 文件",
    "scripts/ignite/spec-registry.mjs 与 check-docs 注册检查",
    "tests/contracts/spec-closure-ids.test.ts 的三条断言"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "b03c24ff609e917a99d34f1408aec1c89419e347",
  "requirements": [
    "REQ-SPEC-004",
    "REQ-SPEC-005"
  ],
  "acceptance": [
    {
      "id": "AC-SPEC-004",
      "tests": [
        "tests/contracts/spec-closure-ids.test.ts::[AC-SPEC-004]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/spec-closure-ids.test.ts::[AC-SPEC-004]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-SPEC-005",
      "tests": [
        "tests/contracts/spec-closure-ids.test.ts::[AC-SPEC-005]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/spec-closure-ids.test.ts::[AC-SPEC-005]",
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
      "title": "登记需求、计划与发布范围并编写真实断言",
      "phase": "prepare",
      "status": "todo",
      "result": "Feature 增量、计划、发布范围与三条断言写入并提交基线，准备结构检查通过。",
      "scope": [
        "docs/features/spec-closure.md",
        "docs/plans/20261106-spec-closure-identifiers.md",
        "docs/plans/releases/spec-closure-p1-v1.json",
        "tests/contracts/spec-closure-ids.test.ts"
      ],
      "depends_on": [],
      "owner": "ignite-executor"
    },
    {
      "id": "T2",
      "title": "运行编号断言并记录原生红灯",
      "phase": "red",
      "acceptance": [
        "AC-SPEC-004",
        "AC-SPEC-005"
      ],
      "status": "todo",
      "result": "在没有编号的旧文档上，两条断言真实失败并写入原生回执。",
      "scope": [
        "tests/contracts/spec-closure-ids.test.ts",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": [
        "T1"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T3",
      "title": "给标准、设计与 ADR 追加编号并接入检查",
      "phase": "implement",
      "acceptance": [
        "AC-SPEC-004",
        "AC-SPEC-005"
      ],
      "status": "todo",
      "result": "全部来源文件带唯一编号，check-docs 拒绝缺号、重号与未知引用。",
      "scope": [
        "docs/standards/",
        "docs/designs/",
        "docs/others/adr/",
        "scripts/ignite/spec-registry.mjs",
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
      "status": "todo",
      "result": "契约断言与文档检查通过，执行设计记录编号现状。",
      "scope": [
        "docs/designs/execution.md"
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
    "access_rationale": "只修改模板文档与文档检查脚本，不读写业务数据。",
    "migration_impact": "none",
    "rollback": "撤销提交即可恢复；编号为行首追加。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/spec-closure.md",
    "docs/plans/20261106-spec-closure-identifiers.md",
    "docs/plans/releases/spec-closure-p1-v1.json",
    "docs/standards/",
    "docs/designs/",
    "docs/others/adr/",
    "docs/others/evidence/",
    "tests/contracts/spec-closure-ids.test.ts",
    "scripts/ignite/spec-registry.mjs",
    "scripts/check-docs.mjs"
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
# Ignite 实施计划：spec-closure-identifiers

> 给标准、设计与 ADR 的规则加稳定编号，并让计划无法引用不存在的编号。

## 原始目标与覆盖核对

| 用户原话或可追溯来源 | 本轮目标 | REQ | AC | 处理结果 |
| --- | --- | --- | --- | --- |
| 每条规格都能被执行清楚 | 每条规则有稳定编号 | REQ-SPEC-004 | AC-SPEC-004 | 保留 |
| 不依赖大模型的能力 | 引用未知编号由检查器拒绝 | REQ-SPEC-005 | AC-SPEC-005 | 保留 |

## 整体判断与推进顺序

- 整体链路与事实：标准、设计、ADR 都是散文，计划只能写文件名，无法指向具体规则。
- 当前主要问题：没有编号就没有绑定，无法回答这条规矩被谁覆盖。
- 推进与尺度：先补编号，再接扫描与引用校验，以三条断言为准。
- 纠偏与停止：缺号就补号，格式不符就修格式；检查与断言全绿即停止。

## 来源与绑定矩阵

| Source ID | 来源 | 适用理由 | 目标 | 当前事实 | Binding | 任务 | 验证 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DOC-DDD-§6 | specification-to-implementation-ddd.md | 要求每条来源有稳定 ID | 编号可被引用 | 无编号 | BIND-001 | T3 | AC-SPEC-004 |
| DOC-DDD-§10.5 | specification-to-implementation-ddd.md | 要求 Source ID 稳定 | 缺号即失败 | 无检查 | BIND-002 | T3 | AC-SPEC-004 |
| DOC-DDD-§10.1 | specification-to-implementation-ddd.md | 计划需引用来源 | 未知编号被拒 | 无校验 | BIND-003 | T3 | AC-SPEC-005 |
| REQ-SPEC-004 | docs/features/spec-closure.md | 产品要求 | 全仓唯一编号 | 未实现 | BIND-004 | T2/T3 | AC-SPEC-004 |
| REQ-SPEC-005 | docs/features/spec-closure.md | 产品要求 | 引用校验 | 未实现 | BIND-005 | T2/T3 | AC-SPEC-005 |
| AC-SPEC-004 | docs/features/spec-closure.md | 验收 | 缺号与重号被拒 | 未实现 | BIND-006 | T3 | AC-SPEC-004 |
| AC-SPEC-005 | docs/features/spec-closure.md | 验收 | 未知引用被拒 | 未实现 | BIND-007 | T3 | AC-SPEC-005 |
| GOAL-SPEC-P1 | docs/plans/releases/spec-closure-p1-v1.json | 发布范围 | 两条验收有去向 | 已纳入 | BIND-008 | T3 | 发布检查 |

## 主要矛盾

目标要求每条规矩可被引用。
当前结构只记录文件名，规则没有身份。
因此引用一条规则与没有编号不能同时成立，标准改动只能靠人记住。
支撑事实：全仓没有 STD/DES 编号，计划只能写文件路径。
推翻条件：若编号已被广泛使用，则本矛盾不成立。

## 次要矛盾

- 编号会随文件重排失效：本轮只追加行首编号，不改正文顺序。
- 检查器与测试各有一份扫描逻辑：本轮接受少量重复，待绑定阶段合并。

## 决策原则与方案比较

- 原则：能检查的写成检查，编号只加在可判定条目。
- 采用方案：STD-区-NNN、DES-区-NNN、ADR-NNNN 三种前缀，扫描加查重加引用校验。
- 替代方案：给每段散文编号（否决，噪音大）；用文件路径当 ID（否决，无法定位条目）。
- 代价：17 份文件需要追加编号，检查器新增一次全量扫描。

## 回退

撤销提交即可；编号是行首追加，删除不影响正文。

## 非目标

绑定矩阵、ready 门禁与历史计划回写不在本轮。

## 测试与验收设计

三条断言：真实文件必须有编号且唯一；重号要报出两个位置；计划引用未知编号要列出。全部 unit 层，直接读真实文件。

## 实现任务

见顶部 tasks：T1 准备并提交基线，T2 取原生红灯，T3 加编号与检查，T4 验证回写。

## 验收方式

运行 tests/contracts/spec-closure-ids.test.ts；运行 node scripts/check-docs.mjs；运行 pnpm ignite check --plan IGT-202611060002 --level auto；交付前运行 pnpm delivery:check。

## 设计回写

在 docs/designs/execution.md 记录编号现状与检查入口。

<!-- ignite-progress -->

状态：draft（由元数据生成）

- [ ] T1 · 登记需求、计划与发布范围并编写真实断言 · todo
- [ ] T2 · 运行编号断言并记录原生红灯 · todo
- [ ] T3 · 给标准、设计与 ADR 追加编号并接入检查 · todo
- [ ] T4 · 完成检查与回写 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

三条断言通过、文档检查退出码 0、check-dev 证据有效、设计已回写。
