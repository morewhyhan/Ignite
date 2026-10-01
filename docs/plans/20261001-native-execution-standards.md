<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790838314910384474",
  "release": "native-execution-standards-v1",
  "status": "active",
  "outcome": "正常使用现有文档即可执行六项标准，无需额外提示词及路由",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "接续直接保留原始目标与行动，移除提示词路由",
      "requirements": ["REQ-EXECUTION-036"]
    },
    {
      "text": "六项标准归入原有文档，生成草稿在对应位置支持实际判断",
      "requirements": ["REQ-EXECUTION-037"]
    }
  ],
  "constraints": [
    "保留目标追溯、任务接续、真实 TDD 与三层验收",
    "每项规则只在其所属标准维护，模板仅提供填写位置",
    "人决定产品边界，不用文本或生成测试冒充模型行为效果"
  ],
  "non_goals": [
    "不改变业务 UI、API、认证或数据库",
    "不新增提示词、阶段代码或任务状态",
    "本轮不运行模型对照实验，也不改写已完成的历史 Plan"
  ],
  "authorization": {
    "source": "用户已要求直接落实六项改动，本轮纠正为自然融入现有文档体系，拒绝额外提示词约束"
  },
  "deliverables": [
    "docs/standards/workflow.md",
    "docs/standards/testing.md",
    "docs/standards/ai-agents.md",
    "docs/plans/_template.md",
    "docs/features/_template.md",
    "scripts/ignite/cli.mjs"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "da4580b29423968ad9d26f60e932bc25cd7a6268",
  "requirements": ["REQ-EXECUTION-036", "REQ-EXECUTION-037"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-036",
      "tests": [
        "tests/contracts/native-execution.test.ts::[AC-EXECUTION-036] resumes real Plan states without an extra prompt router and preserves decisions and context"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/native-execution.test.ts::[AC-EXECUTION-036] resumes real Plan states without an extra prompt router and preserves decisions and context",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-037",
      "tests": [
        "tests/contracts/native-execution.test.ts::[AC-EXECUTION-037] generates native requirement and Plan drafts without prompt dependencies or completion evidence"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/native-execution.test.ts::[AC-EXECUTION-037] generates native requirement and Plan drafts without prompt dependencies or completion evidence",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-038",
      "tests": [
        "tests/contracts/historical-release-scope.test.ts::[AC-EXECUTION-038] validates completed Release coverage at its tested specification and rejects gaps and unfinished snapshots"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/historical-release-scope.test.ts::[AC-EXECUTION-038] validates completed Release coverage at its tested specification and rejects gaps and unfinished snapshots",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "识别现有行为、写入边界和原始目标",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "补充需求和目标行为测试",
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "status": "done"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "status": "doing"
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
    "access_rationale": "仅执行工具及文档，无业务数据",
    "migration_impact": "none",
    "rollback": "撤回本轮提交，保留历史证据",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/plans/20261001-native-execution-standards.md",
    "docs/plans/releases/native-execution-standards-v1.json",
    "AGENTS.md",
    ".ai/README.md",
    "docs/standards/",
    "docs/features/_template.md",
    "docs/features/execution.md",
    "docs/plans/_template.md",
    "docs/others/test-cases/_template.md",
    "docs/others/test-cases/execution-focus.md",
    "docs/designs/execution.md",
    "docs/standards/adoption.md",
    "scripts/create-module.mjs",
    "scripts/ignite/cli.mjs",
    "tests/contracts/native-execution.test.ts",
    "tests/contracts/execution-focus.test.ts",
    "tests/contracts/execution-prompts.test.ts",
    "docs/others/evidence/tdd/",
    "scripts/ignite/state.mjs",
    "tests/contracts/historical-release-scope.test.ts"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-036",
      "test": "tests/contracts/native-execution.test.ts::[AC-EXECUTION-036] resumes real Plan states without an extra prompt router and preserves decisions and context",
      "run_id": "tdd-20261001071609-b16018"
    },
    {
      "acceptance_id": "AC-EXECUTION-037",
      "test": "tests/contracts/native-execution.test.ts::[AC-EXECUTION-037] generates native requirement and Plan drafts without prompt dependencies or completion evidence",
      "run_id": "tdd-20261001071640-0c71a2"
    },
    {
      "acceptance_id": "AC-EXECUTION-038",
      "test": "tests/contracts/historical-release-scope.test.ts::[AC-EXECUTION-038] validates completed Release coverage at its tested specification and rejects gaps and unfinished snapshots",
      "run_id": "tdd-20261001072956-82f9b6"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-01"
}
-->

# Ignite 实施计划：执行标准归回现有文档

## 状态

状态和任务进度以顶部元数据为准。

## 目标

六项结果保留，执行依据直接放入需求、Plan、测试与现有标准。删除上一轮引入的独立提示词文件、阶段编号与 next 路由。

## 原始目标与覆盖核对

| 原始要求                                 | 本轮结果                                         | REQ               | AC               | 处理                         |
| ---------------------------------------- | ------------------------------------------------ | ----------------- | ---------------- | ---------------------------- |
| 不通过额外提示词约束，自然落实到文档体系 | 删除独立文件及路由，保留正常接续上下文           | REQ-EXECUTION-036 | AC-EXECUTION-036 | 纳入                         |
| 前面六项全部维护好                       | 归回各自文档，模板直接提供行为和判断位置         | REQ-EXECUTION-037 | AC-EXECUTION-037 | 纳入；内容复核不冒充模型实验 |
| 防止抓次要矛盾及执行偏移，人把控产品     | 整体判断、尺度、纠偏、真实完成与授权边界继续保留 | REQ-EXECUTION-037 | AC-EXECUTION-037 | 纳入                         |

## 整体判断与推进顺序

主要问题是规则落在文档体系外，正常使用还须跳转六段提示词。增加更多提示词会加重这个问题。先确认原有文档的职责，再把适用标准归回真源、更新草稿、删除路由，最后验证实际生成和接续不依赖已删资产。

| 结果分类         | 处理的问题                       | 原有文档中的落点                                     | 复核结果要求                                             |
| ---------------- | -------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| 把任务说准       | 原始目标被遗漏或由 AI 猜产品决定 | workflow 输入；Feature 行为与边界；Plan 原始目标核对 | 读者能区分正确结果、错误结果和待人决定的部分             |
| 把行动选对       | 局部问题深挖、任务与检查失去尺度 | workflow 整体判断；Plan 推进顺序；testing 检查选择   | 先看相关完整链路，重点来自必要条件及证据，检查能改变行动 |
| 把执行守住       | 新证据未纠偏、重复排查、接续偏移 | workflow 执行反馈与恢复；Plan 当前判断               | 阶段结果能核对原目标，局部停止不误阻塞独立任务           |
| 把完成判断做实   | 局部绿色冒充原始目标完成         | workflow 准出；testing 证据；Plan 原映射             | 逐项承诺对应正确层级和版本，缺口明确保留                 |
| 把事情讲明白     | 术语堆积、人无法把控             | workflow 沟通与报告                                  | 先复述目标，报告结果、依据、未完成项与必要决定           |
| 把执行依据维护好 | 重复规则、口号加码、维护无反馈   | ai-agents 维护；现有行为评估案例                     | 修改针对失败原因，在原真源维护，正反例及未验证边界明确   |

新工具验收只证明实际输出与生成；上表需作者逐项复核。没有独立读者或真实模型评估时，不声称已经完成这些实证。

纠偏条件：归并导致必要边界消失、出现新的平行规则、草稿还依赖已删除文件时回到归并步骤。诊断到行为断言失败即可停止扩散，正式门禁按仓库规则执行。

## 非目标

业务功能与数据不变；不重跑已完成的旧 Plan，不新增模型运行框架。既有提示词交付记录保留为历史，本轮替换当前实现。

## 变更类型

- 类型：`[存量改动]`

回滚以撤回本轮提交恢复旧工具及文档，无数据迁移。

## 输入规格

执行 Feature、执行 Design、workflow/testing/ai-agents、Feature/Plan/测试模板、实际脚手架及 CLI。采用边界是模板执行工具改善，不是任何衍生产品已验收。

## 已关闭问题

用户已授权修正实施方式；使用现有文档，无新产品决定或权限。

## 测试与验收设计

AC-EXECUTION-036 实际调用 next，覆盖五类状态、两种输出及目标约束保留。AC-EXECUTION-037 在两个隔离 Git 夹具实际生成草稿，验证正常文档入口、填写位置、无旧文件依赖和无完成证据。AC-EXECUTION-038 用真实 Git 规格快照验证历史覆盖，缺失 Plan、未知目标、遗漏旧 AC 和未完成状态分别拒绝。文档质量另按六项及正反例复核，不用关键词测试证明 AI 更聪明。

## 实现任务

顶部 tasks 是唯一进度。原 AC-EXECUTION-034/035 随旧能力从当前 Feature 与测试移除，已完成 Plan 按历史提交验证；AC-EXECUTION-033 的通用执行标准入口改指正常 workflow。

## 验收方式

三条 AC 均先提交稳定测试并由 runner 记录真实断言红灯，实施后同一测试变绿。按 auto 运行 Plan integration；全部任务完成并提交后运行一次新 Release 最终验收。复用匹配输入的证据。

## 设计回写

execution Design 记录真实文档归属、草稿行为及直接接续输出。adoption 记录模板采用边界。

## 状态记录

实际 next 与两种脚手架的五个定向用例通过。六项已归回原有工作流、测试与维护标准，独立提示词及路由删除。复核发现旧 Release 覆盖仍使用当前规格，删除退役 AC 后会产生历史假错误；增加 AC-EXECUTION-038，验证按被测提交解释已完成组合，同时继续拒绝遗漏、未知目标及未完成快照。这是保留原记录所需的兼容修复，不扩大到其他执行器重构。

作者内容复核结论：需求在 workflow 的“需求写到能判断行为”定义正确/错误结果及人的决定边界，Feature 提供行为表；行动在“Plan 写到能选择下一步”和 testing 的检查尺度中定义相关完整链路、必要条件、竞争方向和不同观察结果；执行反馈明确阶段触发与局部停止；完成回写逐项核对原始承诺、层级及版本；沟通单列复述、事实依据和读者理解；维护在 ai-agents 原条款中定义失败归因、归属、正反例及效果证据。保存与间距、纯文案、新权限风险三类尺度反例保留。正常任务无需另填六表、评分或重读提示词。这是作者复核，独立读者理解与九个模型行为案例均未实际评估。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [x] T2 · 补充需求和目标行为测试 · done
- [x] T3 · 实施最小存量修改 · done
- [ ] T4 · 验证兼容性并回写设计 · doing

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

新 AC 通过、无活动提示词入口或断链、六项内容和尺度复核完成、Design 已回写、真实红灯及当前集成证据有效。模型行为效果未实测须明确说明。
