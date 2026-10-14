<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791976482786711869",
  "release": "startup-focus-v1",
  "status": "active",
  "outcome": "首次开工使用已有正文和缓存，准备阶段持续产生规格，保留真实审查与验收",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [
    {
      "stage": "draft",
      "executor": "/root",
      "reviewer": "/root/startup_draft_review",
      "source": "Codex collaboration sub-agent dispatched by /root as /root/startup_draft_review",
      "subject_fingerprint": "c27efb8b689c52962b158a9c9dd036d80bf4f55a114df371e2b7ff56a9eeb0e5",
      "verdict": "approved",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-10-14T11:48:49.299Z"
    }
  ],
  "verification_contract": 2,
  "goals": [
    {
      "text": "同版本方法正文优先直接读取并复用，减少重复阅读和不必要的 WSL 审批调用",
      "requirements": ["REQ-EXECUTION-055"]
    },
    {
      "text": "依赖安装等待期间先整理已明确需求，只在实际依赖测试工具时等待环境",
      "requirements": ["REQ-EXECUTION-055"]
    },
    {
      "text": "隔离各项目 node_modules 并复用现有下载缓存，不用项目准备改全局配置",
      "requirements": ["REQ-EXECUTION-055"]
    }
  ],
  "constraints": [
    "最少改动；保留完整技能正文、固定职责、真实红灯、独立双审查和分层验收",
    "不新增调度器、适配文件或状态账本；不把规则检查当作模型实证"
  ],
  "non_goals": ["不重跑学生项目、不保证宿主审批成功、不作模型性能比较、不推送部署"],
  "authorization": {
    "source": "2026-10-14 用户启用 poteto-mode 并要求“从本质，用最少的改动修正问题”"
  },
  "deliverables": [
    "统一正文读取规则及直接读取优先的原生索引",
    "依赖等待与缓存隔离的现有采用/Plan 条款",
    "原生红灯、兼容性检查与独立交付复核"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "bf3fef82e91d688ed4eab78f445830b69f08c185",
  "requirements": ["REQ-EXECUTION-055"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-055",
      "tests": ["tests/contracts/document-method-entry.test.ts::[AC-EXECUTION-055]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/document-method-entry.test.ts::[AC-EXECUTION-055]",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "确认最小修复及独立开工复核",
      "phase": "prepare",
      "status": "done",
      "result": "三项已确认目标、来源、层级和写入范围完整，独立 draft 复核成立",
      "scope": [
        "docs/features/execution.md",
        "docs/plans/20261014-startup-focus.md",
        "docs/plans/releases/startup-focus-v1.json"
      ],
      "depends_on": [],
      "owner": "/root"
    },
    {
      "id": "T2",
      "title": "记录直接读取优先缺失的真实红灯",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-055"],
      "status": "doing",
      "result": "原生索引成功返回但目标读取优先断言失败，红灯凭证绑定实际测试",
      "scope": ["tests/contracts/document-method-entry.test.ts", "docs/others/evidence/tdd/"],
      "depends_on": ["T1"],
      "owner": "/root"
    },
    {
      "id": "T3",
      "title": "收敛读取与开工准备入口",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-055"],
      "status": "todo",
      "result": "读取入口优先原生文件；共同规则复用；安装等待与缓存范围清楚，既有 gate 保留",
      "scope": [
        "docs/features/README.md",
        "docs/plans/README.md",
        "docs/designs/README.md",
        "docs/standards/ai-agents.md",
        "docs/standards/testing.md",
        "docs/others/evidence/README.md",
        "docs/others/adr/README.md",
        "docs/plans/releases/README.md",
        "docs/others/test-cases/README.md",
        "docs/standards/adoption.md",
        "scripts/ignite/skill-reader.mjs"
      ],
      "depends_on": ["T2"],
      "owner": "/root"
    },
    {
      "id": "T4",
      "title": "验证兼容入口并回写事实",
      "phase": "verify",
      "status": "todo",
      "result": "原生 integration、独立 delivery 和 Design 一致；Release 单独验证最终版本",
      "scope": ["docs/designs/execution.md", "docs/others/evidence/"],
      "depends_on": ["T3"],
      "owner": "/root"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": ["tests/contracts/document-method-entry.test.ts::[AC-EXECUTION-055]"],
    "remaining": []
  },
  "owner": "/root",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "仅改读取索引和工程规则，不访问业务数据",
    "migration_impact": "none",
    "rollback": "还原本轮文档和索引差异；没有数据迁移",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/README.md",
    "docs/plans/README.md",
    "docs/designs/README.md",
    "docs/standards/ai-agents.md",
    "docs/standards/testing.md",
    "docs/others/evidence/README.md",
    "docs/others/adr/README.md",
    "docs/plans/releases/README.md",
    "docs/others/test-cases/README.md",
    "docs/standards/adoption.md",
    "scripts/ignite/skill-reader.mjs",
    "docs/features/execution.md",
    "tests/contracts/document-method-entry.test.ts",
    "docs/designs/execution.md",
    "docs/others/evidence/",
    "docs/plans/20261014-startup-focus.md",
    "docs/plans/releases/startup-focus-v1.json"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-14"
}
-->

# Ignite 实施计划：startup-focus

## 状态

状态与任务以元数据和原生生成进度为准。

## 目标

让开工准备使用最短可靠入口并持续产出规格，保留准确性约束。

## 原始目标与覆盖核对

| 用户来源                                             | 本轮结果                                         | REQ               | AC               | 处理                               |
| ---------------------------------------------------- | ------------------------------------------------ | ----------------- | ---------------- | ---------------------------------- |
| “从本质，用最少的改动修正问题”，结合上一轮已确认诊断 | 直接正文读取与复用、安装时推进规格、正确缓存边界 | REQ-EXECUTION-055 | AC-EXECUTION-055 | 全部纳入；规则内容另作独立语义复核 |

## 整体判断与推进顺序

实际试验在环境准备和方法阅读后仍停在草稿；执行者报告安装 18 分 3.3 秒、新建缓存和重复方法读取。27 次方法引用对应 13 种正文，现有索引引导逐次 CLI 调用。只改已知入口，不据此推断所有剩余耗时或模型能力。
先用实际 CLI 证明默认入口没有原生文件优先声明，再更正单行索引协议和共同规则。移除九处重复读取协议，职责列表仍在原处。已知需求可直接写草稿；环境等待不影响规格，但不提前实现或跳过红灯。所有方法仍在原生真源，阶段性应用不等于省略职责。无需为这些紧耦合小改动派发开发 worker；固定双审查使用真实独立角色。

## 非目标

本轮不重跑学生试验，不承诺审批或任意模型行为，不增加调度层。

## 变更类型

存量工程改动。一个结果、一份 Plan；还原此差异即可回退。

## 输入规格

Feature execution 的 REQ-EXECUTION-055；ai-agents、Plan、adoption 原真源和已有 method-entry 契约。

## 已关闭问题

用户已授权最小修复。先修可靠入口，不改变技能内容和业务规格。

## 测试与验收设计

真实 CLI 索引输出 native-file 首选及安全 canonical 路径；沿现有 CLI fallback 读取同一完整正文。规则内容按三项原目标复核，程序测试不证明模型已实际执行。

## 实现任务

以 tasks 为唯一状态；本轮只需一个独占实现切片。

## 验收方式

记录同一测试的原生红灯；通过本 Plan integration，随后独立 delivery。done 后 Release 对最终版本验证。

## 设计回写

execution.md 记录实际入口和仍需宿主/模型实测的边界。

## 状态记录

2026-10-14：拟删除重复读取协议，以已有规则承载修复；未改模板技能正文。

## 准出条件

AC 原生证据、三项规则语义复核、兼容入口与 Design 一致。模型自然执行效果仍需另行实测，不能冒充已通过。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 确认最小修复及独立开工复核 · done
- [ ] T2 · 记录直接读取优先缺失的真实红灯 · doing
- [ ] T3 · 收敛读取与开工准备入口 · todo
- [ ] T4 · 验证兼容入口并回写事实 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
