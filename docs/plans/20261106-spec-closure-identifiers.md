<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060002",
  "release": "spec-closure-p1-v1",
  "status": "verifying",
  "outcome": "每份标准、设计与 ADR 文件至少携带一个全仓唯一编号，未知编号引用被拒绝",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-4e6085c2",
      "executor": "ignite-executor",
      "source": "DSH subagent 4e6085c2 (independent read-only reviewer) reviewed the Plan across five revision rounds and approved on 2026-11-06",
      "subject_fingerprint": "d13e82fc51f12b9389b9d6c107cbd645c5710f86f093da447576e52075b8b2a7",
      "verdict": "approved",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T17:13:56.514Z"
    },
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-4e6085c2",
      "executor": "ignite-executor",
      "source": "DSH subagent 4e6085c2 independent read-only review, five revision rounds, approved 2026-11-06",
      "subject_fingerprint": "ede68a68e6000226b20f5ff3f4eb0b7af5297667fb2b175af9595fe453ad8b86",
      "verdict": "approved",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T17:14:52.043Z"
    },
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-4e6085c2",
      "executor": "ignite-executor",
      "source": "DSH subagent 4e6085c2 independent read-only review, five revision rounds, approved 2026-11-06",
      "subject_fingerprint": "4294ccef70eff8581d939d9888b785254ccb55f70e1765776ad44977b378f849",
      "verdict": "approved",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T17:19:27.171Z"
    },
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-4e6085c2",
      "executor": "ignite-executor",
      "source": "DSH subagent 4e6085c2 independent read-only review, five revision rounds, approved 2026-11-06",
      "subject_fingerprint": "d740cbfa8cfeee0cd5125ec17caa8533491cf184fdf2a3cb2fe66a141acc72e6",
      "verdict": "approved",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T17:28:28.021Z"
    },
    {
      "stage": "draft",
      "reviewer": "dsh-review-subagent-4e6085c2",
      "executor": "ignite-executor",
      "source": "DSH subagent 4e6085c2 independent read-only review, five revision rounds, approved 2026-11-06",
      "subject_fingerprint": "bf526375c1a98f35ff0e66b7596c068bceaac94b9adb8ab01269945b064fd39a",
      "verdict": "approved",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-05T17:46:21.909Z"
    }
  ],
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
    "scripts/ignite/spec-id-registry.mjs 与 check-docs 注册检查",
    "tests/contracts/spec-closure-ids.test.ts 的四条断言"
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
      "status": "done",
      "result": "Feature 增量、计划、发布范围、扫描器与四条断言写入并提交基线，准备结构检查通过。",
      "scope": [
        "docs/features/spec-closure.md",
        "docs/plans/20261106-spec-closure-identifiers.md",
        "docs/plans/releases/spec-closure-p1-v1.json",
        "tests/contracts/spec-closure-ids.test.ts",
        "scripts/ignite/spec-id-registry.mjs"
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
      "status": "done",
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
      "status": "done",
      "result": "二十份文件全部可被扫描，缺号、重号与未知引用被拒绝。",
      "scope": [
        "docs/standards/",
        "docs/designs/",
        "scripts/check-docs.mjs",
        "docs/plans/",
        "docs/others/evidence/"
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
      "status": "done",
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
      "status": "done",
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
    "scripts/ignite/spec-id-registry.mjs",
    "scripts/check-docs.mjs",
    "docs/plans/",
    "tests/contracts/spec-closure.test.ts"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-SPEC-004",
      "test": "tests/contracts/spec-closure-ids.test.ts::[AC-SPEC-004]",
      "run_id": "tdd-20261105171732-dc9c29"
    },
    {
      "acceptance_id": "AC-SPEC-005",
      "test": "tests/contracts/spec-closure-ids.test.ts::[AC-SPEC-005]",
      "run_id": "tdd-20261105172010-6f552b"
    }
  ],
  "required_evidence": [
    "check-integration"
  ],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20261105175158-edbeca"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "ae90ea59d46f99979fd16899ce66ad8e3641df4a",
  "updated_at": "2026-11-05"
}
-->

