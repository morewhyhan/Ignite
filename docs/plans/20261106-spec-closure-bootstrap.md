<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060001",
  "release": "spec-closure-p0-v1",
  "status": "draft",
  "outcome": "模板能把闭环标准登记为有效来源，并用一份机器可读账本与历史补录回答每条规矩归谁",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "goals": [
    {
      "text": "标准索引、文档检查清单与治理白名单同时登记闭环标准",
      "requirements": [
        "REQ-SPEC-001"
      ]
    },
    {
      "text": "52 条差异形成可被检查的账本，每条有负责计划与处置",
      "requirements": [
        "REQ-SPEC-002"
      ]
    },
    {
      "text": "五个已完成计划可按补录记录追溯规格归属",
      "requirements": [
        "REQ-SPEC-003"
      ]
    }
  ],
  "constraints": [
    "不修改任何历史计划的正文与证据",
    "新增文件为纯增量，撤销提交即可回退",
    "检查失败必须指出缺失位置，而不是只报总数"
  ],
  "non_goals": [
    "不引入 STD/ DES 编号体系与绑定矩阵字段",
    "不改动 ready 门禁、任务调度与发布验收规则",
    "不做文档定稿状态机"
  ],
  "authorization": {
    "source": "用户 2026-11-06 会话指令：按草案开工执行"
  },
  "deliverables": [
    "登记后的闭环标准与四处索引一致",
    "docs/others/inputs/spec-closure-ledger.json 与补录文件",
    "tests/contracts/spec-closure.test.ts 的三条行为断言"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "173224e460dcf76459a8fe76f52d8fe6d34d124d",
  "requirements": [
    "REQ-SPEC-001",
    "REQ-SPEC-002",
    "REQ-SPEC-003"
  ],
  "acceptance": [
    {
      "id": "AC-SPEC-001",
      "tests": [
        "tests/contracts/spec-closure.test.ts::[AC-SPEC-001]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/spec-closure.test.ts::[AC-SPEC-001]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-SPEC-002",
      "tests": [
        "tests/contracts/spec-closure.test.ts::[AC-SPEC-002]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/spec-closure.test.ts::[AC-SPEC-002]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-SPEC-003",
      "tests": [
        "tests/contracts/spec-closure.test.ts::[AC-SPEC-003]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/spec-closure.test.ts::[AC-SPEC-003]",
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
      "title": "登记需求、计划、发布范围并编写真实断言",
      "phase": "prepare",
      "status": "todo",
      "result": "Feature、Plan、Release 与三条契约断言均已写入，准备结构检查通过；基线提交由 T1 完成时单独记录。",
      "scope": [
        "docs/features/spec-closure.md",
        "docs/plans/20261106-spec-closure-bootstrap.md",
        "docs/plans/releases/spec-closure-p0-v1.json",
        "tests/contracts/spec-closure.test.ts"
      ],
      "depends_on": [],
      "owner": "ignite-executor"
    },
    {
      "id": "T2",
      "title": "运行契约断言并记录目标行为红灯",
      "phase": "red",
      "acceptance": [
        "AC-SPEC-001",
        "AC-SPEC-002",
        "AC-SPEC-003"
      ],
      "status": "todo",
      "result": "在登记与账本缺失的旧实现上，三条断言真实失败并记录原生回执。",
      "scope": [
        "tests/contracts/spec-closure.test.ts",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": [
        "T1"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T3",
      "title": "登记标准、写入差异账本与历史补录",
      "phase": "implement",
      "acceptance": [
        "AC-SPEC-001",
        "AC-SPEC-002",
        "AC-SPEC-003"
      ],
      "status": "todo",
      "result": "四处索引一致，账本含 52 条归属，补录覆盖五个历史计划，三条断言转绿。",
      "scope": [
        "docs/standards/README.md",
        "scripts/check-docs.mjs",
        "scripts/ignite/checks.mjs",
        "docs/others/inputs/spec-closure-ledger.json",
        "docs/others/inputs/spec-closure-backfill.json",
        "docs/others/adr/0004-spec-closure-contract.md"
      ],
      "depends_on": [
        "T2"
      ],
      "owner": "ignite-executor"
    },
    {
      "id": "T4",
      "title": "完成文档检查与交付核对并回写当前事实",
      "phase": "verify",
      "status": "todo",
      "result": "文档检查与契约测试全绿，执行设计记录登记事实，剩余缺口如实记录。",
      "scope": [
        "docs/designs/execution.md",
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
    "access_rationale": "本轮只改模板文档与检查脚本，不读写业务数据。",
    "migration_impact": "none",
    "rollback": "撤销提交即可恢复；新增文件为纯增量。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/spec-closure.md",
    "docs/plans/20261106-spec-closure-bootstrap.md",
    "docs/plans/releases/spec-closure-p0-v1.json",
    "docs/others/inputs/",
    "docs/others/adr/",
    "docs/others/evidence/",
    "docs/standards/README.md",
    "docs/designs/execution.md",
    "tests/contracts/spec-closure.test.ts",
    "scripts/check-docs.mjs",
    "scripts/ignite/checks.mjs"
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

# Ignite 实施计划：spec-closure-bootstrap

> 本轮把《从规格到实现的 DDD 架构闭环》接进模板的强制体系：登记为有效来源、把 52 条差异固化为账本、给五个已完成计划补录规格归属。

## 状态

顶部元数据的 `status` 是唯一状态；`tasks` 是唯一子任务状态。下方进度块由工具刷新。

## 目标

维护者新增标准文件时，若未进入索引、检查清单或白名单，检查失败并指出缺失位置；本轮差异与历史归属均能按编号查到。

## 原始目标与覆盖核对

| 用户原话或可追溯来源 | 本轮目标 | REQ | AC | 处理结果 |
| --- | --- | --- | --- | --- |
| "这份文档它是一个草案……你要按照这个来做"（2026-11-06 会话） | 把闭环标准登记为有效来源 | REQ-SPEC-001 | AC-SPEC-001 | 保留 |
| "把我的这些规格……被执行清楚，并且能够被验收清楚" | 52 条差异形成可检查账本 | REQ-SPEC-002 | AC-SPEC-002 | 保留 |
| "那个补上去"（历史计划） | 五个建设期计划归档后可追溯，未记录项如实标注 | REQ-SPEC-003 | AC-SPEC-003 | 保留 |
| "解决各个板块、各个领域模块之间的连接性的可靠问题" | 跨文档、跨模块、跨计划的连接检查 | 本阶段不纳入 | — | 延期到 P4 |
| "不依赖大模型的能力，而靠代码和文档体系约束" | 能写成检查的一律写成检查器 | 本阶段部分纳入（标准登记检查） | AC-SPEC-001 | 其余延期到 P2/P3 |

进入 ready 前已回看原始请求：三条目标覆盖"按草案做、差异有账、历史补齐"，未把 AI 改写后的 goals 当作原始输入。

## 整体判断与推进顺序

- 整体链路与事实：文档检查由 `scripts/check-docs.mjs` 汇总，标准索引在 `docs/standards/README.md`，治理白名单在 `scripts/ignite/checks.mjs`。计划准备时三处都不含该标准，也没有账本与补录；T3 落地后的实际状态见状态记录。
- 当前主要问题：标准没有登记，于是它既不触发检查、也不产生后果；账本与补录不存在，于是"每条规矩归谁"无从查起。
- 推进与尺度：先登记四处索引，再写账本与补录，最后用契约测试同时守住三者。尺度以三条行为断言为准，不扩张到编号体系与绑定矩阵。
- 纠偏与停止：若契约测试失败来自索引路径不一致，改索引；若来自账本条目数不符，回查 52 条来源。文档检查与三条断言全绿即停止。

## 来源规格与绑定矩阵

| Source ID | 来源 | 适用理由 | 目标 | 当前事实 | Binding | 任务 | 验证 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DOC-DDD-§0 | specification-to-implementation-ddd.md | 本轮需求基线 | 标准被登记为有效来源 | 三处索引均缺失 | BIND-001 | T3 | AC-SPEC-001 |
| DOC-DDD-§10.5 | specification-to-implementation-ddd.md | 要求绑定可检查 | 差异与归属可被机器读取 | 无账本文件 | BIND-002 | T3 | AC-SPEC-002 |
| DOC-DDD-§10.2 | specification-to-implementation-ddd.md | 要求来源逐项检查 | 历史计划可追溯 | 五个计划无补录 | BIND-003 | T3 | AC-SPEC-003 |
| REQ-SPEC-001 | docs/features/spec-closure.md | 产品要求 | 四处登记一致 | 缺失 | BIND-004 | T3 | AC-SPEC-001 |
| REQ-SPEC-002 | docs/features/spec-closure.md | 产品要求 | 账本完整 | 缺失 | BIND-005 | T3 | AC-SPEC-002 |
| REQ-SPEC-003 | docs/features/spec-closure.md | 产品要求 | 补录完整 | 缺失 | BIND-006 | T3 | AC-SPEC-003 |
| DES-EXECUTION | docs/designs/execution.md | 执行系统当前事实 | 登记事实被记录 | 未记录闭环登记 | BIND-007 | T4 | 文档检查 |
| ADR-0004 | docs/others/adr/0004-spec-closure-contract.md | 本轮长期取舍 | 决策可追溯 | 已写入 | BIND-008 | T3 | 文档检查 |
| AC-SPEC-001 | docs/features/spec-closure.md | 登记必须可检查 | 未登记标准被拒 | 规则已实现 | BIND-009 | T2/T3 | AC-SPEC-001 |
| AC-SPEC-002 | docs/features/spec-closure.md | 账本必须锚定真实章节 | 52 条可核对 | 账本已写入 | BIND-010 | T2/T3 | AC-SPEC-002 |
| AC-SPEC-003 | docs/features/spec-closure.md | 补录不得推断 | 归档可核对 | 补录已写入 | BIND-011 | T2/T3 | AC-SPEC-003 |
| GOAL-SPEC-CLOSURE-P0 | docs/plans/releases/spec-closure-p0-v1.json | 发布范围覆盖本轮目标 | 三条验收有去向 | 已纳入 | BIND-012 | T3 | 发布检查 |
| DOC-DDD-§6 | specification-to-implementation-ddd.md | 绑定矩阵要求 | 每条来源有绑定 | 本表即最小示例 | BIND-013 | T3 | 文档检查 |
| DOC-DDD-§7 | specification-to-implementation-ddd.md | 矛盾写法要求 | 按句式写主要矛盾 | 已按句式重写 | BIND-014 | T2 | 文档检查 |
| DOC-DDD-§10.1 | specification-to-implementation-ddd.md | 计划固定内容 | 十五部分齐备 | 本计划含新增章节 | BIND-015 | T3 | 文档检查 |
| DOC-DDD-§10.4 | specification-to-implementation-ddd.md | 准入条件 | 十条逐条满足 | 见准出条件 | BIND-016 | T3 | 文档检查 |

不适用来源：本轮的测试意图沿用现有契约测试结构，不新增测试用例文档；跨 Plan 交接不涉及，故 handoff 为空。

## 主要矛盾

目标要求每条规矩都有主、有任务、有验证。
当前结构依赖一张硬编码清单：只有需求能挂上编号，标准与设计只能以自由文本出现。
硬编码清单会持续造成新增标准静默失效：文件写进目录不等于进入检查，谁都没被提醒。
因此"全量可追踪"与"硬编码清单"在当前结构下不能同时成立。
支撑事实：三处登记点都是手写列表；文档列出的九条最低检查只对上一条；空壳章节可以通过。
它最阻碍目标，因为它决定其余条目有没有入口——没有登记就没有绑定，没有绑定就没有验证。
推翻条件：若检查器已能遍历目录并拒绝未登记文件，则本矛盾降级为配置问题。

## 次要矛盾

- 术语两套（binding 一词两义）：本轮不改名，留待统一阶段，原因是此刻尚无字段使用该词。
- 历史计划缺分析记录：本轮只补可查证的归属，不补写当时的判断。
- 文档状态仍是初稿：本轮把它当需求基线使用，状态问题由后续阶段处理。

## 决策原则与方案比较

- 原则：能检查的写成检查；只能判断的留下记录；不伪造历史。
- 采用方案：三处登记 + 一条目录遍历规则 + 一份账本 + 一份归档补录 + 三条契约断言。
- 替代方案：只写文档不做检查（否决，因为无法阻止下一次遗漏）；把 52 条拆成 52 个任务（否决，任务粒度过细，无法独立验收）。
- 代价：本轮改动 5 个文件、新增 4 个文件，另按发布规则删除 5 个建设期计划与 5 份发布记录；检查器新增一条目录遍历规则。
- 复审条件：若后续阶段引入编号体系，本轮账本的 plan 字段需要重新映射。

## 回退

撤销本轮提交即可恢复；新增文件为纯增量，删除不影响既有检查；索引改动为单行追加，回退无数据影响。

## 非目标

本轮不处理编号、绑定字段、ready 门禁与文档生命周期；这些留给后续计划。

## 变更类型

存量改动：模板文档治理与检查脚本，无数据库、无接口、无共享文件变更。

## 输入规格

- 需求：`docs/features/spec-closure.md`
- 标准：`docs/standards/README.md`、`docs/standards/ai-agents.md`
- 设计：`docs/designs/execution.md`
- 发布：`docs/plans/releases/spec-closure-p0-v1.json`

## 已关闭问题

无未决问题；`authorization.source` 记录本轮实施授权来源。

## 测试与验收设计

三条断言全部落在 `tests/contracts/spec-closure.test.ts`，层级为 unit：读取真实文件、解析真实 JSON、核对真实路径。断言失败时必须指出缺失位置，而不是只报数量。

## 实现任务

见顶部 `tasks`：T1 准备并提交基线，T2 取红灯，T3 登记与写入，T4 验证与回写。三处索引的改动属于同一可验收结果，不拆分。

## 验收方式

`pnpm exec vitest run tests/contracts/spec-closure.test.ts` 三条断言通过；`node scripts/check-docs.mjs` 退出码 0；`pnpm ignite check --plan IGT-202611060001 --level auto` 生成 check-dev 证据；交付前 `pnpm delivery:check --plan IGT-202611060001`。

## 设计回写

完成后只在 `docs/designs/execution.md` 记录"标准登记与账本"这一当前事实，不复制计划过程。

## 状态记录

- 2026-11-06：建立计划，记录三条目标与绑定矩阵。
- 2026-11-06：实现前直接运行 `vitest run tests/contracts/spec-closure.test.ts`，三条断言真实失败（标准索引缺链接、账本与补录文件不存在）；该次运行未走原生 `ignite tdd red`，因此没有原生回执，记为流程缺口，后续计划必须用原生入口取红灯。
- 2026-11-06：写入账本、补录、ADR 与三处登记后，同一文件三条断言通过。
- 2026-11-06：`node scripts/check-docs.mjs` 曾因五个建设期计划的提交不在 HEAD 祖先链上失败；按用户选项 A 将这些计划与发布记录移出工作树（内容留在 Git 历史），补录改为归档形式后检查通过（51 个 Markdown、8 份需求、1 份计划，退出码 0）。
- 2026-11-06：独立草稿审查返回 12 条（9 条阻断）。已按审查修订：登记改为目录遍历规则、账本锚定章节、补录按需求登记核对、补绑定矩阵行、重写主要矛盾、补延期目标。审查记录本身尚未回写，需对新对象重新审查。
- 2026-11-06：原生红灯仍缺。红灯由实现前的 vitest 直接运行取得（三条失败），未走 `ignite tdd red`，因此本计划不能按契约进入 done；该缺口保留，P1 起改用原生入口。

<!-- ignite-progress -->

状态：`draft`（由元数据生成）

- [ ] T1 · 登记需求、计划、发布范围并编写真实断言 · todo
- [ ] T2 · 运行契约断言并记录目标行为红灯 · todo
- [ ] T3 · 登记标准、写入差异账本与历史补录 · todo
- [ ] T4 · 完成文档检查与交付核对并回写当前事实 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

三条断言通过、文档检查无新增失败、账本 52 条与补录 5 条可读、设计已回写，才标记为 done。
