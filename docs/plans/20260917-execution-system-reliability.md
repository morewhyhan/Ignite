<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-003",
  "release": "ignite-execution-v3",
  "status": "active",
  "outcome": "AI 从目标到交付能按同一执行契约推进，并在采用、验证、恢复和合并时拒绝假完成",
  "contract_version": 2,
  "goals": [
    {
      "text": "新项目采用和环境准备有可执行诊断",
      "requirements": [
        "REQ-PRODUCT-013"
      ]
    },
    {
      "text": "任务依赖和修改归属一致",
      "requirements": [
        "REQ-PRODUCT-014"
      ]
    },
    {
      "text": "测试、证据和环境变化得到真实验证",
      "requirements": [
        "REQ-PRODUCT-015"
      ]
    },
    {
      "text": "数据升级和集成后交付安全",
      "requirements": [
        "REQ-PRODUCT-016"
      ]
    }
  ],
  "constraints": [
    "保留已发布 Plan 与迁移的历史语义",
    "不降低权限和安全边界"
  ],
  "non_goals": [
    "接入尚未选定的外部服务",
    "开发原生客户端"
  ],
  "authorization": {
    "source": "用户于 2026-09-17 明确要求逐项落实 EXECUTION_AUDIT.md"
  },
  "deliverables": [
    "通过验证的执行入口、规范和测试",
    "逐项回写的审计清单"
  ],
  "remaining_work": [
    "E01 无浏览器缓存和各工具桥接实测",
    "E02 三种衍生仓库采用演练",
    "E03 动态计算配置写法的采用诊断",
    "E04 实际替换外壳及删除 Tasks 的回归",
    "E05 独立核对原始用户目标未被删减",
    "E08 关键业务断言的故障注入与放宽审查（空回调已拦截）",
    "E09 指定提交的独立 CI 重跑",
    "E10 跨会话完整接续演练",
    "E11 父进程中断和孤儿恢复的真实演练",
    "E12 冷热耗时与大项目测试选择验证",
    "E13 首推、PR 和浅历史的远端演练",
    "E15 其它接口语义及设计事实漂移检查",
    "E16 远端和可访问成果入口核实",
    "E17 真实多版本带数据迁移演练",
    "E18 新 provider 选定后的适配演练",
    "E19 新 provider 配置输入登记验证",
    "E20 并行 worktree 及集成冲突演练",
    "E21 rebase 与全新克隆的合并后验证"
  ],
  "change_type": "存量改动",
  "base_commit": "28b9b5972e968dffa54d560de4631e1486214fe6",
  "requirements": [
    "REQ-PRODUCT-013",
    "REQ-PRODUCT-014",
    "REQ-PRODUCT-015",
    "REQ-PRODUCT-016"
  ],
  "acceptance": [
    {
      "id": "AC-PRODUCT-011",
      "tests": [
        "tests/contracts/execution-reliability.test.ts"
      ]
    },
    {
      "id": "AC-PRODUCT-012",
      "tests": [
        "tests/contracts/execution-reliability.test.ts"
      ]
    },
    {
      "id": "AC-PRODUCT-013",
      "tests": [
        "tests/contracts/execution-reliability.test.ts",
        "tests/contracts/ignite-checks.test.ts::[AC-PRODUCT-013] selects existing module tests and falls back for an unrecognized module",
        "tests/contracts/api-design.test.ts::[AC-PRODUCT-013] matches documented task request fields to executable validators",
        "tests/api/tasks.test.ts::[AC-PRODUCT-013] rejects an empty update as documented",
        "tests/api/tasks.test.ts::[AC-PRODUCT-013] returns exactly the documented task fields"
      ]
    },
    {
      "id": "AC-PRODUCT-014",
      "tests": [
        "tests/contracts/execution-reliability.test.ts"
      ]
    }
  ],
  "depends_on": [],
  "owner": "template-maintainer",
  "risk": "infrastructure",
  "write_scope": [
    "EXECUTION_AUDIT.md",
    "AGENTS.md",
    "README.md",
    ".ai/",
    ".github/",
    "docs/",
    "scripts/",
    "src/server/api/routes/tasks/index.ts",
    "src/server/env.ts",
    "src/server/env-policy.mjs",
    "tests/",
    "package.json",
    "eslint.config.mjs",
    "vitest.config.ts",
    "playwright.config.ts",
    ".env.example"
  ],
  "required_evidence": [
    "check-integration",
    "check-release"
  ],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20260917173404-72fc80"
    },
    {
      "id": "check-release",
      "run_id": "run-20260917174243-f77d04"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "0634cff09cbe0dc3e3ebaf5971d3994107060cc2",
  "updated_at": "2026-09-17"
}
-->

