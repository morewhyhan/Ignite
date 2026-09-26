<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790459700497465269",
  "release": "release-artifacts-v1",
  "status": "active",
  "outcome": "脚手架与 Release 验收稳定生成可直接通过格式门禁的文件，覆盖测试适应完整 Release 范围",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "脚手架与验收命令生成的 Plan/Release 文件直接符合仓库格式",
      "requirements": [
        "REQ-EXECUTION-012"
      ]
    },
    {
      "text": "Release 覆盖测试随 Release 的完整 Plan 集合变化仍准确",
      "requirements": [
        "REQ-EXECUTION-013"
      ]
    }
  ],
  "constraints": [
    "不改变业务功能和 Release 覆盖语义",
    "格式化失败必须显式报错，不能伪装为成功"
  ],
  "non_goals": [
    "不改写已完成 Release 的历史证据",
    "不要求用户手工运行格式化来修复 CLI 生成结果"
  ],
  "authorization": {
    "source": "用户要求一次性审计并修复会导致 AI 开发流程偏离、卡住或验收失败的问题；全量验收实际发现脚手架文件格式不合规和 Release 覆盖测试与范围脱节"
  },
  "deliverables": [
    "scripts/ignite/core.mjs",
    "scripts/ignite/state.mjs",
    "scripts/create-change.mjs",
    "scripts/create-module.mjs",
    "tests/contracts/execution-reliability.test.ts",
    "tests/contracts/execution-trust.test.ts"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "ce61ed04e0bf701f06a08b100ae0ac3dc0326c6c",
  "requirements": [
    "REQ-EXECUTION-012",
    "REQ-EXECUTION-013"
  ],
  "acceptance": [
    {
      "id": "AC-EXECUTION-012",
      "tests": [
        "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-012] scaffolds an existing-feature change as an incomplete draft",
        "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-012] formats new-module Plan and Release artifacts"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-012] scaffolds an existing-feature change as an incomplete draft",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-012] formats new-module Plan and Release artifacts",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-013",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-002] [AC-EXECUTION-013] blocks active Release scope when a Feature acceptance is unaccounted for"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-002] [AC-EXECUTION-013] blocks active Release scope when a Feature acceptance is unaccounted for",
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
      "title": "确认所有 Plan 与 Release JSON 写入路径及格式失败行为",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "为格式化产物和多 Plan 覆盖测试记录红灯",
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "统一脚手架、Release 回写与覆盖测试的正确行为",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "完成 Plan 验收并单独验证 Release",
      "status": "todo"
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
    "scripts/ignite/core.mjs",
    "scripts/ignite/state.mjs",
    "scripts/create-change.mjs",
    "scripts/create-module.mjs",
    "tests/contracts/execution-reliability.test.ts",
    "tests/contracts/execution-trust.test.ts",
    "docs/features/execution.md",
    "docs/plans/20260927-release-artifacts.md",
    "docs/plans/releases/release-artifacts-v1.json",
    "docs/others/evidence/tdd/",
    "docs/others/ignite-status.md"
  ],
  "tdd_evidence": [],
  "required_evidence": [
    "check-integration"
  ],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-09-26"
}
-->

# Ignite 实施计划：release-artifacts

> 复制本文件到 `docs/plans/YYYYMMDD-release-artifacts.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

顶部元数据的 `status` 是唯一状态；正文不复制当前状态。`tasks` 是唯一的子任务状态，使用 `todo`、`doing`、`done`；真正阻塞时由 Plan 的 `status` 与 `blocker` 表达。不要在正文另建任务复选框。下方进度块由工具刷新，勿手改。

## 目标

脚手架创建的 Plan/Release 和 Release 验收写回的证据文件直接符合仓库格式；扩展 Release 范围后，覆盖测试仍按完整实际范围验收。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                    | 本轮目标                                               | REQ               | AC               | 处理结果   |
| ------------------------------------------------------- | ------------------------------------------------------ | ----------------- | ---------------- | ---------- |
| 全量验收发现新建的 Plan/Release 无法通过格式检查        | 所有 CLI 生成及回写文件直接符合格式门禁                | REQ-EXECUTION-012 | AC-EXECUTION-012 | 修复并验证 |
| 全量验收发现新增 Release Plan 后覆盖单测仍只加载旧 Plan | 测试覆盖真实 Release 中的全部 Plan，新增合法范围不误报 | REQ-EXECUTION-013 | AC-EXECUTION-013 | 修复并验证 |

进入 `ready` 前回看原始请求，确认目标、约束、必须保留的能力都已列入；不把 AI 自己改写后的 goals 当作原始输入。此表是语义审查记录，不能伪称机器已证明无遗漏。

## 非目标

把本轮不处理的范围写入顶部 `non_goals`，这里仅解释容易误解的边界。

## 变更类型

- 类型：`[存量改动]`
- 影响：CLI 生成/回写的 Plan 与 Release 工件及覆盖回归测试；不涉及 API、数据库、认证或业务数据迁移。
- 回滚：回滚本 Plan 代码与文档提交；不触及业务数据。

涉及 `prisma/`、认证或业务 API 的 Plan，还要填写顶部 `data_contract`：资源属于谁、访问控制依据、迁移影响和恢复方式。删除或不可逆转换必须记录用户授权。简单决定写在这里即可；只有存在需要长期解释的架构取舍时才新增 ADR。

## 输入规格

只引用本轮相关的 Feature、Standards、Design、代码与测试。跨 Plan 依赖在 `depends_on` 与 `dependency_contracts` 中写清接口契约；交接成果写入 `handoff.interfaces`、`migrations`、`tests` 和 `remaining`。

## 已关闭问题

顶部 `open_questions` 记录未决问题，`authorization.source` 记录实施授权来源。不要把空问题列表当作目标完整性证明。

## 测试与验收设计

AC-EXECUTION-012 在隔离 Git 夹具中运行实际存量改动脚手架，要求生成的 Plan 与 Release 文件通过项目 Prettier。AC-EXECUTION-013 使用当前 Release 和其全部 Plan 验证完整范围通过，并在移除一条验收映射后确认检查器仍精确报告缺口。

## 实现任务

分解可交付工作至顶部 `tasks`，每项有稳定 ID、标题和状态。`remaining_work` 仅放尚未能转成明确任务的验收缺口，不重复列任务。

## 验收方式

提交 Feature、Plan 和真实行为测试后，对两条 AC 分别运行 `pnpm ignite tdd red --plan IGT-1790459700497465269 --ac <AC-ID>` 并提交红灯证据；实现后运行 `pnpm ignite check --plan IGT-1790459700497465269 --level auto`。本 Plan 完成后，`release-artifacts-v1` 的 Release 验收单独运行生产构建和 E2E。

## 设计回写

不改变系统设计事实；实现后确保长期行为要求仍由 Feature 和执行规则表达。

## 状态记录

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 确认所有 Plan 与 Release JSON 写入路径及格式失败行为 · done
- [ ] T2 · 为格式化产物和多 Plan 覆盖测试记录红灯 · doing
- [ ] T3 · 统一脚手架、Release 回写与覆盖测试的正确行为 · todo
- [ ] T4 · 完成 Plan 验收并单独验证 Release · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

两条 AC 的真实测试通过；新建的存量 Plan/Release 文件可通过格式门禁；Release 覆盖测试完整映射全部 Plan 并能检测缺漏；`tasks` 全部完成，`remaining_work` 清空；Plan 集成证据对应当前输入。Release 生产构建和 E2E 在全部计划完成后单独执行。
