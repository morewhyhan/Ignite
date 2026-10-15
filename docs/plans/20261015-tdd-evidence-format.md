<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1792029176916013864",
  "release": "tdd-evidence-format-v1",
  "status": "active",
  "outcome": "原生 TDD runner 写入的红灯 JSON 证据符合仓库 Prettier 格式，并保留原字段及哈希值。",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [
    {
      "stage": "draft",
      "reviewer": "/root",
      "executor": "history_batch_author",
      "source": "Actual parent /root independently reviewed the scoped draft authored by collaboration sub-agent /root/history_batch_author, including original observed failure, full Plan, Feature, Release and executable native TDD fixture test.",
      "subject_fingerprint": "d317ab89917354d5c88c32ac160f1c372987e249846aa37c9545655112df842c",
      "verdict": "approved",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-10-15T02:16:31.600Z"
    },
    {
      "stage": "draft",
      "reviewer": "/root",
      "executor": "history_batch_author",
      "source": "Actual parent /root independently reviewed the scoped draft authored by collaboration sub-agent /root/history_batch_author, including original observed failure, full Plan, Feature, Release and executable native TDD fixture test. Rechecked explicit goal requirement mapping against unchanged original scope.",
      "subject_fingerprint": "10c1120508d42dc4ed1c0783414a2a0c24456df437c49b63870f677fadf8b6a1",
      "verdict": "approved",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-10-15T02:25:28.734Z"
    }
  ],
  "verification_contract": 2,
  "goals": [
    {
      "text": "TDD red 实际生成的 JSON receipt 已按仓库 Prettier 格式写入，格式检查通过，JSON 字段值与哈希保持不变。",
      "requirements": ["REQ-EXECUTION-057"]
    }
  ],
  "constraints": [
    "只修改主仓库；不修改 TEMP/school-desk。",
    "沿用现有 formatJson，不更改 receipt schema、字段或摘要哈希计算。"
  ],
  "non_goals": ["不修复学生项目中的既有 receipt。"],
  "authorization": {
    "source": "用户授权持续测试、发现问题后做最小修复；主 Agent 已将当前交付范围切换为 TDD receipt 格式修复。"
  },
  "deliverables": [
    "Feature 与 Release 记录新的 TDD receipt 格式承诺及验收。",
    "真实原生 TDD run 生成 receipt，行为测试确认内容符合 formatJson 输出。",
    "scripts/ignite/tdd.mjs 使用已有 formatJson 写入 receipt，并回写当前 Design。"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "954cf3f1948f244c24654622173c1910fa380f97",
  "requirements": ["REQ-EXECUTION-057"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-058",
      "tests": [
        "tests/contracts/tdd-evidence-format.test.ts::[AC-EXECUTION-058] writes formatted evidence from a native TDD run"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/tdd-evidence-format.test.ts::[AC-EXECUTION-058] writes formatted evidence from a native TDD run",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "记录目标并编写真正调用 native TDD 的格式行为测试",
      "phase": "prepare",
      "status": "done",
      "result": "Feature、Plan、Release 与实际原始目标一致；测试通过真实 native TDD red 生成 receipt 并检查其格式；草稿经独立审查并提交基线。",
      "scope": [
        "docs/plans/20261015-tdd-evidence-format.md",
        "docs/plans/releases/tdd-evidence-format-v1.json",
        "docs/features/execution.md",
        "tests/contracts/tdd-evidence-format.test.ts"
      ],
      "depends_on": [],
      "owner": "history_batch_author"
    },
    {
      "id": "T2",
      "title": "运行目标格式断言并记录真实红灯",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-058"],
      "status": "done",
      "result": "原生 red 运行确认已提交测试的目标断言失败，并记录真实红灯。",
      "scope": ["tests/contracts/tdd-evidence-format.test.ts", "docs/others/evidence/tdd/"],
      "depends_on": ["T1"],
      "owner": "history_batch_author"
    },
    {
      "id": "T3",
      "title": "用 formatJson 写入 TDD receipt",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-058"],
      "status": "done",
      "result": "TDD runner 写入仓库格式化后的 JSON，receipt 的数据与 hash 值保持原样。",
      "scope": ["scripts/ignite/tdd.mjs"],
      "depends_on": ["T2"],
      "owner": "history_batch_author"
    },
    {
      "id": "T4",
      "title": "运行 Plan integration 并回写当前设计",
      "phase": "verify",
      "status": "doing",
      "result": "Plan integration 通过；Design 描述实际生成格式；独立 delivery 审查基于最终差异与运行证据。",
      "scope": ["docs/designs/execution.md", "docs/others/evidence/"],
      "depends_on": ["T3"],
      "owner": "history_batch_author"
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
  "owner": "history_batch_author",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "本轮只修改 CLI 的本机证据序列化，不增加业务数据或访问边界。",
    "migration_impact": "none",
    "rollback": "使用 Git 回退本轮 Plan 所属提交。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/execution.md",
    "tests/contracts/tdd-evidence-format.test.ts",
    "scripts/ignite/tdd.mjs",
    "docs/designs/execution.md",
    "docs/others/ignite-status.md",
    "docs/others/evidence/",
    "docs/plans/20261015-tdd-evidence-format.md",
    "docs/plans/releases/tdd-evidence-format-v1.json",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-058",
      "test": "tests/contracts/tdd-evidence-format.test.ts::[AC-EXECUTION-058] writes formatted evidence from a native TDD run",
      "run_id": "tdd-20261015092603-695dd6"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-15"
}
-->

# Ignite 实施计划：tdd-evidence-format

> 复制本文件到 `docs/plans/YYYYMMDD-tdd-evidence-format.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

顶部元数据的 `status` 是唯一状态；正文不复制当前状态。`tasks` 是唯一的子任务状态，使用 `todo`、`doing`、`done`；真正阻塞时由 Plan 的 `status` 与 `blocker` 表达。不要在正文另建任务复选框。下方进度块由工具刷新，勿手改。

## 目标

当用户运行 `pnpm ignite tdd red` 时，新写入的 receipt 符合项目 Prettier 格式。JSON 字段、内容和哈希值保持不变。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                                                                                                         | 本轮目标                                                           | REQ               | AC               | 处理结果 |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------- | ---------------- | -------- |
| “真实探测的最小修复：TDD 生成记录改为使用已有 `formatJson`，生成的 JSON 过格式检查且保持内容和 hash 不变。”（主 Agent 在本轮授权范围内转交） | 新 native TDD receipt 符合仓库 Prettier 配置，字段值和摘要哈希不变 | REQ-EXECUTION-057 | AC-EXECUTION-058 | 纳入     |

进入 `ready` 前回看原始请求，确认目标、约束、必须保留的能力都已列入；不把 AI 自己改写后的 goals 当作原始输入。此表是语义审查记录，不能伪称机器已证明无遗漏。

## 整体判断与推进顺序

`run-20261015013656-61bad1` 在 `TEMP/school-desk` 的 integration 中，治理、文档、类型检查、工具类型检查和 lint 通过；`format:check` 因 7 个 TDD receipt 不符合 Prettier 而失败。源代码在 [tdd.mjs](../../scripts/ignite/tdd.mjs) 直接调用 `JSON.stringify`；[`core.mjs`](../../scripts/ignite/core.mjs) 已提供 `formatJson`。本轮只替换写入调用，并用真实 native TDD run 生成 receipt 后检查格式与字段。学生副本只提供失败证据，不写入。

## 非目标

本轮不修改 `TEMP/school-desk` 中既有 receipt，也不改变 receipt schema、字段和摘要哈希算法。

## 变更类型

本轮为基础设施存量改动。它只改变新 receipt 的空白和数组排版，旧 JSON 仍可解析，回滚方式是撤销本轮提交。没有数据库迁移或共享写入。

## 输入规格

本轮依据 [执行工具 Feature](../features/execution.md#业务规则)、[执行设计](../designs/execution.md)、[TDD runner](../../scripts/ignite/tdd.mjs) 和 [测试标准](../standards/testing.md#测试先行)。

## 已关闭问题

无需额外产品决定。Feature、Plan 和 Release 都把原始格式修复目标映射到 REQ-EXECUTION-057 与 AC-EXECUTION-058。

## 测试与验收设计

[`tests/contracts/tdd-evidence-format.test.ts`](../../tests/contracts/tdd-evidence-format.test.ts) 创建隔离 Git fixture，调用原生 `tdd red` 实际写入 receipt，再断言生成字节等于仓库 `formatJson` 对同一 JSON 值的输出。该断言能捕获 runner 继续使用未格式化序列化的回归；同一运行也确认 runner 仍生成可解析的红灯记录。Plan integration 的 `format:check` 再检查完整主仓输入。

[`tests/contracts/tdd-evidence-format.test.ts`](../../tests/contracts/tdd-evidence-format.test.ts) 创建隔离 Git fixture，调用原生 `tdd red` 实际写入 receipt，再比较生成字节与 `formatJson` 输出，并对该文件运行 Prettier `--check`。该测试能识别继续用普通 `JSON.stringify` 写入的回归；哈希字段检查确认摘要仍有效。AC-EXECUTION-058 的层级为 unit。

## 实现任务

本轮只有一次序列化调用替换，保留单一实施任务。测试、格式化实现和 Design 属于同一 AC 的准备、红灯、实现及验收步骤。

TDD runner 只有一处 receipt 写入，本轮保留单个实施任务。

## 验收方式

按 Plan 规则完成独立 draft review 后，运行 `node scripts/ignite.mjs plan validate IGT-1792029176916013864 --prepare`。提交规格与测试基线后，启动 T2 并运行 `pnpm ignite tdd red --plan IGT-1792029176916013864 --ac AC-EXECUTION-058`。红灯通过后提交 receipt，再替换唯一写入调用。提交 Design 后运行 `pnpm ignite check --plan IGT-1792029176916013864 --level integration`，并按 Release 规则验证最终版本。

## 设计回写

完成后更新 [`docs/designs/execution.md`](../../docs/designs/execution.md)，说明新生成的 TDD receipt 使用 `formatJson` 输出。旧 receipt 的内容解释不变。

## 状态记录

准备阶段真实运行过一次测试，native fixture `tdd red` 成功写入 receipt，行为断言因生成内容不符合 `formatJson` 输出而失败。这只是准备期排查；正式红灯仍由 T2 的原生入口记录。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 记录目标并编写真正调用 native TDD 的格式行为测试 · done
- [x] T2 · 运行目标格式断言并记录真实红灯 · done
- [x] T3 · 用 formatJson 写入 TDD receipt · done
- [ ] T4 · 运行 Plan integration 并回写当前设计 · doing

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

按 [完成条件](./README.md#完成与证据) 回查原始目标核对表，记录实际结果、对应证据、被测版本及缺口。最终报告按 [沟通规则](../../AGENTS.md#沟通) 说明人能得到什么、依据是什么和未完成影响。

每条 REQ 被 AC 覆盖，AC 有匹配层级的真实测试；`tasks` 全部完成，`remaining_work` 清空；`integrated_commit` 可追溯，所需证据属于当前输入与环境；Design 已回写。只有这些条件经验证成立，才把 Plan 标记为 `done`。