# Ignite 执行系统可靠性升级

## 目标

逐项处理根目录 `EXECUTION_AUDIT.md` 的 E01—E21，使项目采用、任务准备、执行、验证、恢复和交付形成可检验的链路。最终以可复现的使用场景验收，不以新增规则数量或主观打分替代效果。

## 非目标

- 不更换当前业务技术栈或提前接入没有目标项目使用的外部服务。
- 不重写已经发布的迁移或既有 Plan 的历史证据。

## 变更类型

- 类型：`[存量改动]`
- 影响的存量路径：`scripts/ignite/`、执行文档、CI 和测试保障层。
- 新增的增量路径：本轮 Plan 与针对缺口的契约测试。
- 兼容性影响：既有已完成 Plan 按历史策略校验；新规则只约束后续执行。
- 数据迁移或回滚要求：不改业务 Schema；执行规则按提交回退并重跑校验。

## 输入规格

- Feature：`docs/features/product.md`
- Standards：`docs/standards/workflow.md`、`testing.md`、`adoption.md`、`database.md`
- Designs：`docs/designs/runtime.md` 与当前实现。
- Source of truth：`EXECUTION_AUDIT.md` 的问题清单和仓库实际源码、测试。

## 已关闭问题

- 用户已明确要求逐项修复；范围内可回滚的工程实现已获授权。
- 迁移、合并和证据无法凭静态检查保证绝对可靠，采用隔离演练与真实检查结果作为验收依据。

## 测试与验收设计

| 验收标准       | 覆盖需求        | 自动化测试                                      | 实现后命令                          |
| -------------- | --------------- | ----------------------------------------------- | ----------------------------------- |
| AC-PRODUCT-011 | REQ-PRODUCT-013 | `tests/contracts/execution-reliability.test.ts` | `pnpm test`                         |
| AC-PRODUCT-012 | REQ-PRODUCT-014 | `tests/contracts/execution-reliability.test.ts` | `pnpm test`                         |
| AC-PRODUCT-013 | REQ-PRODUCT-015 | `tests/contracts/execution-reliability.test.ts` | `pnpm test`                         |
| AC-PRODUCT-014 | REQ-PRODUCT-016 | `tests/contracts/execution-reliability.test.ts` | `pnpm test`、`pnpm test:migrations` |

## 实现任务

- [ ] 接管与采用：E01—E04。
- [ ] 目标、规格、测试和证据可信度：E05—E09。
- [ ] 接续、运行恢复与检查成本：E10—E12。
- [ ] CI、发布、事实回写与交付：E13—E16。
- [ ] 数据升级、适配、环境和多任务合并：E17—E21。

## 验收方式

- [ ] 对应契约测试先暴露真实缺口，再在修复后通过。
- [ ] `pnpm ignite check --plan IGT-003 --level integration`。
- [ ] 在实现提交上进入 verifying，完成 release 检查。
- [ ] 更新 Design 和本清单的实际处理结果；无法证明的项保持开放。

## 设计回写

- [ ] `docs/designs/runtime.md` 描述实际执行入口、状态和恢复行为。
- [ ] 本次新增保障与原有数据库、API、UI 设计的关系得到核对。

## 状态记录

| 时间       | 状态  | 说明                                 |
| ---------- | ----- | ------------------------------------ |
| 2026-09-17 | draft | 根据用户明确要求建立整体执行升级计划 |

## 准出条件

- [ ] 每条清单问题都有实现或明确的不可实施边界，不以文字代替修复。
- [ ] 本轮全部 REQ/AC 映射到真实行为测试，未执行、跳过与失败不算通过。
- [ ] 对应实现已提交，证据绑定真实被测提交并通过当前门禁。
- [ ] 当前设计、Plan 和状态摘要与实现一致。
