<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790833767681868205",
  "release": "execution-prompts-v1",
  "status": "active",
  "outcome": "六项结果有可直接执行的提示词、判断示例和维护边界，AI 入口按阶段引用同一真源",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "P1 明确原始目标、必要条件、实际事实和人的决定边界",
      "requirements": ["REQ-EXECUTION-035"]
    },
    {
      "text": "P2 比较真正阻碍目标的条件，选择能改变决定的检查和适当任务尺度",
      "requirements": ["REQ-EXECUTION-034", "REQ-EXECUTION-035"]
    },
    {
      "text": "P3 依据阶段结果与新证据纠偏，停止无信息探索并保留可推进任务",
      "requirements": ["REQ-EXECUTION-034", "REQ-EXECUTION-035"]
    },
    {
      "text": "P4 回查原始承诺、分层证据和最终版本，明确未完成部分",
      "requirements": ["REQ-EXECUTION-034", "REQ-EXECUTION-035"]
    },
    {
      "text": "P5 提供读者可理解的结果、依据、边界和待定事项",
      "requirements": ["REQ-EXECUTION-034", "REQ-EXECUTION-035"]
    },
    {
      "text": "P6 以实际失败和正反例维护单一提示词真源，区分规则交付与模型效果",
      "requirements": ["REQ-EXECUTION-034", "REQ-EXECUTION-035"]
    }
  ],
  "constraints": [
    "原始目标、任务、权限和工程/Plan/Release 门禁沿用现有真源，不新增平行状态",
    "提示词引用不冒充实际模型效果证据；生成与路由测试只验收真实工具行为",
    "简单任务允许简写，人的产品决定沿用授权，不要求逐工具日志或无依据的评分"
  ],
  "non_goals": ["业务与数据库改动", "普遍保证所有模型正确", "本轮运行跨模型实验", "无关历史修复"],
  "authorization": {
    "source": "用户要求使用更严谨、更科学、符合前面六项的提示词，把全部执行依据维护好"
  },
  "deliverables": [
    "六项执行提示词真源与正反例",
    "按阶段引用的 AI/Feature/Plan/测试入口",
    "带提示词路由的 next 摘要",
    "行为评估与规则维护验收依据"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "2fd19b65c355cfddd531515d644e01bb7074e9e6",
  "requirements": ["REQ-EXECUTION-034", "REQ-EXECUTION-035"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-034",
      "tests": [
        "tests/contracts/execution-prompts.test.ts::[AC-EXECUTION-034] routes real next actions to the same prompt source without replacing action decisions"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-prompts.test.ts::[AC-EXECUTION-034] routes real next actions to the same prompt source without replacing action decisions",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-035",
      "tests": [
        "tests/contracts/execution-prompts.test.ts::[AC-EXECUTION-035] scaffolds stage prompt references for all six results without copying prompts or completion evidence"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-prompts.test.ts::[AC-EXECUTION-035] scaffolds stage prompt references for all six results without copying prompts or completion evidence",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "逐项核对六项必要条件、现有规则与主要缺口，固定验收输入",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "建立真实提示词路由与双脚手架红灯基线",
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "完善六项提示词、判断示例与阶段引用入口",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "复核语义覆盖、权限边界和维护案例并完成工程验收",
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
  "owner": "codex",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "执行提示词、草稿和 next 提示词路由不读写业务数据",
    "migration_impact": "none",
    "rollback": "回退本 Plan 的规则、模板与 CLI 提交",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/plans/20261001-execution-prompts.md",
    "docs/plans/releases/execution-prompts-v1.json",
    "AGENTS.md",
    ".ai/README.md",
    "docs/standards/execution-focus.md",
    "docs/standards/README.md",
    "docs/standards/workflow.md",
    "docs/standards/testing.md",
    "docs/features/execution.md",
    "docs/features/_template.md",
    "docs/plans/_template.md",
    "docs/others/test-cases/_template.md",
    "docs/others/test-cases/execution-focus.md",
    "docs/others/ignite-status.md",
    "docs/designs/execution.md",
    "scripts/ignite/cli.mjs",
    "scripts/create-module.mjs",
    "tests/contracts/execution-prompts.test.ts",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-01"
}
-->

# Ignite 实施计划：execution-prompts

## 状态

顶部元数据与生成进度为状态真源。

## 目标

六项结果有可直接执行的提示词、判断示例和维护边界，AI 入口按阶段引用同一真源。

## 原始目标与覆盖核对

| 用户已确定的领域 | 本轮结果                                                        | REQ                                   | AC                                  | 处理结果                                   |
| ---------------- | --------------------------------------------------------------- | ------------------------------------- | ----------------------------------- | ------------------------------------------ |
| 把任务说准       | P1 明确原始目标、必要条件、实际事实和人的决定边界               | REQ-EXECUTION-035                     | AC-EXECUTION-035                    | 提示词语义人工复核；工具引用由对应 AC 验收 |
| 把行动选对       | P2 比较真正阻碍目标的条件，选择能改变决定的检查和适当任务尺度   | REQ-EXECUTION-034 / REQ-EXECUTION-035 | AC-EXECUTION-034 / AC-EXECUTION-035 | 提示词语义人工复核；工具引用由对应 AC 验收 |
| 把执行守住       | P3 依据阶段结果与新证据纠偏，停止无信息探索并保留可推进任务     | REQ-EXECUTION-034 / REQ-EXECUTION-035 | AC-EXECUTION-034 / AC-EXECUTION-035 | 提示词语义人工复核；工具引用由对应 AC 验收 |
| 把完成判断做实   | P4 回查原始承诺、分层证据和最终版本，明确未完成部分             | REQ-EXECUTION-034 / REQ-EXECUTION-035 | AC-EXECUTION-034 / AC-EXECUTION-035 | 提示词语义人工复核；工具引用由对应 AC 验收 |
| 把事情讲明白     | P5 提供读者可理解的结果、依据、边界和待定事项                   | REQ-EXECUTION-034 / REQ-EXECUTION-035 | AC-EXECUTION-034 / AC-EXECUTION-035 | 提示词语义人工复核；工具引用由对应 AC 验收 |
| 把执行依据维护好 | P6 以实际失败和正反例维护单一提示词真源，区分规则交付与模型效果 | REQ-EXECUTION-034 / REQ-EXECUTION-035 | AC-EXECUTION-034 / AC-EXECUTION-035 | 提示词语义人工复核；工具引用由对应 AC 验收 |

来源：前文已确定六项分类；本轮用户要求把符合六项的严谨提示词全部维护好。不能把两条工具 AC 的通过解释为六项判断质量已获模型实证。

## 整体判断与推进顺序

事实：六项上一轮已在标准中提及，但任务尺度与取舍主要是原则；AGENTS、Plan 和脚手架有入口，next 保留目标但没有提示词路由。现有原始目标、分层验收、运行复用和权限边界可以沿用。

主要问题：缺少让执行者按事实比较条件、选择行动并及时修正的明确提示词。先完善 P2 的条件比较、可推翻依据和检查选择，同时让 P1/P3/P4/P5/P6 在各自结果上闭合；工具引用服务于这些提示词。提示词维护在原标准，入口只引用，避免新增另一套规范和任务表。

推进：固定六项结果与工具真实行为测试，记录红灯；将标准改为六项直接执行提示词并配正反例；接入 next 与双脚手架；按六项逐条复核覆盖、权限、尺度与科学依据，再运行现有门禁。未知：实际不同模型行为效果，本轮不使用模板绿灯推断它已改善。

纠偏：发现条款诱导过度分析、重复审批、忽略真实风险或伪称完成时在原 Plan 修改条款和相应案例；引用与行为测试失败修原入口，不新增计划。排查得到足以决定修正的信息时结束，正式验收仍按现有契约。

## 非目标

以顶部 non_goals 为准。

## 变更类型

- 类型：`[存量改动]`

后续改进已交付规范，保留上轮 Plan 与证据。无业务数据迁移，回退本轮提交即可恢复。

## 输入规格

docs/features/execution.md、AGENTS.md、docs/standards/workflow.md、docs/standards/testing.md、docs/designs/execution.md 与对应 CLI/脚手架。科学依据只用于设计原则，适用条件写入标准。

## 测试与验收设计

AC-EXECUTION-034 调用真实 next，检查当前动作路由、摘要与详细引用一致且不替换行动。AC-EXECUTION-035 在隔离 Git 夹具实际生成两种草稿，检查六项引用、单一正文与未完成状态。测试不判定自然语言判断正确。

人工复核另按六项逐条检查提示词输入、处理的问题、结果、边界、正反例与维护方法，在本 Plan 保留结论；模型行为对照另在执行评估案例中规定，未运行时明确未实证。

## 实现任务

顶部 tasks 为唯一任务状态，正文只保存判断依据。

## 验收方式

提交 Feature/Plan/真实测试后逐 AC 记录真实断言红灯；目标测试保持不变。实现后运行 ignite check --level auto 完成工程与 Plan integration，完成 Plan 后用 Release verify 对最终版本完成生产构建与全局生产态 E2E。

## 设计回写

回写六项提示词真源、next 路由字段与边界；模板测试不证明模型效果。

## 状态记录

逐项覆盖核对完成；两条工具 AC 已定义，尚未实施或验证。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 逐项核对六项必要条件、现有规则与主要缺口，固定验收输入 · done
- [ ] T2 · 建立真实提示词路由与双脚手架红灯基线 · doing
- [ ] T3 · 完善六项提示词、判断示例与阶段引用入口 · todo
- [ ] T4 · 复核语义覆盖、权限边界和维护案例并完成工程验收 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

六项提示词人工复核结论可追溯；两个 AC 的真实红灯与绿灯、当前版本 Plan integration、Design 回写完整。Release 独立完成最终构建和浏览器回归。未执行模型实验的限制明确保留。
