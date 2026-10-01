<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790874247320866731",
  "release": "ci-build-transfer-v1",
  "status": "done",
  "outcome": "支持完整 CI 的生产构建交接保留依赖链接，启动失败时输出真实服务异常",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "修复完整 CI 的构建交接与启动诊断，防止依赖损坏及启动错误被隐藏",
      "requirements": ["REQ-EXECUTION-041", "REQ-EXECUTION-030"]
    }
  ],
  "constraints": [
    "保留现有权限、数据、验收和提交祖先校验",
    "发布后仍保持零建设期 Plan、Release 和旧证据的模板起点"
  ],
  "non_goals": ["不改变业务 API、Prisma schema、认证、运行时版本或生产安全政策"],
  "authorization": {
    "source": "用户要求：你把这个重新推送上去，然后保持这个不会出现像这种类似的问题。"
  },
  "deliverables": [
    "保留相对链接的 CI 构建归档传输",
    "实际验证依赖加载与失败日志的回归测试",
    "通过工程门禁和两项实际行为回归验收的 CI 配置"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "3ca1f15eb4e90f5063e750e2106d7192a1556109",
  "requirements": ["REQ-EXECUTION-041", "REQ-EXECUTION-030"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-041",
      "tests": [
        "tests/contracts/ci-build-artifact.test.ts::[AC-EXECUTION-041] loads external dependencies after the configured artifact round trip"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/ci-build-artifact.test.ts::[AC-EXECUTION-041] loads external dependencies after the configured artifact round trip",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-030",
      "tests": [
        "tests/contracts/ci-build-artifact.test.ts::[AC-EXECUTION-030] preserves actual server output when CI startup fails before tests"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/ci-build-artifact.test.ts::[AC-EXECUTION-030] preserves actual server output when CI startup fails before tests",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "复现云端依赖加载失败并确认传输边界",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "补齐规格与实际行为回归测试并记录红灯",
      "status": "done"
    },
    {
      "id": "T3",
      "title": "保留构建链接并恢复启动诊断输出",
      "status": "done"
    },
    {
      "id": "T4",
      "title": "完成本轮集成验收并回写设计",
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
  "owner": "codex",
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
    "tests/contracts/ci-build-artifact.test.ts",
    "tests/contracts/execution-reliability.test.ts",
    "docs/features/execution.md",
    "docs/others/test-cases/execution.md",
    "docs/designs/runtime.md",
    "docs/designs/execution.md",
    "docs/plans/20261002-ci-build-transfer.md",
    "docs/plans/releases/ci-build-transfer-v1.json",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-041",
      "test": "tests/contracts/ci-build-artifact.test.ts::[AC-EXECUTION-041] loads external dependencies after the configured artifact round trip",
      "run_id": "tdd-20261001174653-c32745"
    },
    {
      "acceptance_id": "AC-EXECUTION-030",
      "test": "tests/contracts/ci-build-artifact.test.ts::[AC-EXECUTION-030] preserves actual server output when CI startup fails before tests",
      "run_id": "tdd-20261001174814-187273"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20261001181130-bf9117"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "eb3e0cc6b924c3d93f619f7daf2c902d24171352",
  "updated_at": "2026-10-01"
}
-->

# Ignite 实施计划：ci-build-transfer

## 状态

顶部元数据是唯一状态；任务进度由 CLI 生成。

## 目标

推送当前模板，并使完整 GitHub CI 可运行；保留验收提交祖先检查，修复本轮发现的构建跨任务传输和启动日志问题。

## 原始目标与覆盖核对

| 用户原话或来源                                     | 本轮目标                                  | REQ               | AC               | 处理结果 |
| -------------------------------------------------- | ----------------------------------------- | ----------------- | ---------------- | -------- |
| 重新推送并保持不会出现类似问题                     | 传输后生产构建可运行，GitHub 完整 CI 通过 | REQ-EXECUTION-041 | AC-EXECUTION-041 | 纳入     |
| CI 运行 36888057471 健康接口返回 500，但只留下超时 | 实际服务输出进入失败日志                  | REQ-EXECUTION-030 | AC-EXECUTION-030 | 纳入     |

## 整体判断与推进顺序

整体链路是可推送提交 → 云端构建 → 归档传输 → 独立依赖安装 → 生产服务 → 浏览器验收。当前提交已通过云端 quality、test、migration 和 build；E2E 在健康接口 500 时停止。原始本地构建返回 200，将链接展开的副本返回 500，异常为找不到 .prisma/client/default；因此先修复传输语义，而非调整业务或延长等待。启动失败时现有 GitHub reporter 没有输出服务异常，回归需观察真实子进程输出。若保留链接的副本仍失败，重新核对依赖和服务异常。最终必须以 GitHub 完整 CI 为依据，不把本地构建或测试绿灯当作云端完成。

## 非目标

不更改业务、Schema、认证、安全政策和运行时版本，不绕过证据或删减 CI 检查。

## 变更类型

- 类型：`[存量改动]`

仅改 CI 构建传输和测试日志。没有数据迁移，回滚为还原本 Plan 的配置、测试和说明变更。

## 输入规格

使用 docs/features/execution.md、docs/standards/testing.md、docs/designs/runtime.md、.github/workflows/ci.yml、playwright.config.ts 和既有验收入口。

## 已关闭问题

已有推送和修复授权；采用现有 Linux CI 与同一锁文件，不新增外部服务。

## 测试与验收设计

依赖传输测试执行实际工作流的归档与解包命令，在两个独立工作区验证 pnpm 相邻生成依赖的 Node 加载；展开链接必须失败。诊断测试实际启动会退出的服务器子进程，检查 CI reporter 是否保留 stdout 与 stderr。两者属于基础设施 unit 行为，不声称证明业务或数据库。Plan integration 执行工程与这些行为门禁，Release 最终运行生产构建和全量 E2E，之后推送并等待云端相同版本的五项检查。

## 实现任务

tasks 是唯一任务状态。

## 验收方式

先按 AC 记录真实断言红灯，提交后改实现；Plan integration 与 Release 最终验收按既有命令执行。最终清理建设记录仅发生在证据提交后，历史留在 Git，状态由 CLI 重新生成。

## 设计回写

更新 docs/designs/runtime.md 和 docs/designs/execution.md 的实际 CI 传输与诊断事实。

## 状态记录

2026-10-02：云端旧证据问题已消失，本轮发现生产构建 ZIP 传输展开 Prisma 链接后导致 500；本地原始构建 200，与展开链接副本 500 已复现。云端尚未完整通过。

2026-10-02：传输测试补齐接收环境独立性后记录真实断言红灯；诊断断言调整为只报告是否收到输出，随后重新记录红灯。被替换的诊断红灯已提交，保留在 Git 历史，不作为本轮绿灯依据。

## 准出条件

2026-10-02：最终 Plan 合同的集成记录 run-20261001181130-bf9117 已通过工程门禁及 173 项测试，两项本轮 AC 均通过；生产构建、全量浏览器验收及最终云端结果仍待 Release 与推送确认。

Plan 准出：两项目标行为有真实红灯和匹配的集成证据，设计已回写。

Release 准出：全部 Plan 完成后，生产构建及全量 E2E 通过。

本轮用户交付还须推送并等待同一最终提交的 GitHub 五项 CI 全部通过；Plan done 只表示本地修复已验收，不代替远端结果。模板建设记录提交后从发布快照移除，状态由 CLI 生成。

<!-- ignite-progress -->

状态：`done`（由元数据生成）

- [x] T1 · 复现云端依赖加载失败并确认传输边界 · done
- [x] T2 · 补齐规格与实际行为回归测试并记录红灯 · done
- [x] T3 · 保留构建链接并恢复启动诊断输出 · done
- [x] T4 · 完成本轮集成验收并回写设计 · done

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20261001181130-bf9117
<!-- /ignite-progress -->
