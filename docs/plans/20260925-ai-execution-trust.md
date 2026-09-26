<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-006",
  "release": "ai-execution-trust-v1",
  "status": "active",
  "outcome": "AI 能从用户目标持续推进到可信验收，状态准确、范围可追溯，Web 体验适配常见屏幕",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "区分工程检查、Plan 验收与 Release 验收",
      "requirements": [
        "REQ-TRUST-001",
        "REQ-TRUST-003",
        "REQ-TRUST-009"
      ]
    },
    {
      "text": "让原始目标、需求与验收覆盖能够逐层追踪",
      "requirements": [
        "REQ-TRUST-002"
      ]
    },
    {
      "text": "保证测试先行、脚手架和决策记录不制造虚假完成感",
      "requirements": [
        "REQ-TRUST-004",
        "REQ-TRUST-005",
        "REQ-TRUST-008"
      ]
    },
    {
      "text": "为响应式 Web 和未来端适配建立轻量、可验证的边界",
      "requirements": [
        "REQ-TRUST-006",
        "REQ-TRUST-007"
      ]
    },
    {
      "text": "统一校验和下一步反馈，降低命令噪声与运行时排查成本",
      "requirements": [
        "REQ-TRUST-010",
        "REQ-TRUST-011",
        "REQ-TRUST-012",
        "REQ-TRUST-013",
        "REQ-TRUST-014",
        "REQ-TRUST-015",
        "REQ-TRUST-016"
      ]
    }
  ],
  "constraints": [
    "保留 PDF 定义的 Standards、Features、Plans、Designs、Others 文档分工",
    "保留模块化单体、Next.js、React、Hono Typed RPC、Prisma 现有主栈",
    "旧 Plan 和旧证据按原执行契约解释，不将历史绿灯重写为新策略证据",
    "默认诊断命令不得静默切换用户运行时或改写项目数据",
    "不触碰 node_modules，不部署"
  ],
  "non_goals": [
    "实现原生移动端、小程序或桌面应用",
    "将所有领域模型强制改造成 DDD 聚合或领域事件",
    "将学生管理系统报告中的未提供源码主张直接当成事实"
  ],
  "authorization": {
    "source": "用户明确要求完成本轮验收并推送；所有状态和证据必须遵守仓库治理规则，不得伪造"
  },
  "deliverables": [
    "Ignite CLI 的 Plan/Release 分层验收与精确证据",
    "规格覆盖、TDD 记录、工作区隔离和脚手架改进",
    "响应式 Web 验收与跨端可扩展的共享 RPC 适配边界",
    "Plan/Release 版本兼容矩阵、一致的下一步解析、精简状态摘要与运行时修复指引",
    "更新后的 Workflow、Adoption、Design 和测试路径说明"
  ],
  "remaining_work": [
    "正式 Plan 集成验收和 Release 最终生产验收尚未运行；完成后将两层证据绑定到最终交付版本"
  ],
  "change_type": "存量改动",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "本 Plan 调整 CLI、文档与 Web 适配边界，不改变用户数据归属、授权规则或持久化结构。",
    "migration_impact": "none",
    "rollback": "回滚本 Plan 的代码与文档改动；不涉及数据迁移。"
  },
  "base_commit": "ad1b60489d9db1d327fd958ca7e7f066d1ce0532",
  "requirements": [
    "REQ-TRUST-001",
    "REQ-TRUST-002",
    "REQ-TRUST-003",
    "REQ-TRUST-004",
    "REQ-TRUST-005",
    "REQ-TRUST-006",
    "REQ-TRUST-007",
    "REQ-TRUST-008",
    "REQ-TRUST-009",
    "REQ-TRUST-010",
    "REQ-TRUST-011",
    "REQ-TRUST-012",
    "REQ-TRUST-013",
    "REQ-TRUST-014",
    "REQ-TRUST-015",
    "REQ-TRUST-016"
  ],
  "acceptance": [
    {
      "id": "AC-TRUST-001",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-001]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-001]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-002",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-002]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-002]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-003",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-003]",
        "tests/e2e/responsive.spec.ts::[AC-TRUST-003]"
      ],
      "required_layers": [
        "unit",
        "browser"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-003]",
          "layer": "unit"
        },
        {
          "test": "tests/e2e/responsive.spec.ts::[AC-TRUST-003]",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-TRUST-004",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-004]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-004]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-005",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-005]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-005]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-006",
      "tests": [
        "tests/e2e/responsive.spec.ts::[AC-TRUST-006]"
      ],
      "required_layers": [
        "browser"
      ],
      "checks": [
        {
          "test": "tests/e2e/responsive.spec.ts::[AC-TRUST-006]",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-TRUST-007",
      "tests": [
        "tests/contracts/api-design.test.ts::[AC-TRUST-007]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/api-design.test.ts::[AC-TRUST-007]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-008",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-008]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-008]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-009",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-009]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-009]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-010",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-010]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-010]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-011",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-011]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-011]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-012",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-012]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-012]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-013",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-013]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-013]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-014",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-014]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-014]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-015",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-015]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-015]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-TRUST-016",
      "tests": [
        "tests/contracts/execution-trust.test.ts::[AC-TRUST-016]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-016]",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": [
    "unit",
    "browser"
  ],
  "tasks": [
    {
      "id": "T1",
      "title": "升级规格覆盖、状态输出与旧契约兼容",
      "status": "todo"
    },
    {
      "id": "T2",
      "title": "拆分 Plan 行为验收和 Release 最终版本验收",
      "status": "todo"
    },
    {
      "id": "T3",
      "title": "记录有效红绿过程并修正脚手架和工作区保护",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "补齐响应式验收与共享请求适配边界",
      "status": "todo"
    },
    {
      "id": "T5",
      "title": "更新采用说明、Design、版本和交付记录",
      "status": "todo"
    },
    {
      "id": "T6",
      "title": "修正契约兼容判定并统一 Plan/Release 下一步逻辑",
      "status": "todo"
    },
    {
      "id": "T7",
      "title": "精简 CLI 状态输出、复用状态快照并补齐运行时修复指引",
      "status": "todo"
    },
    {
      "id": "T8",
      "title": "保证 TDD 单 AC 红灯不会被其他跳过用例误报",
      "status": "todo"
    },
    {
      "id": "T9",
      "title": "让多条 TDD 红灯证据可批量记录而不要求中间提交",
      "status": "todo"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [
    {
      "path": "scripts/ignite/state.mjs",
      "owner": "root",
      "mode": "integrator"
    },
    {
      "path": "scripts/ignite/runs.mjs",
      "owner": "root",
      "mode": "integrator"
    },
    {
      "path": "scripts/ignite/cli.mjs",
      "owner": "root",
      "mode": "integrator"
    },
    {
      "path": "scripts/ignite/checks.mjs",
      "owner": "root",
      "mode": "integrator"
    },
    {
      "path": "scripts/ignite/execution-contract.mjs",
      "owner": "root",
      "mode": "integrator"
    },
    {
      "path": "playwright.config.ts",
      "owner": "root",
      "mode": "integrator"
    },
    {
      "path": "src/lib/api-client.ts",
      "owner": "root",
      "mode": "integrator"
    }
  ],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": [],
    "remaining": []
  },
  "owner": "root",
  "risk": "infrastructure",
  "write_scope": [
    "AGENTS.md",
    "scripts/ignite/",
    "scripts/create-module.mjs",
    "scripts/create-change.mjs",
    "scripts/scaffold-preflight.mjs",
    "scripts/runtime-doctor.mjs",
    "scripts/runtime-guidance.mjs",
    "scripts/testing/acceptance-results.mjs",
    "src/lib/api-client.ts",
    "src/modules/tasks/hooks/use-tasks.ts",
    "src/modules/tasks/components/tasks-screen.tsx",
    "src/modules/tasks/components/task-editor-dialog.tsx",
    "src/modules/tasks/components/task-list.tsx",
    "src/modules/landing/components/landing-screen.tsx",
    "src/modules/auth/components/auth-modal.tsx",
    "playwright.config.ts",
    "tests/contracts/execution-trust.test.ts",
    "tests/contracts/api-design.test.ts",
    "tests/contracts/execution-hardening.test.ts",
    "tests/contracts/execution-reliability.test.ts",
    "tests/contracts/template-history.test.ts",
    "tests/contracts/template-runtime.test.ts",
    "tests/e2e/responsive.spec.ts",
    "docs/features/ai-execution-trust.md",
    "docs/plans/20260925-ai-execution-trust.md",
    "docs/plans/releases/ai-execution-trust-v1.json",
    "docs/plans/_template.md",
    "docs/plans/releases/_template.json",
    "docs/standards/",
    "docs/designs/",
    "docs/features/_template.md",
    "docs/others/acceptance/",
    "docs/others/test-cases/",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-TRUST-016",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-016]",
      "run_id": "tdd-20260926100747-e98683"
    },
    {
      "acceptance_id": "AC-TRUST-001",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-001]",
      "run_id": "tdd-20260926101635-f22c91"
    },
    {
      "acceptance_id": "AC-TRUST-002",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-002]",
      "run_id": "tdd-20260926101728-144c91"
    },
    {
      "acceptance_id": "AC-TRUST-003",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-003]",
      "run_id": "tdd-20260926101748-dc6fb8"
    },
    {
      "acceptance_id": "AC-TRUST-005",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-005]",
      "run_id": "tdd-20260926101815-8df0c9"
    },
    {
      "acceptance_id": "AC-TRUST-004",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-004]",
      "run_id": "tdd-20260926102047-3f06aa"
    },
    {
      "acceptance_id": "AC-TRUST-006",
      "test": "tests/e2e/responsive.spec.ts::[AC-TRUST-006]",
      "run_id": "tdd-20260926144302-2b40b6"
    },
    {
      "acceptance_id": "AC-TRUST-007",
      "test": "tests/contracts/api-design.test.ts::[AC-TRUST-007]",
      "run_id": "tdd-20260926102235-3f66f5"
    },
    {
      "acceptance_id": "AC-TRUST-008",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-008]",
      "run_id": "tdd-20260926102301-eb2786"
    },
    {
      "acceptance_id": "AC-TRUST-009",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-009]",
      "run_id": "tdd-20260926102320-d6b71a"
    },
    {
      "acceptance_id": "AC-TRUST-010",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-010]",
      "run_id": "tdd-20260926102338-609d2e"
    },
    {
      "acceptance_id": "AC-TRUST-011",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-011]",
      "run_id": "tdd-20260926102801-558ef7"
    },
    {
      "acceptance_id": "AC-TRUST-012",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-012]",
      "run_id": "tdd-20260926102822-d5704a"
    },
    {
      "acceptance_id": "AC-TRUST-013",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-013]",
      "run_id": "tdd-20260926102843-646ade"
    },
    {
      "acceptance_id": "AC-TRUST-014",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-014]",
      "run_id": "tdd-20260926102903-866ca4"
    },
    {
      "acceptance_id": "AC-TRUST-015",
      "test": "tests/contracts/execution-trust.test.ts::[AC-TRUST-015]",
      "run_id": "tdd-20260926102923-c44b46"
    }
  ],
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

