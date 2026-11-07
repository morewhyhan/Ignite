<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-000",
  "release": "release-id",
  "status": "draft",
  "outcome": "完成后谁能多做哪件事",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "binding_contract": 1,
  "content_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "goals": [{ "text": "用户可验证的目标", "requirements": ["REQ-FEATURE-001"] }],
  "constraints": ["必须保留的能力或数据"],
  "non_goals": ["本轮明确不做的范围"],
  "authorization": { "source": "用户提出直接实施的请求或对应授权记录" },
  "deliverables": ["最终成果入口"],
  "remaining_work": ["尚未明确的真实验收场景；明确后转入 tasks 或验收契约"],
  "change_type": "新增模块",
  "base_commit": "运行 git rev-parse HEAD 后替换为 40 位 commit",
  "requirements": ["REQ-FEATURE-001"],
  "acceptance": [
    {
      "id": "AC-FEATURE-001",
      "tests": ["tests/path/file.test.ts::[AC-FEATURE-001] 用例名"],
      "required_layers": ["unit"],
      "checks": [{ "test": "tests/path/file.test.ts::[AC-FEATURE-001] 用例名", "layer": "unit" }]
    }
  ],
  "verification_requirements": ["unit"],
  "bindings": [
    { "id": "BIND-001", "source": "REQ-FEATURE-001", "applicable": "本轮产品要求", "status": "missing", "task": "T3", "check": "AC-FEATURE-001" },
    { "id": "BIND-002", "source": "AC-FEATURE-001", "applicable": "本轮验收", "status": "missing", "task": "T2", "check": "AC-FEATURE-001" }
  ],
  "tasks": [
    { "id": "T1", "title": "确认目标、编写真实测试并提交准备基线", "phase": "prepare", "status": "todo", "result": "原始目标、Feature、Release、真实断言、测试路径和写入边界均已对应，规格与测试已提交，独立审查者已核对 draft。", "scope": ["docs/features/<feature-name>.md", "docs/plans/YYYYMMDD-<change-name>.md", "docs/plans/releases/<release-id>.json", "tests/path/file.test.ts"], "depends_on": [], "owner": "assigned-worker" },
    { "id": "T2", "title": "运行真实断言并记录目标行为红灯", "phase": "red", "acceptance": ["AC-FEATURE-001"], "status": "todo", "result": "原生 red 确认已提交测试的目标断言失败并记录证明。", "scope": ["tests/path/file.test.ts", "docs/others/evidence/tdd/"], "depends_on": ["T1"], "owner": "assigned-worker" },
    { "id": "T3", "title": "实现红灯所指向的最小行为切片", "phase": "implement", "acceptance": ["AC-FEATURE-001"], "status": "todo", "result": "同一 AC 断言通过，实现保持在已声明的局部范围内。", "scope": ["src/modules/<feature-name>/", "src/server/api/routes/<feature-name>/", "src/app/"], "depends_on": ["T2"], "owner": "assigned-worker" },
    { "id": "T4", "title": "完成 Plan 验收并回写当前事实", "phase": "verify", "status": "todo", "result": "Plan integration 和独立 delivery 审查均通过，Design 与真实实现一致，剩余缺口有记录。", "scope": ["docs/designs/", "docs/others/evidence/"], "depends_on": ["T3"], "owner": "assigned-worker" }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": { "interfaces": [], "migrations": [], "tests": [], "remaining": [] },
  "owner": "assigned-worker",
  "risk": "feature",
  "data_contract": {
    "access_scope": "not-decided",
    "access_rationale": "",
    "migration_impact": "not-decided",
    "rollback": "",
    "destructive_authorization": null
  },
  "write_scope": [
    "src/modules/<feature-name>/",
    "src/server/api/routes/<feature-name>/",
    "src/server/api/index.ts",
    "src/app/",
    "src/config/navigation.ts",
    "prisma/",
    "tests/",
    "docs/features/<feature-name>.md",
    "docs/plans/YYYYMMDD-<change-name>.md",
    "docs/plans/releases/<release-id>.json",
    "docs/designs/",
    "docs/others/test-cases/",
    "docs/others/evidence/",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "design_writeback": { "changed": [], "reason": "" },
  "blocker": null,
  "open_questions": ["需要关闭的问题"],
  "integrated_commit": null,
  "updated_at": "YYYY-MM-DD"
}
-->

# Ignite 实施计划：<change-name>

> 复制本文件到 `docs/plans/YYYYMMDD-<change-name>.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

顶部元数据的 `status` 是唯一状态；正文不复制当前状态。`tasks` 是唯一的子任务状态，使用 `todo`、`doing`、`done`；真正阻塞时由 Plan 的 `status` 与 `blocker` 表达。不要在正文另建任务复选框。下方进度块由工具刷新，勿手改。

## 目标

用一句用户可观察的结果描述本轮成果。先写清原始目标，再将其拆成 `goals`、REQ、AC 和测试。

## 原始目标与覆盖核对

| 用户原话或可追溯来源 | 本轮目标 | REQ             | AC             | 处理结果                 |
| -------------------- | -------- | --------------- | -------------- | ------------------------ |
| 待逐条填写           | 待填写   | REQ-FEATURE-001 | AC-FEATURE-001 | 保留 / 明确排除 / 待确认 |

进入 `ready` 前回看原始请求，确认目标、约束、必须保留的能力都已列入；不把 AI 自己改写后的 goals 当作原始输入。此表是语义审查记录，不能伪称机器已证明无遗漏。

除上表外，还要写清三件关于"这一轮"的判断：

- **阶段目标**：为最终结果服务、且本轮必须先达到的中间状态；
- **代价**：达到它要付出的时间、复杂度、兼容性或维护成本；
- **假设**：尚未被事实验证、但当前方案暂时依赖的判断。

## 整体判断与推进顺序

按 [推进规则](./README.md#整体判断与推进顺序) 说明以下判断，引用原始目标映射及已有 Design/代码/证据，不再复制目标或任务状态：

- 整体链路与事实：本轮目标如何从输入到结果成立？哪些相关环节受影响，哪些事实已确认，哪些重要未知会改变行动？
- 当前主要问题：哪个必要条件最阻碍承诺成立？证据与推测分别是什么？有竞争方向时按同一目标比较，单一明确问题无需凑候选。
- 推进与尺度：先取得什么可观察结果，再推进什么？需求、任务和检查细到哪里足够？其余发现纳入、延期还是不属于本轮，理由是什么？
- 纠偏与停止：什么证据会推翻当前重点？下一次检查的不同结果怎样改变行动？什么结果意味着排查结束，哪些正式验收仍须执行？

简单任务可以用几句话回答；当前判断是可更新的依据，不是机器证明的正确性。接续会话先回看此段，出现重要新证据时补充原因，不追加逐工具日志。

## 来源规格

- 需求：`docs/features/<feature-name>.md`（列出本轮适用的 REQ/AC）。
- 标准：`docs/standards/<standard>.md` 中限制本轮文件、数据或接口的条目。
- 决策：仍然生效的 ADR 与替代方案。
- **不适用来源与理由**：列出本轮检查过但不适用的文件，逐条写为什么。只列已使用的文件不能证明其他来源已排查。

## 目标映射

- 每条 REQ 对应哪个 Binding ID 与哪个主要任务。
- 每条 AC 由哪个检查证明。

目标和事实必须按同一维度比较，不能只做整体印象判断。目标写了哪些维度，事实就调查哪些维度：

| 目标维度 | 事实维度 | 比较结果    |
| -------- | -------- | ----------- |
| 待填写   | 待填写   | 差距 / 一致 |

## 主要矛盾

写明目标要求什么、当前结构依赖什么、两者为何不能同时成立。
再写支撑事实、为什么它最阻碍目标、以及什么新事实会推翻它。

冲突本身必须满足三点，缺一项就不是主要矛盾：

1. **两个条件都真实存在**：都有事实或证据支撑，不是推测或愿望；
2. **方向相反**：满足一个会削弱另一个；
3. **相互制约**：在当前范围内不能同时最大化。

写法上至少包含四句：目标要求、当前依赖、冲突点、推翻条件。

## 次要矛盾

- 真实存在但当前阻碍更小的冲突，以及它何时升级。

## 决策原则

- 优先什么、保留什么、排除什么，以及依据哪条规律或证据。
  每条原则都要能回指到主要矛盾或一条已接受的决定。

## 方案比较

- 采用方案、被否方案、代价与复审条件。
  被否方案必须给出否定的具体理由，而不是“太复杂”。

## 约束绑定矩阵

| Source ID       | Binding  | 任务 | 验证           |
| --------------- | -------- | ---- | -------------- |
| REQ-FEATURE-001 | BIND-001 | T3   | AC-FEATURE-001 |
| AC-FEATURE-001  | BIND-002 | T2   | AC-FEATURE-001 |

矩阵逐条收束来源：每行都能回指真源与验证方式。

## 回退

失败时如何恢复、影响哪些数据或接口。回退不只是数据回滚：只要本轮改了配置默认值、接口契约或对外行为，就要写明兼容期、旧调用方怎么办、以及回退后它们是否仍可用。

回退后检查仍按旧规则运行，不留下半开状态。

## 非目标

把本轮不处理的范围写入顶部 `non_goals`，这里仅解释容易误解的边界。

## 变更类型

顶部 `change_type` 只选 `[新增模块]` 或 `[存量改动]`；基础设施调整属于存量改动。说明兼容性、数据迁移和回滚策略，并把共享文件写入 `shared_files`，声明 `path`、`owner` 与 `mode`（`exclusive` 或 `integrator`）。

涉及 `prisma/`、认证或业务 API 的 Plan，还要填写顶部 `data_contract`。`access_scope` 使用 `per-user`、`per-organization`、`shared`、`public` 或 `not-applicable`；`migration_impact` 使用 `none`、`additive`、`backfill` 或 `destructive`，具体理由写到相应说明字段。这里记录资源属于谁、访问控制依据、迁移影响和恢复方式。删除或不可逆转换必须记录用户授权。简单决定写在这里即可；只有存在需要长期解释的架构取舍时才新增 ADR。

## 输入规格

只引用本轮相关的 Feature、Standards、Design、代码与测试。存在跨 Plan 依赖、共享写入或交接时按 [跨 Plan 协作](./README.md#跨-plan-依赖与交接) 对齐，在原协作字段保存接口与交接结果。

## 已关闭问题

顶部 `open_questions` 记录未决问题，`authorization.source` 记录实施授权来源。不要把空问题列表当作目标完整性证明。

## 测试与验收设计

按 [测试标准](../standards/testing.md#检查选择与断言尺度) 说明关键检查要回答什么、断言能发现哪种错误；排查有不同结果时，说明各自的下一步。只列本轮适用项，引用现有测试与证据，不重复维护通过状态。

每个 AC 的 `tests` 与 `checks[].test` 必须引用同一带 `[AC-*]` 标记的可执行用例。`required_layers` 和 `verification_requirements` 表示必须满足的验证层级：纯逻辑用 `unit`；UI 交互补 `browser`；持久化补 `database`；真实第三方依赖补 `external`。`verification_contract: 2` 的 Plan 在 integration 中执行自己映射的所有行为层；Release 再对已完成的 Plan 组合执行生产构建和全量浏览器回归。prepare T1 编写并声明真实测试，进入 ready 前提交规格与测试基线。ready 只检查测试已存在且不是占位失败，不要求已有红灯证据。

## 实现任务

从可验收结果拆分顶部 `tasks`，不要按目录数量或工具调用拆任务。**Plan 不是任务清单**：写的是「这轮要证明什么、怎么证明」，任务只是证明的落点；把任务列完当成计划写完，会在验收时暴露出没有可观察结果。

准备任务（T1）与验证任务（末位）同样要有验收指向：前者对齐「规格与测试已提交且审查通过」，后者对齐「本条 AC 有可复现的检查」。没有验收指向的任务不算任务。把一个任务拆成多个实施切片前，确认每个切片都有可观察结果、独立写入范围、明确负责人和已知接口。没有相互依赖、写入范围不重叠且接口已约定的实施任务，可以并行派发；多个切片可以共同实现同一 AC，但都要等待该 AC 的有效红灯。范围重叠、负责人相同或接口未定时，先协调写入边界和接口；共享文件仍由唯一集成人写入。一个完整 CRUD 行为若接口尚未稳定，可以保留为一个纵向切片。

每个任务要能独立判断成败，写明两件事：

- **改变条件**：出现什么事实时，这个任务的方案要调整；
- **失败判定**：出现什么结果算这个任务没达成，以及退回哪一步。

准备检查的 `planning_diagnostics` 会提示多范围实施任务的拆分复查，以及候选任务间的依赖、验收、范围和接口条件。诊断只提供建议，不阻止可合法执行的单任务 Plan，也不表示 Agent 已派发。`remaining_work` 仅放尚未能转成明确任务的验收缺口，不重复列任务。

## 验收方式

prepare T1 编写真实行为测试后，先独立审查 draft，并提交规格和测试基线。然后运行 `node scripts/ignite.mjs plan validate <ID> --prepare`，修正 failures。`ready=true` 仅表示开工文档和测试结构完整，不表示行为已经验证。将 Plan 置为 ready、active 后，T2 运行 `pnpm ignite tdd red --plan <IGT-ID> --ac <AC-ID>` 并记录真实目标断言失败；环境错误和脚手架占位失败均不算。提交红灯记录后再实施，测试文件在红灯与绿灯之间保持不变。随后运行 `pnpm ignite check --plan <IGT-ID> --level integration`，完成本 Plan 后将它标记为 done。Release 中所有 Plan 都完成后，运行 `pnpm ignite release verify <release-id> --plan <done-plan-id>`，只对最终组合执行一次生产构建和全量浏览器回归。历史 `verification_contract: 1` Plan 继续按旧流程验证。

## 设计回写

完成后只回写受影响的当前事实到 `docs/designs/`，不把本 Plan 的过程说明复制过去。

## 状态记录

仅记录改变判断的重要结果、原因与未完成影响；按 [接续与纠偏](./README.md#接续与纠偏) 更新判断。修改长期规则时在 [原真源](../standards/ai-agents.md#维护规则) 维护。

<!-- ignite-progress -->
<!-- /ignite-progress -->

## 准出条件

按 [完成条件](./README.md#完成与证据) 回查原始目标核对表，记录实际结果、对应证据、被测版本及缺口。最终报告按 [沟通规则](../../AGENTS.md#沟通) 说明人能得到什么、依据是什么和未完成影响。

每条 REQ 被 AC 覆盖，AC 有匹配层级的真实测试；`tasks` 全部完成，`remaining_work` 清空；`integrated_commit` 可追溯，所需证据属于当前输入与环境；Design 已回写。只有这些条件经验证成立，才把 Plan 标记为 `done`。
