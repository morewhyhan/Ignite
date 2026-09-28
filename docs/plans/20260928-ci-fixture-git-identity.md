<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790586476155495502",
  "release": "ci-fixture-git-identity-v1",
  "status": "active",
  "outcome": "临时 Git 测试仓库在没有全局身份配置的 CI 上仍可提交并完成 rebase 验收",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "测试夹具的 Git 提交身份由夹具自身设置",
      "requirements": ["REQ-EXECUTION-029"]
    }
  ],
  "constraints": ["不得修改开发者全局 Git 配置", "生产 Git 工作区配置保持不变"],
  "non_goals": ["不更改业务代码或 GitHub Actions 版本"],
  "authorization": {
    "source": "用户要求推送前检查整个仓库；GitHub Actions 暴露出测试依赖 runner 全局 Git 身份的失败，并授权修复"
  },
  "deliverables": ["自带本地提交身份的临时 Git 测试夹具", "无全局身份时的回归验收"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "7248532c9202c89458e3746ba511b7e1a37b221d",
  "requirements": ["REQ-EXECUTION-029"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-029",
      "tests": [
        "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-029] configures local commit identity for isolated Git fixtures"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-029] configures local commit identity for isolated Git fixtures",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "记录夹具身份契约及真实行为测试",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "确认新增验收按预期失败",
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "由临时仓库配置本地 Git 身份并重验",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "运行本地 CI 检查并核实 GitHub Actions",
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
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-decided",
    "access_rationale": "",
    "migration_impact": "not-decided",
    "rollback": "",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/execution.md",
    "docs/designs/execution.md",
    "docs/others/test-cases/execution.md",
    "tests/contracts/execution-reliability.test.ts",
    "tests/contracts/ignite-fixture.ts",
    "docs/plans/20260928-ci-fixture-git-identity.md",
    "docs/plans/releases/ci-fixture-git-identity-v1.json",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-09-28"
}
-->

# Ignite 实施计划：CI 临时 Git 仓库身份

> 本计划记录 GitHub Actions 暴露的测试夹具可移植性缺陷；最终设计事实回写 `docs/designs/execution.md`。

## 状态

顶部元数据的 `status` 是唯一状态；正文不复制当前状态。`tasks` 是唯一的子任务状态，使用 `todo`、`doing`、`done`；真正阻塞时由 Plan 的 `status` 与 `blocker` 表达。不要在正文另建任务复选框。下方进度块由工具刷新，勿手改。

## 目标

用一句用户可观察的结果描述本轮成果。先写清原始目标，再将其拆成 `goals`、REQ、AC 和测试。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                    | 本轮目标                                          | REQ               | AC               | 处理结果 |
| ------------------------------------------------------- | ------------------------------------------------- | ----------------- | ---------------- | -------- |
| 推送后 GitHub CI 因 rebase 缺少 committer identity 失败 | 临时仓库本地固定 identity，使测试脱离宿主全局设置 | REQ-EXECUTION-029 | AC-EXECUTION-029 | 保留     |

进入 `ready` 前回看原始请求，确认目标、约束、必须保留的能力都已列入；不把 AI 自己改写后的 goals 当作原始输入。此表是语义审查记录，不能伪称机器已证明无遗漏。

## 非目标

把本轮不处理的范围写入顶部 `non_goals`，这里仅解释容易误解的边界。

## 变更类型

- 类型：`[存量改动]`
- 兼容与回滚：只设置临时测试仓库的本地 Git 配置；如需回滚可移除夹具初始化中的两条配置，不触及现有仓库或用户全局设置。

顶部 `change_type` 只选 `[新增模块]` 或 `[存量改动]`；基础设施调整属于存量改动。说明兼容性、数据迁移和回滚策略，并把共享文件写入 `shared_files`，声明 `path`、`owner` 与 `mode`（`exclusive` 或 `integrator`）。

涉及 `prisma/`、认证或业务 API 的 Plan，还要填写顶部 `data_contract`：资源属于谁、访问控制依据、迁移影响和恢复方式。删除或不可逆转换必须记录用户授权。简单决定写在这里即可；只有存在需要长期解释的架构取舍时才新增 ADR。

## 输入规格

只引用本轮相关的 Feature、Standards、Design、代码与测试。跨 Plan 依赖在 `depends_on` 与 `dependency_contracts` 中写清接口契约；交接成果写入 `handoff.interfaces`、`migrations`、`tests` 和 `remaining`。

## 已关闭问题

CI 日志指向隔离夹具未配置本地 committer identity；红灯测试直接检查新建 fixture 的 local Git config。此变更不涉及应用运行时代码。

## 测试与验收设计

每个 AC 的 `tests` 与 `checks[].test` 必须引用同一带 `[AC-*]` 标记的可执行用例。`required_layers` 和 `verification_requirements` 表示必须满足的验证层级：纯逻辑用 `unit`；UI 交互补 `browser`；持久化补 `database`；真实第三方依赖补 `external`。`verification_contract: 2` 的 Plan 在 integration 中执行自己映射的所有行为层；Release 再对已完成的 Plan 组合执行生产构建和全量浏览器回归。进入 ready 前，脚手架占位失败测试必须换成真实用户行为断言。

## 实现任务

分解可交付工作至顶部 `tasks`，每项有稳定 ID、标题和状态。`remaining_work` 仅放尚未能转成明确任务的验收缺口，不重复列任务。

## 验收方式

新行为先写验收测试并提交规格基线，再对每条 AC 执行 `pnpm ignite tdd red --plan <IGT-ID> --ac <AC-ID>`。该命令只记录真实断言失败；环境错误和脚手架占位失败均不算。提交红灯记录后再实施，测试文件在红灯与绿灯之间保持不变。随后运行 `pnpm ignite check --plan <IGT-ID> --level integration`，完成本 Plan 后将它标记为 done。Release 中所有 Plan 都完成后，运行 `pnpm ignite release verify <release-id> --plan <done-plan-id>`，只对最终组合执行一次生产构建和全量浏览器回归。历史 `verification_contract: 1` Plan 继续按旧流程验证。

## 设计回写

完成后只回写受影响的当前事实到 `docs/designs/`，不把本 Plan 的过程说明复制过去。

## 状态记录

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 记录夹具身份契约及真实行为测试 · done
- [ ] T2 · 确认新增验收按预期失败 · doing
- [ ] T3 · 由临时仓库配置本地 Git 身份并重验 · todo
- [ ] T4 · 运行本地 CI 检查并核实 GitHub Actions · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

每条 REQ 被 AC 覆盖，AC 有匹配层级的真实测试；`tasks` 全部完成，`remaining_work` 清空；`integrated_commit` 可追溯，所需证据属于当前输入与环境；Design 已回写。只有这些条件经验证成立，才把 Plan 标记为 `done`。