# Ignite 实施计划：AI 开发执行可信度

## 状态

顶部元数据是状态唯一真源；任务状态只写在 `tasks`。本轮任何未验证内容都保持未完成。

## 目标

逐项落实 Feature 定义的 16 项执行体验与可信验收改进，覆盖状态准确、目标范围完整、行为先行、改动隔离、多端验证、最终版本证据、兼容性、清晰反馈与高效接续。

## 原始目标与覆盖核对

| 用户原话或来源                                                                                                                                                  | 本轮目标                                                                                     | REQ                            | AC                            | 处理                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------- | ----------------------------------------------------------- |
| 学生系统复盘及此前模板审查                                                                                                                                      | 避免工程门禁绿灯冒充功能完成，补齐真实验收与追踪                                             | REQ-TRUST-001 至 005、008、009 | AC-TRUST-001 至 005、008、009 | 纳入本 Plan；具体学生项目事实需源码才能确认                 |
| 用户确认先做响应式 Web，并建立共享业务契约/适配边界                                                                                                             | Web 适配桌面、平板和手机；未来端可接入                                                       | REQ-TRUST-006、007             | AC-TRUST-006、007             | 纳入本 Plan；原生端后续增量接入                             |
| 本轮 WSL 体验复核：发现版本校验冲突、`next` 与 `validate` 结论不一致、Release 缺行动提示、CLI 输出过长和重复扫描；定向 TDD 红灯会把其它 AC 的跳过用例误判为失败 | 让命令结论一致、状态简洁且可行动；减少重复读取；Node 不匹配时提供恢复指引；TDD 只判定目标 AC | REQ-TRUST-010 至 015           | AC-TRUST-010 至 015           | 纳入本 Plan；不静默切换环境，耗时优化只针对已确认的重复扫描 |

