<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790466964730388559",
  "release": "workflow-entry-reliability-v1",
  "status": "active",
  "outcome": "模板副本采用与首次任务启动可恢复、可理解且不会产生无效上下文",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "新历史采用后，历史文档引用仍可用且文档门禁通过",
      "requirements": ["REQ-EXECUTION-014"]
    },
    {
      "text": "CLI 帮助可发现，初始状态读取保持精简",
      "requirements": ["REQ-EXECUTION-015", "REQ-EXECUTION-016"]
    },
    {
      "text": "脚手架提交失败不会留下部分产物或覆盖旧 Release",
      "requirements": ["REQ-EXECUTION-017"]
    },
    {
      "text": "占位失败检测仅针对目标 AC，避免同文件误报",
      "requirements": ["REQ-EXECUTION-018"]
    },
    {
      "text": "Git 改动范围检查保留 Unicode 路径原文",
      "requirements": ["REQ-EXECUTION-019"]
    }
  ],
  "constraints": [
    "完整 Git 克隆与浅克隆的既有采用边界保持不变",
    "保留所有继承历史内容，只修复有效文档链接",
    "脚手架草稿仍需 AI 补齐，不能自动视作功能完成"
  ],
  "non_goals": [
    "不改业务功能、数据库或 API",
    "不让 status 默认打印全部机器上下文",
    "不承诺未知 AI 工具无需桥接即可自动读取规则"
  ],
  "authorization": {
    "source": "用户授权综合审查并整改当前项目中妨碍 AI 开发流程或偏离所给工程方法的问题。独立模板副本实测确认历史 Plan 归档后文档门禁失败；另有 Unicode 路径被 Git 默认转义后造成 write_scope 误判，连同 CLI 帮助、初始状态输出、脚手架失败回滚和占位扫描误拦均属于执行可靠性问题。"
  },
  "deliverables": [
    "历史归档后的可用文档引用",
    "可发现且不误执行的 Ignite CLI 帮助",
    "精简的首次状态读取指引",
    "可回滚的模块与存量改动脚手架写入",
    "AI开发执行流程审计清单.md"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "8a4b29a56ccbe0b2e967fe9a0f7f44600fbaef27",
  "requirements": [
    "REQ-EXECUTION-014",
    "REQ-EXECUTION-015",
    "REQ-EXECUTION-016",
    "REQ-EXECUTION-017",
    "REQ-EXECUTION-018",
    "REQ-EXECUTION-019"
  ],
  "acceptance": [
    {
      "id": "AC-EXECUTION-014",
      "tests": [
        "tests/contracts/workflow-entry.test.ts::[AC-EXECUTION-014] rewrites links to archived Plans so adopted docs remain valid"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/workflow-entry.test.ts::[AC-EXECUTION-014] rewrites links to archived Plans so adopted docs remain valid",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-015",
      "tests": [
        "tests/contracts/ignite-cli.test.ts::[AC-EXECUTION-015] prints help without executing the requested command"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/ignite-cli.test.ts::[AC-EXECUTION-015] prints help without executing the requested command",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-016",
      "tests": [
        "tests/contracts/workflow-entry.test.ts::[AC-EXECUTION-016] keeps first-entry status guidance concise"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/workflow-entry.test.ts::[AC-EXECUTION-016] keeps first-entry status guidance concise",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-017",
      "tests": [
        "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-017] rolls back a scaffold when final file promotion fails"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-017] rolls back a scaffold when final file promotion fails",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-018",
      "tests": [
        "tests/contracts/source-analysis.test.ts::[AC-EXECUTION-018] scopes scaffold detection to the matching active test"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/source-analysis.test.ts::[AC-EXECUTION-018] scopes scaffold detection to the matching active test",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-019",
      "tests": [
        "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-019] preserves Unicode paths when validating Plan write scope"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-019] preserves Unicode paths when validating Plan write scope",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "核实模板采用、CLI 发现和脚手架失败行为",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "为六项缺口补规格与红灯验收",
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "修复采用引用、CLI 帮助、上下文输出、脚手架回滚、AC 误拦和 Unicode 路径误判",
      "status": "doing"
    },
    {
      "id": "T4",
      "title": "验证隔离副本的采用/新模块/存量修改/失败恢复并交付审计清单",
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
  "owner": "root",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "仅调整执行工具、文档链接与文档指引，不访问或修改业务数据。",
    "migration_impact": "none",
    "rollback": "回滚本 Plan 所属代码与文档提交；不涉及数据迁移。",
    "destructive_authorization": null
  },
  "write_scope": [
    "AGENTS.md",
    "README.md",
    "docs/standards/workflow.md",
    "docs/features/execution.md",
    "docs/others/test-cases/execution.md",
    "docs/designs/execution.md",
    "docs/plans/20260927-workflow-entry-reliability.md",
    "docs/plans/releases/workflow-entry-reliability-v1.json",
    "docs/others/evidence/tdd/",
    "docs/others/evidence/runs/",
    "docs/others/ignite-status.md",
    "scripts/ignite/adoption.mjs",
    "scripts/ignite/cli.mjs",
    "scripts/ignite/scaffold-writer.mjs",
    "scripts/ignite/source-analysis.mjs",
    "scripts/ignite/core.mjs",
    "scripts/ignite/state.mjs",
    "scripts/ignite/tdd.mjs",
    "scripts/create-module.mjs",
    "scripts/create-change.mjs",
    "tests/contracts/template-runtime.test.ts",
    "tests/contracts/workflow-entry.test.ts",
    "tests/contracts/ignite-cli.test.ts",
    "tests/contracts/execution-reliability.test.ts",
    "tests/contracts/source-analysis.test.ts",
    "AI开发执行流程审计清单.md"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-014",
      "test": "tests/contracts/workflow-entry.test.ts::[AC-EXECUTION-014] rewrites links to archived Plans so adopted docs remain valid",
      "run_id": "tdd-20260927005659-d2366a"
    },
    {
      "acceptance_id": "AC-EXECUTION-015",
      "test": "tests/contracts/ignite-cli.test.ts::[AC-EXECUTION-015] prints help without executing the requested command",
      "run_id": "tdd-20260927005750-da0f67"
    },
    {
      "acceptance_id": "AC-EXECUTION-016",
      "test": "tests/contracts/workflow-entry.test.ts::[AC-EXECUTION-016] keeps first-entry status guidance concise",
      "run_id": "tdd-20260927010345-77fad6"
    },
    {
      "acceptance_id": "AC-EXECUTION-017",
      "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-017] rolls back a scaffold when final file promotion fails",
      "run_id": "tdd-20260927010428-90a5b6"
    },
    {
      "acceptance_id": "AC-EXECUTION-018",
      "test": "tests/contracts/source-analysis.test.ts::[AC-EXECUTION-018] scopes scaffold detection to the matching active test",
      "run_id": "tdd-20260927020135-d1fb96"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-09-27"
}
-->

# Ignite 实施计划：workflow-entry-reliability

> 复制本文件到 `docs/plans/YYYYMMDD-workflow-entry-reliability.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

顶部元数据的 `status` 是唯一状态；正文不复制当前状态。`tasks` 是唯一的子任务状态，使用 `todo`、`doing`、`done`；真正阻塞时由 Plan 的 `status` 与 `blocker` 表达。不要在正文另建任务复选框。下方进度块由工具刷新，勿手改。

## 目标

用一句用户可观察的结果描述本轮成果。先写清原始目标，再将其拆成 `goals`、REQ、AC 和测试。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                                                                                       | 本轮目标                                                                                                                                         | REQ                   | AC                   | 处理结果                                                                             |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| 用户要求综合审查开发全流程，列出真实问题、修复办法、验收标准，并在最终版本推送；孤立新历史副本归档后 `docs:check` 实测失败 | 修复模板采用与首次任务启动中的引用、命令发现、上下文成本和脚手架失败回滚问题，并对采用、上下文、执行、验收、恢复、交付、过程成本七域形成审计清单 | REQ-EXECUTION-014–017 | AC-EXECUTION-014–017 | 保留；报告已确认的问题、证据、修复和边界；不改业务功能、产品方向或用户确定的架构边界 |
| 后续检查发现共享测试文件中的普通样例文本会触发全文件占位扫描，阻止合法 Plan 转入 ready                                     | 将占位检测缩小到与 AC 对应的活动测试体                                                                                                           | REQ-EXECUTION-018     | AC-EXECUTION-018     | 纳入执行门禁准确性修复，不放宽真实占位失败检查                                       |
| 集成 dry-run 中，中文审计清单路径在 Git diff 中以八进制转义显示，导致计划范围校验误判越界                                  | 让 Git 路径采集保留 Unicode 原文                                                                                                                 | REQ-EXECUTION-019     | AC-EXECUTION-019     | 纳入路径准确性修复；集成证据仍待完成                                                 |

### 本轮问题与验收结果

| 问题                                       | 触发与影响                                                                     | 修复方式                                                                           | 结束标准                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 采用新 Git 历史时归档 Plan 后未更新引用    | `adopt-history --apply` 后 `docs:check` 报已归档 Plan 的本地链接损坏           | 找出指向被归档文件的存续 Markdown 链接并重写至归档副本；失败时恢复文档与已移动记录 | 孤立模板副本归档后链接目标存在、`pnpm docs:check` 通过，重复执行可安全识别已采用 |
| CLI 缺少可发现的帮助入口                   | `pnpm ignite --help` 返回错误，`status --help` 会执行状态命令                  | 增加根、命令与子命令帮助解析；帮助只打印用法并成功退出                             | 根帮助和代表性子命令帮助退出码为 0，不触发命令副作用，命令清单完整               |
| 初始规则要求打印完整 JSON 状态             | 新 AI 按入口指南会得到远超摘要所需的机器上下文                                 | 默认指引使用 `pnpm ignite status`，仅机器消费时显式使用 JSON                       | AGENTS、工作流与 README 一致，并有回归测试防止退回 JSON 默认                     |
| 脚手架逐个写文件，后续写入失败留下部分文件 | 在 Plan/Release 文件集提交过程中出错时，模板可能形成残缺草稿或覆盖已有 Release | 共享事务写入器先暂存全部内容，再提交；异常时恢复已替换文件并清理本轮新文件         | 注入末文件提交错误后无部分产物、原 Release 字节不变，命令报错且可重试            |

| 占位检测扫描整个文件 | 与目标 AC 无关的字符串样例会使 Plan 状态转换误报失败 | 解析活动测试注册并只检查匹配 AC 的测试体 | 目标 AC 有真实断言可进入 ready；对应测试体内真实占位失败仍被拒绝 |
| Git 转义 Unicode 路径导致写入范围误判 | 中文文件名在 diff 输出中变成八进制转义串，实际位于范围内的文档仍被判越界 | 收集 Git 文本路径时关闭 `core.quotepath` 转义，保留原始 Unicode 路径 | AC-EXECUTION-019 验证中文路径原样返回、合法范围通过；不在范围的 Unicode 路径仍拒绝 |

进入 `ready` 前回看原始请求，确认目标、约束、必须保留的能力都已列入；不把 AI 自己改写后的 goals 当作原始输入。此表是语义审查记录，不能伪称机器已证明无遗漏。

## 非目标

把本轮不处理的范围写入顶部 `non_goals`，这里仅解释容易误解的边界。

## 变更类型

- 类型：`[存量改动]`

顶部 `change_type` 只选 `[新增模块]` 或 `[存量改动]`；基础设施调整属于存量改动。说明兼容性、数据迁移和回滚策略，并把共享文件写入 `shared_files`，声明 `path`、`owner` 与 `mode`（`exclusive` 或 `integrator`）。

涉及 `prisma/`、认证或业务 API 的 Plan，还要填写顶部 `data_contract`：资源属于谁、访问控制依据、迁移影响和恢复方式。删除或不可逆转换必须记录用户授权。简单决定写在这里即可；只有存在需要长期解释的架构取舍时才新增 ADR。

## 输入规格

本轮依据 `docs/features/execution.md` 的 REQ/AC-EXECUTION-014–017、`docs/standards/workflow.md`、`docs/standards/adoption.md`、`docs/designs/execution.md`、`scripts/ignite/adoption.mjs`、`scripts/ignite/cli.mjs`、两份 scaffold 脚本及其契约测试。没有跨 Plan 依赖，也不触及业务 API、认证或数据库。

## 已关闭问题

顶部 `open_questions` 记录未决问题，`authorization.source` 记录实施授权来源。不要把空问题列表当作目标完整性证明。

## 测试与验收设计

每个 AC 的 `tests` 与 `checks[].test` 必须引用同一带 `[AC-*]` 标记的可执行用例。`required_layers` 和 `verification_requirements` 表示必须满足的验证层级：纯逻辑用 `unit`；UI 交互补 `browser`；持久化补 `database`；真实第三方依赖补 `external`。`verification_contract: 2` 的 Plan 在 integration 中执行自己映射的所有行为层；Release 再对已完成的 Plan 组合执行生产构建和全量浏览器回归。进入 ready 前，脚手架占位失败测试必须换成真实用户行为断言。

## 实现任务

分解可交付工作至顶部 `tasks`，每项有稳定 ID、标题和状态。`remaining_work` 仅放尚未能转成明确任务的验收缺口，不重复列任务。

## 验收方式

新行为先写验收测试并提交规格基线，再对每条 AC 执行 `pnpm ignite tdd red --plan <IGT-ID> --ac <AC-ID>`。该命令只记录真实断言失败；环境错误和脚手架占位失败均不算。提交红灯记录后再实施，测试文件在红灯与绿灯之间保持不变。随后运行 `pnpm ignite check --plan <IGT-ID> --level integration`，完成本 Plan 后将它标记为 done。Release 中所有 Plan 都完成后，运行 `pnpm ignite release verify <release-id> --plan <done-plan-id>`，只对最终组合执行一次生产构建和全量浏览器回归。历史 `verification_contract: 1` Plan 继续按旧流程验证。

## 设计回写

完成后仅更新 `docs/designs/execution.md` 中真实实现的采用、CLI 和脚手架事实；全流程审计与检查结果留在根目录清单，不复制进 Design。

## 状态记录

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 核实模板采用、CLI 发现和脚手架失败行为 · done
- [ ] T2 · 为六项缺口补规格与红灯验收 · doing
- [ ] T3 · 修复采用引用、CLI 帮助、上下文输出、脚手架回滚、AC 误拦和 Unicode 路径误判 · doing
- [ ] T4 · 验证隔离副本的采用/新模块/存量修改/失败恢复并交付审计清单 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

每条 REQ 被 AC 覆盖，AC 有匹配层级的真实测试；`tasks` 全部完成，`remaining_work` 清空；`integrated_commit` 可追溯，所需证据属于当前输入与环境；Design 已回写。只有这些条件经验证成立，才把 Plan 标记为 `done`。
