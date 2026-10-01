<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790826869649125989",
  "release": "systematic-execution-v1",
  "status": "done",
  "outcome": "让 AI 先覆盖整体目标与关键链路，再选择主要问题并按证据纠偏；日常接续保留目标边界和未完成任务",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "执行规范、Plan 草稿和接续入口共同支持整体判断、行动取舍和执行纠偏",
      "requirements": ["REQ-EXECUTION-031", "REQ-EXECUTION-032", "REQ-EXECUTION-033"]
    }
  ],
  "constraints": [
    "保留工程、Plan、Release 的既有验收门禁",
    "保留历史契约与唯一任务状态",
    "结构测试不冒充 AI 判断质量的实证"
  ],
  "non_goals": [
    "重构业务、数据库或部署",
    "重建六套表格和状态",
    "保证所有模型都能正确判断主要矛盾",
    "清理无关历史问题"
  ],
  "authorization": {
    "source": "用户要求直接落实：AI 抓住次要矛盾并局部深挖，忽略系统性与全面性；授权改进项目执行体系"
  },
  "deliverables": [
    "整体分析与执行取舍标准",
    "带整体判断入口的 Feature/Plan 草稿",
    "保留目标与任务的 next 摘要和任务接续建议",
    "工具回归用例与人工行为评估案例"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "307cf88b3a8d6993132a464f27b169783447f0b5",
  "requirements": ["REQ-EXECUTION-031", "REQ-EXECUTION-032", "REQ-EXECUTION-033"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-031",
      "tests": [
        "tests/contracts/execution-focus.test.ts::[AC-EXECUTION-031] preserves goals, constraints and all task states in the compact resume context"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-focus.test.ts::[AC-EXECUTION-031] preserves goals, constraints and all task states in the compact resume context",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-032",
      "tests": [
        "tests/contracts/execution-focus.test.ts::[AC-EXECUTION-032] resumes unfinished work before offering checks and retains gap, blocker and legacy precedence"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-focus.test.ts::[AC-EXECUTION-032] resumes unfinished work before offering checks and retains gap, blocker and legacy precedence",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-033",
      "tests": [
        "tests/contracts/execution-focus.test.ts::[AC-EXECUTION-033] generates module and change drafts with a whole-task review and no completion evidence"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-focus.test.ts::[AC-EXECUTION-033] generates module and change drafts with a whole-task review and no completion evidence",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "核对现有目标追溯、检查复用和接续入口，确定主要缺口",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "建立目标摘要、任务优先和双脚手架的真实红灯基线",
      "status": "done"
    },
    {
      "id": "T3",
      "title": "落实整体判断、行动取舍、纠偏标准与接续行为",
      "status": "done"
    },
    {
      "id": "T4",
      "title": "执行适用验收并回写设计与实际限制",
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
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "只调整执行规范、文档模板和 CLI 接续，不改变业务数据访问",
    "migration_impact": "none",
    "rollback": "回退本轮文档与 CLI 提交，不涉及数据恢复",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/plans/20261001-systematic-execution.md",
    "docs/plans/releases/systematic-execution-v1.json",
    "AGENTS.md",
    "docs/standards/execution-focus.md",
    "docs/standards/README.md",
    "docs/standards/workflow.md",
    "docs/standards/testing.md",
    "docs/features/execution.md",
    "docs/features/_template.md",
    "docs/plans/_template.md",
    "docs/others/test-cases/_template.md",
    "docs/others/test-cases/execution-focus.md",
    "docs/others/test-cases/execution.md",
    "docs/designs/execution.md",
    "scripts/ignite/cli.mjs",
    "scripts/create-module.mjs",
    "tests/contracts/execution-focus.test.ts",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-031",
      "test": "tests/contracts/execution-focus.test.ts::[AC-EXECUTION-031] preserves goals, constraints and all task states in the compact resume context",
      "run_id": "tdd-20261001040553-3a27d6"
    },
    {
      "acceptance_id": "AC-EXECUTION-033",
      "test": "tests/contracts/execution-focus.test.ts::[AC-EXECUTION-033] generates module and change drafts with a whole-task review and no completion evidence",
      "run_id": "tdd-20261001040637-61f5cf"
    },
    {
      "acceptance_id": "AC-EXECUTION-032",
      "test": "tests/contracts/execution-focus.test.ts::[AC-EXECUTION-032] resumes unfinished work before offering checks and retains gap, blocker and legacy precedence",
      "run_id": "tdd-20261001041320-1e684e"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20261001043612-c9234b"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "6c17700316a8cf654dff49a8f14a4f6cae96ecf3",
  "updated_at": "2026-10-01"
}
-->

# Ignite 实施计划：systematic-execution

## 状态

顶部元数据是状态真源，任务进度由工具生成。

## 目标

让执行前的整体覆盖、行动取舍和执行中的证据纠偏成为一条可接续的工作流。

## 原始目标与覆盖核对

| 用户原话或来源                                                        | 本轮目标                                         | REQ                                                       | AC                                                     | 处理结果                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| AI 容易抓住次要矛盾并仅在局部深挖，忽略系统性、全面性；直接落实到项目 | 标准和草稿先覆盖整体，接续不丢失目标、边界与任务 | REQ-EXECUTION-031 / REQ-EXECUTION-032 / REQ-EXECUTION-033 | AC-EXECUTION-031 / AC-EXECUTION-032 / AC-EXECUTION-033 | 全部保留；模型判断质量另用人工案例评估，工具绿灯不冒充实证 |

## 整体判断与推进顺序

现有事实：工作流已有原始目标映射、真实分层验收、同输入运行复用和失败停止要求；缺口是整体检查的尺度、主要问题的选择依据、目标推进中的纠偏条件。next 精简摘要省略 goals、constraints、non_goals、tasks，active 默认将缺少证据的情况导向检查命令。

主要问题：模型缺少可直接使用的整体判断与选择标准，接续信息又容易让它只围绕检查缺口行动。优先补齐标准、模板和摘要，而不是增加全量检查或重构运行器。先建立工具行为红灯，再实现规则与入口，最后用现有验收验证兼容性。人工评估案例作为可复用资产，当前不宣称已完成多模型效果实验。

边界：保持现有门禁和运行复用；全局梳理只覆盖本轮目标相关链路；单一明确问题允许简短判断。偏移只在新证据或扩大范围时记录，不增加逐工具日志或第二套任务状态。统一验收若被现存提交身份漂移阻止，按已有 reintegrate 流程在原 Plan 保留旧记录并重验，不改业务、不手写通过证据。

## 输入规格

Feature: docs/features/execution.md。规则依据：AGENTS.md、workflow.md、testing.md。当前事实：docs/designs/execution.md 与 CLI/scaffold 源码。

## 非目标

范围以顶部 non_goals 为准；本轮不改变业务、数据库或部署，不承诺所有模型判断正确，不新增平行状态体系。

## 变更类型

- 类型：`[存量改动]`

完善现有执行规范、模板和接续入口，兼容旧契约；无数据迁移，回退本轮提交可恢复旧行为。既有提交身份漂移按原 Plan 的 reintegrate 处理。

## 测试与验收设计

三个 AC 分别验证精简摘要、下一步选择、实际脚手架草稿。使用隔离 Git 夹具与真实 CLI 调用；每条 AC 先由 tdd runner 记录断言失败。文本入口测试只证明生成契约，不证明 AI 的推理质量。语义评估另见 docs/others/test-cases/execution-focus.md。

## 实现任务

顶部 tasks 是唯一任务进度。整体判断与任务依据见前文，不在正文复制状态。

## 验收方式

先通过 tdd red 记录每条 AC 的真实断言失败，保持对应活动用例不变；修正夹具后 AC-EXECUTION-032 已重新记录。实现后执行 ignite check 的自动范围，并在当前受测提交上绑定 Plan integration；全部纳入 Plan 完成后，由 Release verify 执行最终生产构建和全局生产态浏览器验收。

## 设计回写

回写摘要字段、任务建议优先级、规则入口及验收限制。不改变旧 Plan 的目标与证据。

## 状态记录

首次回归发现隔离夹具缺少旧契约要求的 Release coverage 和 scope，使 AC-EXECUTION-032 先遇到输入校验；已修正夹具，恢复未实施 CLI 后重新记录真实任务接续断言红灯。原记录由 Git 历史保留，从当前证据目录移除，不作为本 Plan 当前证据；未放宽任何输入校验。

三个新增用例与三个历史接续回归已通过。第一次统一运行 run-20261001041619-5af33e 通过 diff 和 template doctor，但治理被现存 SQLite Plan 的不可达 integrated_commit 阻止；按仓库规定处理原 Plan 的 reintegrate，旧提交与证据保留在 integration_history，新的验证仍需真实执行。

确认 SQLite 原始红灯提交也不在当前祖先链，原 Plan 登记历史恢复阻塞；没有改变其业务或制造事后红灯。本轮独立 Plan 不依赖该 Release，继续按自身门禁验证。文档检查暴露本 Plan 正文缺少既定栏目与精确变更类型行，已按现有检查器补齐，未降低检查要求。

Plan integration run-20261001043612-c9234b 已通过工程门禁、全部三个 AC 及 167 个回归测试。作废的首次 AC-EXECUTION-032 记录从当前证据目录移除，Git 保留历史，孤立证据检查通过。八个人工案例已建立，未执行跨模型实验，不声明已证实偏移率降低；最终生产构建和浏览器回归由本 Release 单独验证。

<!-- ignite-progress -->

状态：`done`（由元数据生成）

- [x] T1 · 核对现有目标追溯、检查复用和接续入口，确定主要缺口 · done
- [x] T2 · 建立目标摘要、任务优先和双脚手架的真实红灯基线 · done
- [x] T3 · 落实整体判断、行动取舍、纠偏标准与接续行为 · done
- [x] T4 · 执行适用验收并回写设计与实际限制 · done

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20261001043612-c9234b
<!-- /ignite-progress -->

## 准出条件

三个 AC 的真实红灯和对应绿灯、当前输入的 Plan integration、设计回写完整；Release 最终构建和全局 E2E 独立验证。若现存治理问题阻止统一检查，保留未完成状态和真实限制，不替换或降低门禁。