## 非目标

不开发小程序、原生 App、桌面应用；不把 DDD 作为所有 CRUD 的硬性模板。

## 变更类型

- 类型：`[存量改动]`

这是对已有执行系统的兼容升级。已完成历史 Plan 的状态、证据和原有解释不改写；新策略只应用于 `verification_contract: 2` 的 Plan/Release。

## 输入规格

- Feature：`docs/features/ai-execution-trust.md`
- Standards：`docs/standards/workflow.md`、`docs/standards/adoption.md`、`docs/standards/testing.md`、`docs/standards/architecture.md`
- 当前设计：`docs/designs/execution.md`、`docs/designs/api.md`、`docs/designs/design.md`

## 已关闭问题

- 用户已授权直接实施这套改造。
- Web 范围为响应式页面与共享契约/适配边界，其他端留待后续增量。
- 学生项目未提供源码，复盘报告中的事实只作为待验证线索，不直接改写为模板缺陷。

## 测试与验收设计

每个 AC 对应执行契约测试；UI 验收使用真实 Playwright。新规则需覆盖旧契约回归、Plan/Release 状态循环、范围拆分、证据复用和失效、脏工作区、响应式主要路径、版本组合矩阵、阻塞与下一步一致性、Release 恢复动作、CLI 摘要、运行时提示，以及单 AC TDD 红灯不会被其它筛选用例污染。TDD 证据只接受具体断言失败，不能使用环境失败、占位失败或事后补造记录。