# Ignite 实施计划：spec-closure-identifiers

> 给标准、设计与 ADR 的规则加稳定编号，并让计划无法引用不存在的编号。

## 状态

顶部元数据的 status 是唯一状态；tasks 是唯一子任务状态。进度块由工具生成。

## 目标

维护者新增标准、设计或 ADR 时，文件必须带编号；计划引用不存在的编号时检查失败。

## 原始目标与覆盖核对

| 用户原话或可追溯来源   | 本轮目标                     | REQ          | AC          | 处理结果               |
| ---------------------- | ---------------------------- | ------------ | ----------- | ---------------------- |
| 每条规格都能被执行清楚 | 每份来源文件至少一个稳定编号 | REQ-SPEC-004 | AC-SPEC-004 | 保留                   |
| 不依赖大模型的能力     | 引用未知编号由检查器拒绝     | REQ-SPEC-005 | AC-SPEC-005 | 保留                   |
| 各板块之间连接可靠     | 编号成为跨文档引用的锚点     | REQ-SPEC-004 | AC-SPEC-004 | 部分纳入，绑定阶段完成 |

## 整体判断与推进顺序

- 整体链路与事实：标准、设计、ADR 都是散文，计划只能写文件名；全仓没有 STD/DES 编号（`grep` 结果为 0）。
- 当前主要问题：没有编号就没有绑定，无法回答这条规矩被谁覆盖。
- 推进与尺度：先补文件级编号，再做引用校验；规则级编号留到绑定阶段。
- 纠偏与停止：缺号就补号，格式不符就修格式；检查与断言全绿即停止。

## 编号分配表

| 文件                                                  | 编号            | 处理                                       |
| ----------------------------------------------------- | --------------- | ------------------------------------------ |
| docs/standards/architecture.md                        | STD-ARCH-101    | 追加                                       |
| docs/standards/api.md                                 | STD-API-101     | 追加                                       |
| docs/standards/database.md                            | STD-DATA-101    | 追加                                       |
| docs/standards/development.md                         | STD-DEV-101     | 追加                                       |
| docs/standards/security.md                            | STD-SEC-101     | 追加                                       |
| docs/standards/testing.md                             | STD-TEST-101    | 追加                                       |
| docs/standards/ai-agents.md                           | STD-AGENT-101   | 追加                                       |
| docs/standards/adoption.md                            | STD-ADOPT-101   | 追加                                       |
| docs/standards/specification-to-implementation-ddd.md | STD-CLOSE-101   | 追加                                       |
| docs/designs/api.md                                   | DES-API-101     | 追加                                       |
| docs/designs/auth.md                                  | DES-AUTH-101    | 追加                                       |
| docs/designs/database.md                              | DES-DB-101      | 追加                                       |
| docs/designs/design.md                                | DES-VISUAL-101  | 追加                                       |
| docs/designs/domain.md                                | DES-DOMAIN-101  | 追加                                       |
| docs/designs/execution.md                             | DES-EXEC-101    | 追加                                       |
| docs/designs/runtime.md                               | DES-RUNTIME-101 | 追加（该文件无条目，按约束追加一条规则行） |
| docs/others/adr/0001-0004                             | ADR-0001..0004  | 已有，不新增                               |

共 20 份非索引文件：4 份 ADR 已有编号，16 份需要追加。

## 来源与绑定矩阵

