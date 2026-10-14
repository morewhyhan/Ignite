<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1792007450670818648",
  "release": "prepare-test-ownership-v1",
  "status": "active",
  "outcome": "新建 Plan 在 prepare 阶段编写并声明真实测试，red 阶段只运行和记录红灯",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [
    {
      "reviewer": "/root",
      "executor": "prepare_contract_fix",
      "source": "Codex collaboration parent agent /root acting as an independent read-only reviewer; /root did not edit the reviewed Plan, Feature, tests, or implementation",
      "stage": "draft",
      "verdict": "approved",
      "subject_fingerprint": "08ab0aec15589b3ed301d0ac7cc4d0a74c429fca47a06cff56104a3bf7d41a98",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-10-14T20:15:39.548Z"
    }
  ],
  "verification_contract": 2,
  "goals": [
    {
      "text": "让新增模块与存量改动的原生任务归属符合准备和红灯职责",
      "requirements": ["REQ-EXECUTION-056"]
    }
  ],
  "constraints": [
    "保持现有 task_contract、ready 门禁和红灯证明要求。",
    "测试基线须在进入 ready 和 red 前提交。"
  ],
  "non_goals": ["不改准备门禁、任务调度器或 Release 完成规则。"],
  "authorization": {
    "source": "用户授权修正测试中发现的任务归属矛盾"
  },
  "deliverables": [
    "更新两个脚手架和 Plan 模板，使真实断言归 prepare T1，red T2 只运行并记录。",
    "更新 Feature、Plan 规则和 Design 事实。"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "fd3f519d4e15c3d910ae65a4a5e624e74af61f4e",
  "requirements": ["REQ-EXECUTION-056"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-057",
      "tests": [
        "tests/contracts/native-execution.test.ts::[AC-EXECUTION-057]",
        "tests/contracts/preparation-contract.test.ts::[AC-EXECUTION-057]"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/native-execution.test.ts::[AC-EXECUTION-057]",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/preparation-contract.test.ts::[AC-EXECUTION-057]",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "确认目标并编写真实测试基线",
      "phase": "prepare",
      "status": "done",
      "result": "原始目标、Feature、Release、真实行为断言和测试路径均已记录，测试及规格基线已提交。",
      "scope": [
        "docs/plans/20261015-prepare-test-ownership.md",
        "docs/plans/releases/prepare-test-ownership-v1.json",
        "docs/features/execution.md",
        "tests/contracts/native-execution.test.ts",
        "tests/contracts/preparation-contract.test.ts"
      ],
      "depends_on": [],
      "owner": "prepare_contract_fix"
    },
    {
      "id": "T2",
      "title": "运行真实断言并记录红灯",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-057"],
      "status": "done",
      "result": "原生 red 运行确认断言针对任务归属行为失败，并记录本 AC 的真实红灯。",
      "scope": [
        "tests/contracts/native-execution.test.ts",
        "tests/contracts/preparation-contract.test.ts",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": ["T1"],
      "owner": "prepare_contract_fix"
    },
    {
      "id": "T3",
      "title": "修正规则、模板和脚手架的任务归属",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-057"],
      "status": "done",
      "result": "两个脚手架与 Plan 模板都把测试编写归入 prepare T1，red T2 仅记录红灯。",
      "scope": [
        "scripts/create-change.mjs",
        "scripts/create-module.mjs",
        "docs/plans/README.md",
        "docs/plans/_template.md"
      ],
      "depends_on": ["T2"],
      "owner": "prepare_contract_fix"
    },
    {
      "id": "T4",
      "title": "验证原生流程并回写当前设计",
      "phase": "verify",
      "status": "doing",
      "result": "Plan integration 和独立 delivery 审查均通过，Design 记录实际行为。",
      "scope": ["docs/designs/execution.md", "docs/others/evidence/"],
      "depends_on": ["T3"],
      "owner": "prepare_contract_fix"
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
  "owner": "prepare_contract_fix",
  "risk": "feature",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "本次只修改模板工具和文档，不新增业务数据。",
    "migration_impact": "none",
    "rollback": "使用 Git 回退本轮文件修改。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/execution.md",
    "tests/contracts/native-execution.test.ts",
    "tests/contracts/preparation-contract.test.ts",
    "scripts/create-change.mjs",
    "scripts/create-module.mjs",
    "docs/plans/README.md",
    "docs/plans/_template.md",
    "docs/designs/execution.md",
    "docs/others/evidence/",
    "docs/plans/20261015-prepare-test-ownership.md",
    "docs/plans/releases/prepare-test-ownership-v1.json",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-057",
      "test": "tests/contracts/native-execution.test.ts::[AC-EXECUTION-057]",
      "run_id": "tdd-20261014202740-a24d3c"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-14"
}
-->

# Ignite 实施计划：prepare-test-ownership

> 复制本文件到 `docs/plans/YYYYMMDD-prepare-test-ownership.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

顶部元数据的 `status` 是唯一状态；正文不复制当前状态。`tasks` 是唯一的子任务状态，使用 `todo`、`doing`、`done`；真正阻塞时由 Plan 的 `status` 与 `blocker` 表达。不要在正文另建任务复选框。下方进度块由工具刷新，勿手改。

## 目标

新建的 Plan 在 prepare T1 编写真实行为测试并声明测试路径。T2 只运行原生 red 并记录证据。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                                                                                                        | 本轮目标                                                                         | REQ               | AC               | 处理结果 |
| ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------- | ---------------- | -------- |
| “把真实测试编写归 prepare T1（scope含真实测试路径），T2仅运行/记录红灯；提交规格/测试基线安排在 ready/red 前，不要求 ready 前已有red证据。” | 两种脚手架和模板生成的阶段职责一致，ready 只要求测试已写好，不要求已有红灯证据。 | REQ-EXECUTION-056 | AC-EXECUTION-057 | 纳入     |

进入 `ready` 前回看原始请求，确认目标、约束、必须保留的能力都已列入；不把 AI 自己改写后的 goals 当作原始输入。此表是语义审查记录，不能伪称机器已证明无遗漏。

## 整体判断与推进顺序

按 [推进规则](./README.md#整体判断与推进顺序) 说明以下判断，引用原始目标映射及已有 Design/代码/证据，不再复制目标或任务状态：

- 整体链路与事实：脚手架生成 Feature/Plan/Release 与占位测试；`preparation.mjs` 再检查测试存在且不是占位失败。当前生成器将测试编写归入 red T2，因此生成计划的阶段与 ready 条件冲突。
- 当前主要问题：生成器把“编写真实断言”写在 red T2，准备检查却要求 T1 完成时测试已存在且不再是占位失败。ready 已允许 `tdd_evidence` 为空，本轮保留该门禁行为，不改检查器或 Release 规则。
- 推进与尺度：生成器契约测试应在基线版本发现 T1 未声明测试路径，再验证模块和存量改动两种草稿。修复后用相同原生断言转绿。准备契约用例守住 ready 不要求红灯证据的既有行为。
- 纠偏与停止：若测试失败来自生成器输出，就调整两个脚手架与模板；若空红灯证据导致准备检查失败，先确认检查器版本和 Plan 输入，不扩大本轮为门禁重写。完成原生 red、Plan integration、Plan done 后的 Release verify 和独立审查后停止。

简单任务可以用几句话回答；当前判断是可更新的依据，不是机器证明的正确性。接续会话先回看此段，出现重要新证据时补充原因，不追加逐工具日志。

## 非目标

本轮只改变新生成任务的职责和对应说明。准备门禁、任务调度、历史 Plan、Release 循环和脚手架 T4 的验收职责都不变。

## 变更类型

本轮是存量改动，只影响新脚手架和空白 Plan 的执行顺序，不迁移既有 Plan。若修复不合适，Git 可回退改动文件；不触及共享运行数据或数据库。

涉及 `prisma/`、认证或业务 API 的 Plan，还要填写顶部 `data_contract`。`access_scope` 使用 `per-user`、`per-organization`、`shared`、`public` 或 `not-applicable`；`migration_impact` 使用 `none`、`additive`、`backfill` 或 `destructive`，具体理由写到相应说明字段。这里记录资源属于谁、访问控制依据、迁移影响和恢复方式。删除或不可逆转换必须记录用户授权。简单决定写在这里即可；只有存在需要长期解释的架构取舍时才新增 ADR。

## 输入规格

相关真源为 [执行工具 Feature](../features/execution.md)、[Plan 规则](./README.md)、[当前执行设计](../designs/execution.md)、`scripts/create-change.mjs`、`scripts/create-module.mjs`、`scripts/ignite/preparation.mjs` 和两个 Plan 生成契约测试。本轮没有跨 Plan 依赖或共享写入。

## 已关闭问题

无待定产品决定。用户明确授权按最少改动修复测试发现的问题。

## 测试与验收设计

`native-execution.test.ts` 运行两种生成器，断言 prepare 任务包含 Feature 对应的实际测试路径，red 任务负责草稿声明的 AC 且具有红灯证据路径。它能抓住复制错误的阶段归属。测试路径也保留在 red scope，供 `tdd restart` 修复真实断言时继续使用；red task 的交付仍是运行并记录证据。`preparation-contract.test.ts` 另外断言空 `tdd_evidence` 的完整测试基线仍可通过 `--prepare`，守住 ready 不要求红灯证据的既有行为。两项都属于 unit 层。

每个 AC 的 `tests` 与 `checks[].test` 必须引用同一带 `[AC-*]` 标记的可执行用例。`required_layers` 和 `verification_requirements` 表示必须满足的验证层级：纯逻辑用 `unit`；UI 交互补 `browser`；持久化补 `database`；真实第三方依赖补 `external`。`verification_contract: 2` 的 Plan 在 integration 中执行自己映射的所有行为层；Release 再对已完成的 Plan 组合执行生产构建和全量浏览器回归。进入 ready 前，脚手架占位失败测试必须换成真实用户行为断言。

## 实现任务

从可验收结果拆分顶部 `tasks`，不要按目录数量或工具调用拆任务。把一个任务拆成多个实施切片前，确认每个切片都有可观察结果、独立写入范围、明确负责人和已知接口。没有相互依赖、写入范围不重叠且接口已约定的实施任务，可以并行派发；多个切片可以共同实现同一 AC，但都要等待该 AC 的有效红灯。范围重叠、负责人相同或接口未定时，先协调写入边界和接口；共享文件仍由唯一集成人写入。一个完整 CRUD 行为若接口尚未稳定，可以保留为一个纵向切片。

准备检查的 `planning_diagnostics` 会提示多范围实施任务的拆分复查，以及候选任务间的依赖、验收、范围和接口条件。诊断只提供建议，不阻止可合法执行的单任务 Plan，也不表示 Agent 已派发。`remaining_work` 仅放尚未能转成明确任务的验收缺口，不重复列任务。

## 验收方式

prepare T1 编写真实行为测试后，先独立审查 draft，并提交规格和测试基线。然后运行 `node scripts/ignite.mjs plan validate <ID> --prepare`，修正 failures。`ready=true` 仅表示开工文档和测试结构完整，不表示行为已经验证。将 Plan 置为 ready 后，T2 运行 `pnpm ignite tdd red --plan <IGT-ID> --ac <AC-ID>` 并记录真实目标断言失败；环境错误和占位失败均不算。提交红灯记录后再实施，测试文件在红灯与绿灯之间保持不变。随后运行 `pnpm ignite check --plan <IGT-ID> --level integration`，完成本 Plan 并通过独立 delivery 审查后将它标记为 done。Plan done 后，运行 `pnpm ignite release verify <release-id> --plan <done-plan-id>`，只对最终组合执行一次生产构建和全量浏览器回归。历史 `verification_contract: 1` Plan 继续按旧流程验证。

## 设计回写

完成后回写 [执行设计](../designs/execution.md)，说明两个脚手架的测试编写与红灯记录职责。

## 状态记录

仅记录改变判断的重要结果、原因与未完成影响；按 [接续与纠偏](./README.md#接续与纠偏) 更新判断。修改长期规则时在 [原真源](../standards/ai-agents.md#维护规则) 维护。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 确认目标并编写真实测试基线 · done
- [x] T2 · 运行真实断言并记录红灯 · done
- [x] T3 · 修正规则、模板和脚手架的任务归属 · done
- [ ] T4 · 验证原生流程并回写当前设计 · doing

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

按 [完成条件](./README.md#完成与证据) 回查原始目标核对表，记录实际结果、对应证据、被测版本及缺口。最终报告按 [沟通规则](../../AGENTS.md#沟通) 说明人能得到什么、依据是什么和未完成影响。

每条 REQ 被 AC 覆盖，AC 有匹配层级的真实测试；`tasks` 全部完成，`remaining_work` 清空；`integrated_commit` 可追溯，所需证据属于当前输入与环境；Design 已回写。只有这些条件经验证成立，才把 Plan 标记为 `done`。
