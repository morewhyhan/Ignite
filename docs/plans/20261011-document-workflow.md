<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791708512635291997",
  "release": "document-workflow-v1",
  "status": "active",
  "outcome": "克隆后的 AI 能按精细任务与固定双审查维护唯一文档真源，官方准入识别缺失与过期结果",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "verification_contract": 2,
  "goals": [
    {
      "text": "精细化 Plan 的任务产出、写入范围与依赖，并让脚手架直接提供合格结构",
      "requirements": ["REQ-DOCFLOW-001"]
    },
    {
      "text": "拒绝任务无结果、越界和循环依赖，接续遵守未完成依赖",
      "requirements": ["REQ-DOCFLOW-002"]
    },
    {
      "text": "固定开工和交付的独立审查，版本变化使相关审查失效，保持身份可信度说明",
      "requirements": ["REQ-DOCFLOW-003"]
    },
    {
      "text": "整合 AGE 高价值方法与原有文档，技能正文可读、入口单一，保留稳定业务与原始来源",
      "requirements": ["REQ-DOCFLOW-004"]
    }
  ],
  "constraints": [
    "保留真实红灯、REQ/AC 分层、版本绑定、唯一任务状态、Release 验收和模板清理边界",
    "使用 WSL NVM Node 24.19.0，不共享 Windows 依赖",
    "保留当前业务、数据库及权限行为；不引入第二规则真源或独立适配提示词"
  ],
  "non_goals": [
    "完整搬入 AGE 引擎或宿主插件",
    "重建一整套 backlog、日志和审计目录",
    "再次开发学生系统或进行模型速度实验",
    "宣称 CLI 可验证任意宿主身份或阻止所有直接写文件"
  ],
  "authorization": {
    "source": "本会话用户要求逐项落实取舍、继续对照 AGE 并重构当前文档体系，特别强调 Plan 精细化"
  },
  "deliverables": [
    "docs/plans/README.md",
    "docs/plans/_template.md",
    "scripts/ignite/",
    "docs/README.md",
    ".ai/skills/review-plan/SKILL.md",
    ".ai/skills/review-delivery/SKILL.md"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "3e32ce4e392a6604f34f7476c7f13c811afab9e9",
  "requirements": ["REQ-DOCFLOW-001", "REQ-DOCFLOW-002", "REQ-DOCFLOW-003", "REQ-DOCFLOW-004"],
  "acceptance": [
    {
      "id": "AC-DOCFLOW-001",
      "tests": [
        "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-001] scaffolds executable task detail"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-001] scaffolds executable task detail",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-DOCFLOW-002",
      "tests": [
        "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-002] rejects incomplete task contracts",
        "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-002] preserves legacy task contract behavior"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-002] rejects incomplete task contracts",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-002] preserves legacy task contract behavior",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-DOCFLOW-003",
      "tests": [
        "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-003] requires current independent review records"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-003] requires current independent review records",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-DOCFLOW-004",
      "tests": [
        "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-004] loads project review methods from canonical sources"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-004] loads project review methods from canonical sources",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "独立审查原目标、任务和真实断言",
      "phase": "prepare",
      "status": "done",
      "result": "真实独立角色/root/docflow_plan_review及/root/workflow_docs读取本Plan、原目标、Feature与Release；五类发现逐项修正留原Plan，复核无阻断后提交真实断言",
      "scope": [
        "docs/features/document-workflow.md",
        "docs/plans/20261011-document-workflow.md",
        "docs/plans/releases/document-workflow-v1.json",
        "tests/contracts/document-workflow.test.ts"
      ],
      "depends_on": [],
      "owner": "/root"
    },
    {
      "id": "T2",
      "title": "提交规格和断言并取得真实红灯",
      "phase": "red",
      "acceptance": ["AC-DOCFLOW-001", "AC-DOCFLOW-002", "AC-DOCFLOW-003", "AC-DOCFLOW-004"],
      "status": "done",
      "result": "四条原生红灯均因承诺行为尚未实现而失败",
      "scope": ["tests/contracts/document-workflow.test.ts", "docs/others/evidence/tdd/"],
      "depends_on": ["T1"],
      "owner": "/root"
    },
    {
      "id": "T3A",
      "title": "生成精细任务脚手架",
      "phase": "implement",
      "acceptance": ["AC-DOCFLOW-001"],
      "status": "done",
      "result": "模块和存量脚手架一致生成result、scope、depends_on、owner与新契约，保持唯一状态",
      "scope": [
        "scripts/create-change.mjs",
        "scripts/create-module.mjs",
        "docs/plans/_template.md"
      ],
      "depends_on": ["T2"],
      "owner": "/root/workflow_tooling"
    },
    {
      "id": "T3B",
      "title": "约束任务完整性与依赖推进",
      "phase": "implement",
      "acceptance": ["AC-DOCFLOW-002"],
      "status": "done",
      "result": "prepare、task与next拒绝缺结果、越界、未知或循环依赖；依赖未完成不能启动；旧格式保持旧语义",
      "scope": ["scripts/ignite/"],
      "depends_on": ["T2"],
      "owner": "/root/workflow_tooling"
    },
    {
      "id": "T3C",
      "title": "实现两个审查对象与正式准入",
      "phase": "implement",
      "acceptance": ["AC-DOCFLOW-003"],
      "status": "done",
      "result": "context/record保存真实来源及对象；draft准入与delivery准出拒绝自查、过期和未解决阻断；状态回填不误失效",
      "scope": ["scripts/ignite/"],
      "depends_on": ["T3A", "T3B"],
      "owner": "/root"
    },
    {
      "id": "T4",
      "title": "重构稳定业务入口、需求来源和事实冲突处理",
      "phase": "implement",
      "acceptance": ["AC-DOCFLOW-004"],
      "status": "done",
      "result": "新会话可从现有入口找到真实业务与代码；原始材料有唯一职责；冲突分类和技能步骤无平行真源",
      "scope": [
        "docs/README.md",
        "docs/features/README.md",
        "docs/designs/README.md",
        "docs/designs/domain.md",
        "docs/others/README.md",
        "docs/others/inputs/",
        "docs/standards/ai-agents.md"
      ],
      "depends_on": ["T2"],
      "owner": "/root/workflow_document_writer"
    },
    {
      "id": "T5",
      "title": "迁入两份审查方法并统一 Plan 规则与生成入口",
      "phase": "implement",
      "acceptance": ["AC-DOCFLOW-004"],
      "status": "done",
      "result": "计划和交付审查可在克隆内按名读取，正文只有一份且附来源许可",
      "scope": [
        ".ai/skills/",
        ".ai/pstack/skills/poteto-mode/",
        ".agents/",
        ".claude/",
        ".ai/README.md",
        ".ai/pstack/CATALOG.md",
        ".ai/pstack/sources.json",
        "docs/plans/README.md",
        "AGENTS.md"
      ],
      "depends_on": ["T2"],
      "owner": "/root"
    },
    {
      "id": "T6",
      "title": "集成并独立审查真实结果与文档一致性",
      "phase": "verify",
      "status": "doing",
      "result": "四项AC与兼容回归通过；另行派发独立角色读取真实diff、方法与证据，发现回到原Plan修复；Design已回写",
      "scope": [
        "docs/designs/execution.md",
        "docs/features/document-workflow.md",
        "docs/plans/",
        "docs/others/evidence/",
        "docs/others/test-cases/",
        "docs/standards/adoption.md"
      ],
      "depends_on": ["T3A", "T3B", "T3C", "T4", "T5"],
      "owner": "/root"
    },
    {
      "id": "T7",
      "title": "核对 Plan 准出与 Release 最终验收交接",
      "phase": "verify",
      "status": "todo",
      "result": "Plan 目标、当前证据和独立交付审查完整，Release scope 与被测版本一致；最终构建和生产 E2E 由 Release 自身验收，不提前填写通过。",
      "scope": ["docs/plans/", "docs/others/evidence/"],
      "depends_on": ["T6"],
      "owner": "/root"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": {
    "interfaces": [
      "root维护Plan与固定触发；工具worker负责契约字段、CLI与模板；文档worker不写Plan规则；先确认接口与真实红灯再分区实施"
    ],
    "migrations": [],
    "tests": [
      "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-001] scaffolds executable task detail",
      "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-002] rejects incomplete task contracts",
      "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-003] requires current independent review records",
      "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-004] loads project review methods from canonical sources",
      "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-002] preserves legacy task contract behavior"
    ],
    "remaining": []
  },
  "owner": "/root",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "仅修改文档方法与本地工程工具，无业务数据访问",
    "migration_impact": "none",
    "rollback": "按提交还原规则和工具；历史 Plan 未启用新契约时保留旧语义",
    "destructive_authorization": null
  },
  "write_scope": [
    "AGENTS.md",
    "docs/",
    "scripts/",
    "tests/contracts/",
    ".ai/",
    ".agents/",
    ".claude/",
    "CLAUDE.md",
    ".cursor/",
    ".opencode/",
    ".github/copilot-instructions.md"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-DOCFLOW-004",
      "test": "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-004] loads project review methods from canonical sources",
      "run_id": "tdd-20261011111441-bfaa75"
    },
    {
      "acceptance_id": "AC-DOCFLOW-001",
      "test": "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-001] scaffolds executable task detail",
      "run_id": "tdd-20261011142815-287daf"
    },
    {
      "acceptance_id": "AC-DOCFLOW-002",
      "test": "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-002] rejects incomplete task contracts",
      "run_id": "tdd-20261011142840-bda6e9"
    },
    {
      "acceptance_id": "AC-DOCFLOW-003",
      "test": "tests/contracts/document-workflow.test.ts::[AC-DOCFLOW-003] requires current independent review records",
      "run_id": "tdd-20261011142910-b0f23c"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-11",
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [
    {
      "stage": "draft",
      "reviewer": "/root/workflow_independent_audit",
      "executor": "/root",
      "source": "本会话独立子智能体 /root/workflow_independent_audit 对当前 .ignite/draft-context.json、原目标、Plan、Feature、Release、AGE 对标和方法文档的真实审查回报",
      "subject_fingerprint": "dd62cc2df94c39ef69841971b502e674551cd748721069465fed78ada72f6ba8",
      "verdict": "approved",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-10-11T15:15:21.161Z"
    },
    {
      "stage": "draft",
      "reviewer": "/root/workflow_independent_audit",
      "executor": "/root",
      "source": "本会话独立子智能体 /root/workflow_independent_audit 对当前 .ignite/draft-context.json、原目标、Plan、Feature、Release、AGE 对标和方法文档的真实审查回报",
      "subject_fingerprint": "11207d807c8d55911bc12af5ab8c2047b0ced3ec9bef7fe7175ba061c1177243",
      "verdict": "approved",
      "findings": [
        {
          "id": "NB-T7-001",
          "severity": "nonblocking",
          "summary": "准出正文的最终组合验收可追溯措辞较宽；T7已明确为Release scope和版本交接，真实最终验收由Release完成。",
          "resolved": false
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-10-11T15:39:31.574Z"
    }
  ]
}
-->

# Ignite 实施计划：document-workflow

## 状态

状态与任务由顶部元数据管理，正文不维护第二份状态。

## 目标

原生工具和文档一起支持精细任务与固定双审查，维护稳定系统而不是只清空任务。

## 原始目标与覆盖核对

| 用户原话或来源                            | 本轮目标                                     | REQ             | AC             | 处理结果                                 |
| ----------------------------------------- | -------------------------------------------- | --------------- | -------------- | ---------------------------------------- |
| “普兰的精细化，其实你就没有做好”          | 任务必须有结果、范围与依赖；脚手架提供结构   | REQ-DOCFLOW-001 | AC-DOCFLOW-001 | 纳入                                     |
| “逐一对照，把这些事情做好”                | 原生检查拒绝笼统、越界或错误顺序任务         | REQ-DOCFLOW-002 | AC-DOCFLOW-002 | 纳入                                     |
| 已确认取舍：独立计划和交付审查            | 固定审查触发、对象指纹与非自查记录，接入准入 | REQ-DOCFLOW-003 | AC-DOCFLOW-003 | 纳入                                     |
| “整个当前的文档体系…重构好”，继续参考 AGE | 现有职责内整合稳定入口、来源与高价值方法     | REQ-DOCFLOW-004 | AC-DOCFLOW-004 | 纳入；内容独立核对，程序只证明可读及入口 |

## 整体判断与推进顺序

已有事实：Plan 任务仅强制 ID、标题、状态，未强制结果、局部范围和任务依赖。已有准备结构检查和真实行为验收，但没有默认独立语义审查。AGE 提供两个审查方法及更明确职责，不等于其插件在 Codex 已接通。

主要问题：规则和实际准入断开。因此先固定规格与真实 CLI 断言，再实现任务和审查结构；文档与技能分工写入互不重叠的范围，最后由同一 Plan 集成。

设计取舍：候选一在现有 Plan 中保存审查记录与对象指纹，复用原状态和运行；候选二新增外部阶段账本及引擎。选候选一，减少重复状态。审查身份基于宿主实际派发或人复核，CLI 只校验声明、非同一执行者、对象及发现，不宣称密码学身份认证。

任务结构保留 task_contract 2，并引入可渐进采用的 planning_contract 1。每个任务声明 result、scope、depends_on、owner；任务状态仍唯一。审查使用独立 review_contract 1，不默认为历史 Plan 伪造通过。

纠偏：发现结构改动迫使全部旧 Plan 重写时调整兼容；审查指纹不能因纯状态及证据回填失效；实际目标、测试、代码或受审规则变化必须失效。重复检查复用原 run，无新信息失败改变取证。

### 双审查与兼容的执行约定

开工审查由已实际派发的 `/root/docflow_plan_review` 对草稿逐项核对，五类发现留在本 Plan；缺口修正后请求独立确认。新工具实现后以原生 context 生成对象，由实际独立角色审查再 record；不把过去摘要伪装成新对象的批准。T1负责准备审查，T6负责实际交付审查与发现回流。

记录字段为 stage、reviewer、executor、source、subject_fingerprint、verdict、findings。阶段仅 draft/delivery；身份是实际宿主来源声明，CLI 只能核对声明独立，不能认证任意身份。未解决阻断发现不能 approved。draft 受审对象是原目标、Plan 语义及关联 Feature；delivery 还包含真实实现与测试版本。状态、任务进度、审查及运行回填不改变语义对象；目标、任务结果/范围/依赖或关联规格改变使 draft 过期，实现输入改变使 delivery 过期。

T3A/T3B/T3C按连续行为分别实施：脚手架字段生成（AC001）、prepare/task/next任务准入及依赖推进和旧格式回归（AC002）、两个审查对象及有效性准入（AC003）。它们同一工具负责人写入，避免共享文件并发。T4负责业务、来源与冲突职责；T5负责固定方法和入口；T6独立核对这些职责的内容质量，AC004的技能读取测试不冒充语义质量证明。

新脚手架显式启用 planning_contract:1 和 review_contract:1。缺少这两个字段的历史 Plan，包括 task_contract:1/2，仍按原规则解释，不自动升级也不声称经过新审查。显式新契约在准备、启动、接续及准出执行对应规则。本轮是工具自举，准备沿用旧入口；新工具落地后补真实对象审查再采用新契约，禁止倒填通过。

兼容约束：已有依赖合同、有效运行复用、Design 回写、真实红灯和 Release 分层验收继续沿用；它们不是本轮新增功能。具体来源为用户本轮原话以及 TEMP/文档体系优化取舍与计划.md 的逐项建议；临时报告不成为规范真源。

2026-10-11 独立审查提出五类缺口：审查对象与任务未落地、职责过宽、职责名冒充身份、旧契约缺少回归、目标映射抽象。本次修正明确审查与工具行为、真实执行者和兼容验收；内容语义由独立角色阅读判断，不用结构绿灯替代。

## 非目标

不搬完整引擎，不做学生系统，不改变业务数据库，不承诺仅凭文档实现无人值守。

## 变更类型

存量文档与工具改动。无业务迁移；按提交回滚。工作区已确认干净，基线见元数据。

## 输入规格

参考 TEMP 的 AGE 比较与取舍报告，实际规范写回原主人，不提交临时研究资料为长期规则。Feature 为 document-workflow，专业边界仍归所属 README。

## 已关闭问题

用户已经授权直接实施。实际宿主支持原生子 Agent。工具记录仍不能阻止手工伪造；保留身份声明限制，由协调者核对真实派发。

## 测试与验收设计

四项真实单元行为：运行脚手架读取实际生成结构；向 CLI 提交错误任务观察拒绝；观察缺失、非独立和失效审查被准入拒绝；按 canonical 入口读取两份方法并跟随现有规则。文档语义另由读者审查，不用字符串通过声称内容质量。

AC-DOCFLOW-004 的逐项内容判定如下，由 T6 的真实独立审查读取产物后判断；机器读取用例只证明方法入口闭合，不能替代这些判定。

| 已采纳的 AGE 职责  | 负责任务与产物                                          | 独立审查的具体判定                                                                                         |
| ------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 短项目上下文       | T4，docs/README.md、现有 product.md 与 .ai/project.json | 能区分模板基线和采用项目，找到相关规格与事实，没有第二项目上下文真源。                                     |
| 稳定业务与源码入口 | T4，docs/designs/domain.md                              | 能区分认证/Tasks 业务域与可替换界面外壳，常见能力链接到实际模块、路由、API 和 Schema，而非动态完整地图。   |
| 原始输入可回查     | T4，Feature README、Others/inputs README                | 短原话留 Plan，长材料按需保留来源与版本；原文不替代确认行为，没有材料进度账本。                            |
| 文档漂移分类       | T4，ai-agents.md 与 Design/总入口链接                   | 四类差异分别回到正确真源；已有依据直接修正，真正未定目标才交人决定，不引入全局 freshness 审批。            |
| 计划与交付独立审查 | T5，两个 canonical SKILL 与 Plan README                 | 方法检查原请求和真实对象，固定触发和记录只有原 Plan；发现与 verdict 映射清楚，不能自评或倒填身份。         |
| 单一规则与默认方法 | T5，AGENTS、poteto-mode、.ai/README 和生成桥接          | 用户无需点名方法，必需列表能读取两份正文；两个发现目录不复制正文，来源和许可保留，未声称所有宿主自动发现。 |

本轮保留的既有真实红灯、有效运行复用、Design 回写和 Release 最终验收属于兼容边界；交付审查同时确认没有放宽，不计作新方法已带来的模型效果。

## 实现任务

顶部 tasks 定义结果、依赖、范围与负责人。T3A–T3C 为同一负责人串行完成的工具单元，T4 为文档，T5 为方法，三个写入范围隔离；Plan 和正式状态只由 root 维护。

## 验收方式

规格和真实断言提交后按四项 AC 记录原生红灯；实现后执行原生 integration；所有任务和独立审查完成后，在最终版本执行 Release 验收。

## 设计回写

docs/designs/execution.md 记录已实现新契约和限制；domain.md 只写当前业务事实。

## 状态记录

2026-10-11：独立角色 /root/workflow_document_writer 已读取原始目标、Plan、Feature与Release，确认无阻断结构缺口；指出旧契约 prepare/next 兼容断言需补，已交工具负责人在红灯前补入同一 AC002。此结论不是行为通过。

2026-10-11：选择现有 Plan 保存审查与精细任务，拒绝第二账本。WSL 默认 Node 20 不符合契约，显式加载现有 NVM Node 24.19.0 后 preflight 成功。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 独立审查原目标、任务和真实断言 · done
- [x] T2 · 提交规格和断言并取得真实红灯 · done
- [x] T3A · 生成精细任务脚手架 · done
- [x] T3B · 约束任务完整性与依赖推进 · done
- [x] T3C · 实现两个审查对象与正式准入 · done
- [x] T4 · 重构稳定业务入口、需求来源和事实冲突处理 · done
- [x] T5 · 迁入两份审查方法并统一 Plan 规则与生成入口 · done
- [ ] T6 · 集成并独立审查真实结果与文档一致性 · doing
- [ ] T7 · 核对 Plan 准出与 Release 最终验收交接 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

四项 AC 与内容审查成立；原目标全部对应；真实证据和最终组合验收可追溯。未接通能力按限制说明，不能冒充自动引擎完成。

## TDD 恢复记录

2026-10-11，AC-DOCFLOW-001：fixture-preconditions-correction。保留原回执 tdd-20261011111340-a4cfd8；对应任务重新进入真实红灯，旧验收绑定已撤销。本次恢复没有生成通过或失败凭证。

## TDD 恢复记录

2026-10-11，AC-DOCFLOW-002：fixture-preconditions-correction。保留原回执 tdd-20261011111359-9dad1c；对应任务重新进入真实红灯，旧验收绑定已撤销。本次恢复没有生成通过或失败凭证。

## TDD 恢复记录

2026-10-11，AC-DOCFLOW-003：fixture-preconditions-correction。保留原回执 tdd-20261011111423-5daa5b；对应任务重新进入真实红灯，旧验收绑定已撤销。本次恢复没有生成通过或失败凭证。