| Source ID     | 来源                                                  | 适用理由                   | 目标                     | 当前事实（证据）                         | Status  | Gap            | Contradiction              | Decision            | Binding  | 任务 | 验证        | Result |
| ------------- | ----------------------------------------------------- | -------------------------- | ------------------------ | ---------------------------------------- | ------- | -------------- | -------------------------- | ------------------- | -------- | ---- | ----------- | ------ |
| REQ-SPEC-004  | docs/features/spec-closure.md                         | 产品要求                   | 每份文件至少一个唯一编号 | 4 份 ADR 已有编号，16 份缺号（见分配表） | missing | 16 份文件缺号  | 文件无身份，条目不可被引用 | 文件级编号          | BIND-001 | T3   | AC-SPEC-004 | 已验证 |
| REQ-SPEC-005  | docs/features/spec-closure.md                         | 产品要求                   | 未知引用被拒绝           | 无校验（check-docs 无引用检查）          | missing | 无引用校验     | 自由文本无法核对           | 严格 token 校验     | BIND-002 | T3   | AC-SPEC-005 | 已验证 |
| AC-SPEC-004   | docs/features/spec-closure.md                         | 验收                       | 缺号与重号被拒           | 断言已写，尚无原生红灯                   | partial | 实现与红灯均缺 | 同上                       | 扫描器 + check-docs | BIND-003 | T3   | AC-SPEC-004 | 已验证 |
| AC-SPEC-005   | docs/features/spec-closure.md                         | 验收                       | 未知引用被拒             | 断言已写，尚无原生红灯                   | partial | 实现与红灯均缺 | 同上                       | 引用校验            | BIND-004 | T3   | AC-SPEC-005 | 已验证 |
| GOAL-SPEC-P1  | docs/plans/releases/spec-closure-p1-v1.json           | 发布范围                   | 两条验收有去向           | scope 已纳入（文件第 8-19 行）           | met     | 无             | 无                         | included            | BIND-005 | T3   | 发布检查    | 已验证 |
| DES-EXEC-101  | docs/designs/execution.md                             | 当前事实来源               | 记录编号现状             | 未见编号章节                             | missing | 回写缺失       | 事实与结构不同步           | T5 回写             | BIND-006 | T5   | 文档检查    | 已验证 |
| ADR-0004      | docs/others/adr/0004-spec-closure-contract.md         | 决策要求引入编号时复审     | 复审并记录               | 第 26 行要求届时复审                     | missing | 未复审         | 决策与实施脱节             | T4 复审             | BIND-007 | T4   | 文档检查    | 已验证 |
| DOC-DDD-§6    | docs/standards/specification-to-implementation-ddd.md | 要求绑定用稳定 ID          | 编号可被引用             | 无编号                                   | missing | 无 Source ID   | 无法建立绑定               | 先做编号            | BIND-008 | T3   | AC-SPEC-004 | 已验证 |
| DOC-DDD-§10.5 | docs/standards/specification-to-implementation-ddd.md | 要求 Source ID 稳定        | 编号唯一                 | 无编号                                   | missing | 无唯一性检查   | 重号不可发现               | 查重                | BIND-009 | T3   | AC-SPEC-004 | 已验证 |
| DOC-DDD-§10.1 | docs/standards/specification-to-implementation-ddd.md | 计划要引用来源             | 引用可核对               | 无校验                                   | missing | 无引用校验     | 未知引用不可发现           | 严格 token          | BIND-010 | T3   | AC-SPEC-005 | 已验证 |
| DOC-DDD-§10.4 | docs/standards/specification-to-implementation-ddd.md | 准入要求每条来源有 Binding | 计划准入可判断           | 无编号即无绑定                           | missing | 准入缺编号依据 | 无编号则无法进入 ready     | 先补编号            | BIND-011 | T3   | AC-SPEC-004 | 已验证 |

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

四条断言 import 生产扫描器 scripts/ignite/spec-id-registry.mjs 并直接读真实文件：每份文件必须有编号且唯一；重号要报出两个位置；未知引用要列出且不误报占位符。AC-SPEC-005 的"运行引用校验失败"另由 T3 记录运行证据：在本地临时写入一个未知编号、确认 check-docs 退出码非 0 并打印该编号，然后还原。

