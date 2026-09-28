<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790591328058139222",
  "release": "ci-e2e-server-output-v1",
  "status": "verifying",
  "outcome": "GitHub Actions 生产态 E2E readiness 失败时能从 CI 日志看到 Playwright 与 Next 服务器诊断",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "CI 的生产态 E2E 无法启动时，日志能暴露服务器真实启动输出和 Playwright readiness 检查过程",
      "requirements": ["REQ-EXECUTION-030"]
    }
  ],
  "constraints": [
    "只在 CI 输出服务 stdout 和 pw:webserver 调试信息",
    "不输出 secret 或扩大服务器 readiness 判定"
  ],
  "non_goals": ["不延长 120 秒启动超时", "不改变健康端点或业务运行逻辑"],
  "authorization": {
    "source": "用户要求把完整 CI 检查做好；GitHub Actions run 36407641083 的 test、quality、build、migration 均通过，但 e2e 因 Playwright webServer readiness timeout 失败，用户要求继续修复后推送"
  },
  "deliverables": [
    "CI E2E 输出 Next webServer stdout 与 Playwright webServer 诊断",
    "回归测试锁定诊断配置"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "cdef571815d1c673f0e3004f7072ab7d3f3b3117",
  "requirements": ["REQ-EXECUTION-030"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-030",
      "tests": [
        "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-030] exposes production E2E server diagnostics in CI"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-030] exposes production E2E server diagnostics in CI",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "确认 CI readiness 超时并锁定诊断契约",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "新增 CI server-output 验收测试并确认红灯",
      "status": "done"
    },
    {
      "id": "T3",
      "title": "输出 Playwright 与 Next server 诊断",
      "status": "done"
    },
    {
      "id": "T4",
      "title": "重跑 Release 与 GitHub CI，确认生产服务器可启动",
      "status": "done"
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
    ".github/workflows/ci.yml",
    "playwright.config.ts",
    "tests/contracts/execution-reliability.test.ts",
    "docs/features/execution.md",
    "docs/designs/execution.md",
    "docs/others/test-cases/execution.md",
    "docs/plans/20260928-ci-e2e-server-output.md",
    "docs/plans/releases/ci-e2e-server-output-v1.json",
    "docs/others/evidence/tdd/",
    "docs/others/evidence/runs/",
    "docs/others/ignite-status.md"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-030",
      "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-030] exposes production E2E server diagnostics in CI",
      "run_id": "tdd-20260928103559-c22e8d"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20260928104009-8760e5"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "40263425bd23f56c6234b84634ba5c12282cff8c",
  "updated_at": "2026-09-28"
}
-->

# Ignite 实施计划：CI 生产态 E2E 服务诊断

> 该存量改动让 CI readiness 超时可诊断；不更改应用行为，最终事实回写 `docs/designs/execution.md`。

## 状态

顶部元数据的 `status` 是唯一状态；正文不复制当前状态。`tasks` 是唯一的子任务状态，使用 `todo`、`doing`、`done`；真正阻塞时由 Plan 的 `status` 与 `blocker` 表达。不要在正文另建任务复选框。下方进度块由工具刷新，勿手改。

## 目标

用一句用户可观察的结果描述本轮成果。先写清原始目标，再将其拆成 `goals`、REQ、AC 和测试。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                              | 本轮目标                                                  | REQ               | AC               | 处理结果 |
| ------------------------------------------------- | --------------------------------------------------------- | ----------------- | ---------------- | -------- |
| GitHub push run 36407641083 的 e2e readiness 超时 | 保留生产构建和 E2E 流程，增加服务器及 Playwright 启动日志 | REQ-EXECUTION-030 | AC-EXECUTION-030 | 保留     |

进入 `ready` 前回看原始请求，确认目标、约束、必须保留的能力都已列入；不把 AI 自己改写后的 goals 当作原始输入。此表是语义审查记录，不能伪称机器已证明无遗漏。

## 非目标

把本轮不处理的范围写入顶部 `non_goals`，这里仅解释容易误解的边界。

## 变更类型

- 类型：`[存量改动]`

顶部 `change_type` 只选 `[新增模块]` 或 `[存量改动]`；基础设施调整属于存量改动。说明兼容性、数据迁移和回滚策略，并把共享文件写入 `shared_files`，声明 `path`、`owner` 与 `mode`（`exclusive` 或 `integrator`）。

涉及 `prisma/`、认证或业务 API 的 Plan，还要填写顶部 `data_contract`：资源属于谁、访问控制依据、迁移影响和恢复方式。删除或不可逆转换必须记录用户授权。简单决定写在这里即可；只有存在需要长期解释的架构取舍时才新增 ADR。

## 输入规格

只引用本轮相关的 Feature、Standards、Design、代码与测试。跨 Plan 依赖在 `depends_on` 与 `dependency_contracts` 中写清接口契约；交接成果写入 `handoff.interfaces`、`migrations`、`tests` 和 `remaining`。

## 已关闭问题

顶部 `open_questions` 记录未决问题，`authorization.source` 记录实施授权来源。不要把空问题列表当作目标完整性证明。

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

状态：`verifying`（由元数据生成）

- [x] T1 · 确认 CI readiness 超时并锁定诊断契约 · done
- [x] T2 · 新增 CI server-output 验收测试并确认红灯 · done
- [x] T3 · 输出 Playwright 与 Next server 诊断 · done
- [x] T4 · 重跑 Release 与 GitHub CI，确认生产服务器可启动 · done

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20260928104009-8760e5
<!-- /ignite-progress -->

## 准出条件

每条 REQ 被 AC 覆盖，AC 有匹配层级的真实测试；`tasks` 全部完成，`remaining_work` 清空；`integrated_commit` 可追溯，所需证据属于当前输入与环境；Design 已回写。只有这些条件经验证成立，才把 Plan 标记为 `done`。