## 实现任务

按顶部 `tasks` 推进。先修正契约版本矩阵和命令动作判定，再收敛输出与状态快照读取，补齐运行时提示，最后完成既有响应式与共享请求边界。

## 验收方式

计划稳定基线提交后运行 Plan integration；在一个 Plan 保持 verifying 时对完整 Release 运行一次生产构建与全局浏览器验收，存储 Release 证据后再完成该 Plan。不同提交的 Plan 证据不能拼成 Release 最终通过。

## 设计回写

改动后回写 `docs/designs/execution.md`、`docs/designs/api.md` 和受影响的 UI 事实；过程和验收路径留在本 Plan 与测试用例文档。

## 状态记录

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [ ] T1 · 升级规格覆盖、状态输出与旧契约兼容 · todo
- [ ] T2 · 拆分 Plan 行为验收和 Release 最终版本验收 · todo
- [ ] T3 · 记录有效红绿过程并修正脚手架和工作区保护 · todo
- [ ] T4 · 补齐响应式验收与共享请求适配边界 · todo
- [ ] T5 · 更新采用说明、Design、版本和交付记录 · todo
- [ ] T6 · 修正契约兼容判定并统一 Plan/Release 下一步逻辑 · todo
- [ ] T7 · 精简 CLI 状态输出、复用状态快照并补齐运行时修复指引 · todo
- [ ] T8 · 保证 TDD 单 AC 红灯不会被其他跳过用例误报 · todo
- [ ] T9 · 让多条 TDD 红灯证据可批量记录而不要求中间提交 · todo

验收缺口：正式 Plan 集成验收和 Release 最终生产验收尚未运行；完成后将两层证据绑定到最终交付版本
证据：尚无
<!-- /ignite-progress -->

## 准出条件

全部 REQ 对应的行为均有测试；Plan 和 Release 状态没有循环依赖；历史策略兼容；tasks 全部完成；Release 证据绑定最终提交与范围；Design 已更新。未能在当前环境运行的检查不得记录为通过。