## 实现任务

见顶部 tasks：T1 准备并提交基线，T2 取原生红灯，T3 加编号并接入检查，T4 复审 ADR 与账本，T5 验证回写。

## 已关闭问题

无未决问题；编号分配表已固定 16 个待追加编号与 4 个既有 ADR 编号。

## 验收方式

运行 tests/contracts/spec-closure-ids.test.ts；运行 node scripts/check-docs.mjs；运行 pnpm ignite check --plan IGT-202611060002 --level auto（risk=infrastructure，需 check-integration）；交付前运行 pnpm delivery:check。

## 设计回写

在 docs/designs/execution.md 记录编号现状与检查入口；在 docs/standards/README.md 说明编号约定。

## 状态记录

- 2026-11-06：建立计划；测试在未编号仓库上失败（2 failed / 2 passed），准备基线随后提交。
- 2026-11-06：前三轮审查共 27 条意见（阻断 15 条）。已改：risk、绑定矩阵、编号分配表、引用范围、ADR 复审任务、计数与示例 ID、扫描器路径与测试接入。原生红灯仍未记录。
- 2026-11-06：测试改为四条断言，其中"文件缺号"与"计划引用未解析"两条在真实仓库上失败，构成 AC-SPEC-004/005 的目标红灯；重号与占位符两条为生产扫描器的单元保证。
- 2026-11-06：draft 审查经五轮修订后 approved，记录已回写；计划转 ready、active，T1 完成。
- 2026-11-06：AC-SPEC-005 的旧红灯失效后走 restart 流程：先把 16 份文件恢复到编号前状态并提交 d51c458，在该提交上取得红灯 tdd-20261105172010-6f552b，再重放实现 5a58b9f。这是 restart 红灯，严格早于首次实现的红灯只有 AC-SPEC-004。
- 2026-11-06：check-integration 证据 run-20261105175158-edbeca 在 ae90ea5 以 exit 0 通过，输入指纹与当前一致；九道工程门禁全部通过。integrated_commit 指向 ae90ea5。
- 2026-11-06：按交付审查要求补做 check-docs 负例：临时写入未知编号后运行检查，退出码 1 并打印该编号，随后还原；输出见下一条记录。
- 2026-11-06：负例结果：临时在 P0 计划追加一个未分配的 DES 前缀编号后运行 check-docs，输出 “unknown specification reference <该编号>”，退出码 1；随后用 git checkout 还原，工作树无残留。
- 2026-11-06：原生红灯被宿主环境阻塞。TDD runner 以 spawn(corepack) 启动，本机 Node 在 Windows 上无法解析 corepack（ENOENT / EINVAL），未生成红灯回执。环境错误不算红灯，T2 不标记完成，T3 不启动。
- 2026-11-06：临时兼容层（本地 corepack.exe，不进入仓库）解除了 spawn 阻塞；AC-SPEC-004 与 AC-SPEC-005 均取得原生红灯，实现后四条断言转绿。

<!-- ignite-progress -->

状态：`verifying`（由元数据生成）

- [x] T1 · 登记需求、计划与发布范围并编写真实断言 · done
- [x] T2 · 运行编号断言并记录原生红灯 · done
- [x] T3 · 给十六份来源文件追加编号并接入检查 · done
- [x] T4 · 复审 ADR-0004 并更新账本的编号映射 · done
- [x] T5 · 完成检查与回写 · done

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20261105175158-edbeca
<!-- /ignite-progress -->

## 准出条件

四条断言通过、文档检查退出码 0、check-integration 证据有效、ADR 复审已记录、设计已回写。

## TDD 恢复记录

2026-11-05，AC-SPEC-005：test changed after red; re-establish red on the pre-identifier state。保留原回执 tdd-20261105171646-7fab4e；对应任务重新进入真实红灯，旧验收绑定已撤销。本次恢复没有生成通过或失败凭证。
