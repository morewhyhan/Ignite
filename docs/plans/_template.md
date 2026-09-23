<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-000",
  "release": "release-id",
  "status": "draft",
  "outcome": "完成后谁能多做哪件事",
  "contract_version": 2,
  "execution_contract": 1,
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
  "tasks": [{ "id": "T1", "title": "确认规格与验收", "status": "todo" }],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": { "interfaces": [], "migrations": [], "tests": [], "remaining": [] },
  "owner": "assigned-worker",
  "risk": "feature",
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
    "docs/others/test-cases/"
  ],
  "required_evidence": ["check-integration", "check-release"],
  "evidence": [],
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

## 非目标

把本轮不处理的范围写入顶部 `non_goals`，这里仅解释容易误解的边界。

## 变更类型

顶部 `change_type` 只选 `[新增模块]` 或 `[存量改动]`；基础设施调整属于存量改动。说明兼容性、数据迁移和回滚策略，并把共享文件写入 `shared_files`，声明 `path`、`owner` 与 `mode`（`exclusive` 或 `integrator`）。

## 输入规格

只引用本轮相关的 Feature、Standards、Design、代码与测试。跨 Plan 依赖在 `depends_on` 与 `dependency_contracts` 中写清接口契约；交接成果写入 `handoff.interfaces`、`migrations`、`tests` 和 `remaining`。

## 已关闭问题

顶部 `open_questions` 记录未决问题，`authorization.source` 记录实施授权来源。不要把空问题列表当作目标完整性证明。

## 测试与验收设计

每个 AC 的 `tests` 与 `checks[].test` 必须引用同一带 `[AC-*]` 标记的可执行用例。`required_layers` 和 `verification_requirements` 表示必须满足的验证层级：纯逻辑用 `unit`；UI 交互补 `browser`；持久化补 `database`；真实第三方依赖补 `external`。本模板的 `unit` 是填写示例；`create:module` 因生成 UI Screen 会同时准备 `unit` 和 `browser`。所有草稿都需按实际目标补齐行为断言。

## 实现任务

分解可交付工作至顶部 `tasks`，每项有稳定 ID、标题和状态。`remaining_work` 仅放尚未能转成明确任务的验收缺口，不重复列任务。

## 验收方式

先确认目标测试因缺少目标行为而失败，再实现并运行 `pnpm ignite check --plan <IGT-ID> --level integration`；集成后进入 `verifying`，运行 `--level release`。按实际层级补齐证据，不能拿类型检查代替行为测试。

## 设计回写

完成后只回写受影响的当前事实到 `docs/designs/`，不把本 Plan 的过程说明复制过去。

## 状态记录

<!-- ignite-progress -->
<!-- /ignite-progress -->

## 准出条件

每条 REQ 被 AC 覆盖，AC 有匹配层级的真实测试；`tasks` 全部完成，`remaining_work` 清空；`integrated_commit` 可追溯，所需证据属于当前输入与环境；Design 已回写。只有这些条件经验证成立，才把 Plan 标记为 `done`。
