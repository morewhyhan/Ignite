<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060002",
  "release": "spec-closure-p1-v1",
  "status": "draft",
  "outcome": "每份标准、设计与 ADR 文件至少携带一个全仓唯一编号，未知编号引用被拒绝",
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
    "编号只加在可判定条目上；对没有条目的文件允许追加一条规则行",
    "已有正文不改写，只在条目行首追加编号",
    "检查失败必须指出文件与编号",
    "已完成计划与归档补录不重写"
  ],
  "non_goals": [
    "不引入绑定矩阵字段与 ready 门禁",
    "不改动已完成计划正文",
    "不为 ADR 之外的决策文件新建编号体系"
  ],
  "authorization": {
    "source": "用户 2026-11-06 指令：按方案自行持续推进"
  },
  "deliverables": [
    "带编号的 16 份来源文件",
    "scripts/ignite/specification-registry.mjs 与 check-docs 注册检查",
    "tests/contracts/spec-closure-ids.test.ts 的三条断言"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "a408dc90dcd7882d32c71396b7e518333233fdc3",
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
      "result": "Feature 增量、计划、发布范围、扫描器与三条断言写入并提交基线，准备结构检查通过。",
      "scope": [
        "docs/features/spec-closure.md",
        "docs/plans/20261106-spec-closure-identifiers.md",
        "docs/plans/releases/spec-closure-p1-v1.json",
        "tests/contracts/spec-closure-ids.test.ts",
        "scripts/ignite/specification-registry.mjs"
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
      "result": "在未编号的文档上，两条断言真实失败并写入原生回执。",
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
      "title": "给十六份来源文件追加编号并接入检查",
      "phase": "implement",
      "acceptance": [
        "AC-SPEC-004",
        "AC-SPEC-005"
      ],
      "status": "todo",
      "result": "二十份文件全部可被扫描，缺号、重号与未知引用被拒绝。",
      "scope": [
        "docs/standards/",
        "docs/designs/",
        "scripts/check-docs.mjs"
      ],
      "depends_on": [
        "T2"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T4",
      "title": "复审 ADR-0004 并更新账本的编号映射",
      "phase": "implement",
      "acceptance": [
        "AC-SPEC-004"
      ],
      "status": "todo",
      "result": "ADR-0004 记录编号已引入的复审结论，账本补充编号映射说明。",
      "scope": [
        "docs/others/adr/",
        "docs/others/spec-closure/"
      ],
      "depends_on": [
        "T3"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T5",
      "title": "完成检查与回写",
      "phase": "verify",
      "acceptance": [
        "AC-SPEC-004"
      ],
      "status": "todo",
      "result": "契约断言与文档检查通过，执行设计与标准索引记录编号现状。",
      "scope": [
        "docs/designs/execution.md",
        "docs/standards/README.md"
      ],
      "depends_on": [
        "T4"
      ],
      "owner": "ignite-executor"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [
    {
      "path": "docs/designs/",
      "owner": "ignite-executor",
      "mode": "exclusive"
    },
    {
      "path": "docs/standards/",
      "owner": "ignite-executor",
      "mode": "exclusive"
    }
  ],
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
    "docs/others/spec-closure/",
    "docs/others/evidence/",
    "tests/contracts/spec-closure-ids.test.ts",
    "scripts/ignite/specification-registry.mjs",
    "scripts/check-docs.mjs"
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
# Ignite 实施计划：spec-closure-identifiers

> 给标准、设计与 ADR 的规则加稳定编号，并让计划无法引用不存在的编号。

## 状态

顶部元数据的 status 是唯一状态；tasks 是唯一子任务状态。进度块由工具生成。

## 目标

维护者新增标准、设计或 ADR 时，文件必须带编号；计划引用不存在的编号时检查失败。

## 原始目标与覆盖核对

| 用户原话或可追溯来源 | 本轮目标 | REQ | AC | 处理结果 |
| --- | --- | --- | --- | --- |
| 每条规格都能被执行清楚 | 每份来源文件至少一个稳定编号 | REQ-SPEC-004 | AC-SPEC-004 | 保留 |
| 不依赖大模型的能力 | 引用未知编号由检查器拒绝 | REQ-SPEC-005 | AC-SPEC-005 | 保留 |
| 各板块之间连接可靠 | 编号成为跨文档引用的锚点 | REQ-SPEC-004 | AC-SPEC-004 | 部分纳入，绑定阶段完成 |

## 整体判断与推进顺序

- 整体链路与事实：标准、设计、ADR 都是散文，计划只能写文件名；全仓没有 STD/DES 编号（`grep` 结果为 0）。
- 当前主要问题：没有编号就没有绑定，无法回答这条规矩被谁覆盖。
- 推进与尺度：先补文件级编号，再做引用校验；规则级编号留到绑定阶段。
- 纠偏与停止：缺号就补号，格式不符就修格式；检查与断言全绿即停止。

## 编号分配表

| 文件 | 编号 | 处理 |
| --- | --- | --- |
| docs/standards/architecture.md | STD-ARCH-101 | 追加 |
| docs/standards/api.md | STD-API-101 | 追加 |
| docs/standards/database.md | STD-DATA-101 | 追加 |
| docs/standards/development.md | STD-DEV-101 | 追加 |
| docs/standards/security.md | STD-SEC-101 | 追加 |
| docs/standards/testing.md | STD-TEST-101 | 追加 |
| docs/standards/ai-agents.md | STD-AGENT-101 | 追加 |
| docs/standards/adoption.md | STD-ADOPT-101 | 追加 |
| docs/standards/specification-to-implementation-ddd.md | STD-CLOSE-101 | 追加 |
| docs/designs/api.md | DES-API-101 | 追加 |
| docs/designs/auth.md | DES-AUTH-101 | 追加 |
| docs/designs/database.md | DES-DB-101 | 追加 |
| docs/designs/design.md | DES-VISUAL-101 | 追加 |
| docs/designs/domain.md | DES-DOMAIN-101 | 追加 |
| docs/designs/execution.md | DES-EXEC-101 | 追加 |
| docs/designs/runtime.md | DES-RUNTIME-101 | 追加（该文件无条目，按约束追加一条规则行） |
| docs/others/adr/0001-0004 | ADR-0001..0004 | 已有，不新增 |

共 20 份非索引文件：4 份 ADR 已有编号，16 份需要追加。

## 来源与绑定矩阵

| Source ID | 来源 | 适用理由 | 目标 | 当前事实（证据） | Status | Gap | Contradiction | Decision | Binding | 任务 | 验证 | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REQ-SPEC-004 | docs/features/spec-closure.md | 产品要求 | 每份文件至少一个唯一编号 | 4 份 ADR 已有编号，16 份缺号（见分配表） | missing | 16 份文件缺号 | 文件无身份，条目不可被引用 | 文件级编号 | BIND-001 | T3 | AC-SPEC-004 | 待验证 |
| REQ-SPEC-005 | docs/features/spec-closure.md | 产品要求 | 未知引用被拒绝 | 无校验（check-docs 无引用检查） | missing | 无引用校验 | 自由文本无法核对 | 严格 token 校验 | BIND-002 | T3 | AC-SPEC-005 | 待验证 |
| AC-SPEC-004 | docs/features/spec-closure.md | 验收 | 缺号与重号被拒 | 断言已写，尚无原生红灯 | partial | 实现与红灯均缺 | 同上 | 扫描器 + check-docs | BIND-003 | T3 | AC-SPEC-004 | 待验证 |
| AC-SPEC-005 | docs/features/spec-closure.md | 验收 | 未知引用被拒 | 断言已写，尚无原生红灯 | partial | 实现与红灯均缺 | 同上 | 引用校验 | BIND-004 | T3 | AC-SPEC-005 | 待验证 |
| GOAL-SPEC-P1 | docs/plans/releases/spec-closure-p1-v1.json | 发布范围 | 两条验收有去向 | scope 已纳入（文件第 8-19 行） | met | 无 | 无 | included | BIND-005 | T3 | 发布检查 | 待验证 |
| DES-EXEC-101 | docs/designs/execution.md | 当前事实来源 | 记录编号现状 | 未见编号章节 | missing | 回写缺失 | 事实与结构不同步 | T5 回写 | BIND-006 | T5 | 文档检查 | 待验证 |
| ADR-0004 | docs/others/adr/0004-spec-closure-contract.md | 决策要求引入编号时复审 | 复审并记录 | 第 26 行要求届时复审 | missing | 未复审 | 决策与实施脱节 | T4 复审 | BIND-007 | T4 | 文档检查 | 待验证 |
| DOC-DDD-§6 | docs/standards/specification-to-implementation-ddd.md | 要求绑定用稳定 ID | 编号可被引用 | 无编号 | missing | 无 Source ID | 无法建立绑定 | 先做编号 | BIND-008 | T3 | AC-SPEC-004 | 待验证 |
| DOC-DDD-§10.5 | docs/standards/specification-to-implementation-ddd.md | 要求 Source ID 稳定 | 编号唯一 | 无编号 | missing | 无唯一性检查 | 重号不可发现 | 查重 | BIND-009 | T3 | AC-SPEC-004 | 待验证 |
| DOC-DDD-§10.1 | docs/standards/specification-to-implementation-ddd.md | 计划要引用来源 | 引用可核对 | 无校验 | missing | 无引用校验 | 未知引用不可发现 | 严格 token | BIND-010 | T3 | AC-SPEC-005 | 待验证 |

## 主要矛盾

目标要求每条规矩可被引用。
当前结构只记录文件名，规则没有身份。
因此引用一条规则与没有编号不能同时成立，标准改动只能靠人记住。
支撑事实：全仓 0 个 STD/DES 编号，计划只能写文件路径。
推翻条件：若编号已被广泛使用，则本矛盾不成立。

## 次要矛盾

- 规则级编号尚未覆盖：本轮只保证每份文件有编号，规则级留到绑定阶段。
- 检查器与测试共用同一扫描器，避免两份逻辑漂移；本轮已合并。

## 决策原则与方案比较

- 原则：能检查的写成检查；编号只加在可判定条目；没有条目的文件追加一条规则行。
- 扫描器在准备基线中作为断言依赖提交，实际行为（编号数据与 check-docs 接入）在红灯之后实现。
- 采用方案：STD-区-NNN、DES-区-NNN、ADR-NNNN 三种前缀；扫描器放 scripts/ignite，测试与 check-docs 共用。
- 替代方案：给每段散文编号（否决，噪音大）；用文件路径当 ID（否决，无法定位条目）。
- 代价：16 份文件追加编号；检查器新增一次全量扫描。

## 引用校验范围

只扫描计划正文中字母加三位或四位数字的完整编号；ADR-NNNN、STD-区域-NNN 这类占位写法不参与校验。已完成计划不重写；校验在 check-docs 中对当前全部计划执行。

## 变更类型

存量改动：改文档与文档检查脚本，无数据库、无接口、无共享文件冲突。

## 回退

撤销提交即可；编号是行首追加，删除不影响正文。

## 非目标

绑定矩阵字段、ready 门禁、规则级编号不在本轮。

## 输入规格

- 需求：docs/features/spec-closure.md（R4、R5、AC-SPEC-004、AC-SPEC-005）
- 决策：docs/others/adr/0004-spec-closure-contract.md
- 标准：docs/standards/specification-to-implementation-ddd.md §6、§10.1、§10.4、§10.5
- 发布：docs/plans/releases/spec-closure-p1-v1.json

## 测试与验收设计

三条断言直接读真实文件：每份文件必须有编号且唯一；重号要报出两个位置；未知引用要列出且不误报占位符。T3 让 check-docs 使用与断言相同的扫描规则。

## 实现任务

见顶部 tasks：T1 准备并提交基线，T2 取原生红灯，T3 加编号并接入检查，T4 复审 ADR 与账本，T5 验证回写。

## 已关闭问题

无未决问题；编号分配表已固定 16 个待追加编号与 4 个既有 ADR 编号。

## 验收方式

运行 tests/contracts/spec-closure-ids.test.ts；运行 node scripts/check-docs.mjs；运行 pnpm ignite check --plan IGT-202611060002 --level auto（risk=infrastructure，需 check-integration）；交付前运行 pnpm delivery:check。

## 设计回写

在 docs/designs/execution.md 记录编号现状与检查入口；在 docs/standards/README.md 说明编号约定。

## 状态记录

- 2026-11-06：建立计划；测试在未编号仓库上失败（2 failed / 1 passed），准备基线随后提交。
- 2026-11-06：两轮初审共 22 条意见（含 12 条阻断），已改：risk、绑定矩阵、编号分配表、引用范围、ADR 复审任务、计数与示例 ID。原生红灯仍未记录。

<!-- ignite-progress -->

状态：draft（由元数据生成）

- [ ] T1 · 登记需求、计划与发布范围并编写真实断言 · todo
- [ ] T2 · 运行编号断言并记录原生红灯 · todo
- [ ] T3 · 给十六份来源文件追加编号并接入检查 · todo
- [ ] T4 · 复审 ADR-0004 并更新账本的编号映射 · todo
- [ ] T5 · 完成检查与回写 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

三条断言通过、文档检查退出码 0、check-integration 证据有效、ADR 复审已记录、设计已回写。
