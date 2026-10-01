<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790848085501147562",
  "release": "document-line-coordination-v1",
  "status": "active",
  "outcome": "各专业文档直接提供自己的标准，Plan/Release 协调交付，工作流只负责必要衔接",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "按条条与块块归位六项标准，正常使用各类文档即可执行，跨环节协调有明确边界",
      "requirements": ["REQ-EXECUTION-039"]
    }
  ],
  "constraints": [
    "保留六项结果、整体判断、人决定产品与真实验收",
    "每项规则只在所属入口维护，不新增提示词、层级或状态",
    "完成的历史 Plan 与证据按原提交保留"
  ],
  "non_goals": [
    "不改变业务、数据库、运行时或执行器检查策略",
    "不把模型效果、自查或结构检查当作产品完成",
    "不新建一套条块管理文件或跨专业总管"
  ],
  "authorization": {
    "source": "用户要求依照条条和块块分别把文档体系优化好；前文已确定六项结果和原生规则归属"
  },
  "deliverables": [
    "docs/features/README.md",
    "docs/plans/README.md",
    "docs/plans/releases/README.md",
    "docs/standards/testing.md",
    "AGENTS.md",
    "docs/standards/ai-agents.md",
    "docs/standards/workflow.md"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "c780ce8b0a0af9c159be4951caa01ecf92203f3e",
  "requirements": ["REQ-EXECUTION-039"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-039",
      "tests": [
        "tests/contracts/document-ownership.test.ts::[AC-EXECUTION-039] generates drafts whose professional rules resolve directly to their owners and coordination stays separate"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/document-ownership.test.ts::[AC-EXECUTION-039] generates drafts whose professional rules resolve directly to their owners and coordination stays separate",
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
    "access_rationale": "仅文档规则归属和脚手架链接，无业务数据",
    "migration_impact": "none",
    "rollback": "撤回本轮提交，原记录保留",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/plans/20261001-document-line-coordination.md",
    "docs/plans/releases/document-line-coordination-v1.json",
    "AGENTS.md",
    "README.md",
    ".ai/README.md",
    "docs/README.md",
    "docs/features/README.md",
    "docs/features/_template.md",
    "docs/features/execution.md",
    "docs/plans/README.md",
    "docs/plans/_template.md",
    "docs/plans/releases/README.md",
    "docs/standards/workflow.md",
    "docs/standards/testing.md",
    "docs/standards/ai-agents.md",
    "docs/standards/adoption.md",
    "docs/standards/development.md",
    "docs/standards/README.md",
    "docs/designs/README.md",
    "docs/designs/execution.md",
    "docs/others/evidence/README.md",
    "docs/others/test-cases/README.md",
    "docs/others/test-cases/execution-focus.md",
    "scripts/create-module.mjs",
    "tests/contracts/document-ownership.test.ts",
    "tests/contracts/execution-focus.test.ts",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-039",
      "test": "tests/contracts/document-ownership.test.ts::[AC-EXECUTION-039] generates drafts whose professional rules resolve directly to their owners and coordination stays separate",
      "run_id": "tdd-20261001095715-f5cb48"
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

# Ignite 实施计划：专业规则与交付协调归位

## 状态

顶部元数据和生成进度是唯一状态。

## 目标

需求、计划、测试、完成、沟通和维护各条线自带可执行标准；具体 Plan 与 Release 组织本轮交付，工作流仅协调跨 Plan 与跨资料衔接。

## 原始目标与覆盖核对

| 原始要求                         | 本轮结果                                            | REQ               | AC               | 处理                   |
| -------------------------------- | --------------------------------------------------- | ----------------- | ---------------- | ---------------------- |
| 依照条条和块块分别优化好         | 专业规则归原入口；Plan/Release 负责交付；工作流收窄 | REQ-EXECUTION-039 | AC-EXECUTION-039 | 纳入                   |
| 多数事情条条就够，不另建总管     | 生成文档直接引用自己所属标准，普通任务按需读        | REQ-EXECUTION-039 | AC-EXECUTION-039 | 纳入                   |
| 保留前面六项，避免局部深挖与偏移 | 六项标准、主要问题及反馈保留在对应职责              | REQ-EXECUTION-039 | AC-EXECUTION-039 | 纳入；语义质量作者复核 |

## 整体判断与推进顺序

已确认：workflow 集中了需求尺度、Plan 判断、纠偏、沟通、状态、证据与交接，专业 README 多数仅是目录说明。主要缺口是规则归属和读取路径，继续加总规则不能解决它。先明确每项唯一所属文档，再迁移并消除旧副本，更新真实生成入口，最后检查源头、模板、采用说明和当前 Design 一致。

| 六项结果   | 专业规则真源                                        | 本轮产出位置                        |
| ---------- | --------------------------------------------------- | ----------------------------------- |
| 任务说准   | features/README，需求编写与 AC                      | Feature 和 Plan 原始目标覆盖        |
| 行动选对   | plans/README，整体判断与尺度                        | 当前 Plan 推进依据和 tasks          |
| 执行守住   | plans/README，接续与纠偏；evidence/README 运行恢复  | 当前 Plan 判断、真实缺口与运行      |
| 完成可信   | Feature AC、testing 证据、Plan/Release 各自完成条件 | 原始目标与被测版本、真实证据        |
| 沟通明白   | AGENTS 沟通                                         | 每次回应的意图、结论、依据和缺口    |
| 依据可维护 | ai-agents 规则归属与维护                            | 对应原规则及维护 Plan，不建新管理层 |

块块的载体是具体 Plan/Release：围绕交付结果连接各专业产出、协调依赖和组合版本。workflow 只记录交接关系，出现跨 Plan 依赖、共享写入或集成冲突时才需要它；不规定各专业怎么写、谁可以扩大产品目标或降低门禁。

规模边界用四类情形复核：只改文案走相关条线；保存与间距在当前 Plan 选择主问题；上游接口变动对齐依赖快照；两个 Plan 修改共享 Schema 明确集成人及交接，不默默扩成全局优化。归并导致条款遗漏、强制普通任务读总管或引入新状态时回到原归属修正。

## 非目标

不改变检查策略、业务功能和数据；不重新验收旧 Plan，不建立新的管理文件。规则效果仍需真实模型及人的行为反馈。

## 变更类型

- 类型：`[存量改动]`

按提交回滚全部归位改动，无数据迁移。

## 输入规格

当前执行 Feature/Design、六类文档入口、Feature/Plan 模板、模块/存量脚手架与相关契约。默认运行时使用现有 WSL，采用边界仍为模板基础设施。

## 已关闭问题

用户已明确授权按条块实施；专业标准放已有 README/Standards/AGENTS，跨任务协调复用 Plan/Release，不增加规则层或产品决定。

## 测试与验收设计

实际创建两种草稿并跟随专业规则链接，核对真实目标文件与段落、协调入口单独存在及草稿仍未完成。这证明读取和生成路径，不能证明文本判断或模型质量。六项和四类尺度情形由作者内容复核；现有依赖、共享文件、状态、TDD 与证据契约通过原回归验证。

## 实现任务

原生编写规则、模板、AI/文档入口、采用说明、Design 和相关回归一并维护，tasks 为唯一进度。

## 验收方式

提交新真实链接行为测试后由 runner 记录 AC-EXECUTION-039 红灯，再实施归位并使同一测试通过。按 auto 完成 Plan 集成，各任务完成后对最终版本执行一次 Release 构建与浏览器验收，复用有效运行。

## 设计回写

执行 Design 记录专业真源、按需读取与 Plan/Release 的协调边界；设计文档自身维护规则归 designs/README。

## 状态记录

作者内容复核：六项按处理结果归属到 Feature 需求尺度、Plan 条件比较与接续纠偏、测试层级和证据有效性、Plan/Release 完成、AGENTS 沟通、ai-agents 维护。对照迁移前 workflow 的任务单位、开放问题、TDD、UI 路径、结果回写、恢复、并行交接、模板清理及运行时条款，分别保留在专业原入口或已有 AGENTS/采用规范；workflow 仅留下衔接和冲突协调。没有新增管理文件、状态或检查策略。

四类尺度复核：已确定的文案修改引用既有行为，不进入跨 Plan 协调；保存失败与间距问题由当前 Plan 按必要条件选择重点，测试区分写入/读取/呈现；上游接口变化更新原契约快照并对齐下游；共享 Schema 由声明负责人集成，其他切片按 handoff 交接，不另建收口 Plan。局部停止不冒充全局阻塞，新权限风险仍可改变重点。

两种实际脚手架的专业链接文件和段落解析、草稿状态，以及既有生成与接续回归共 6 个定向用例通过。新 AC 的活动用例保持红灯时内容。同步根 README 的旧必读工作流导航，纳入同一写入范围，确保普通任务入口一致。上述内容复核是作者审查；实际模型行为、独立读者理解和跨 Plan 人工行为案例未执行，不能据此宣称效果已实证。

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

六项原标准未遗漏，专业规则有唯一所属，普通生成路径可直达所属段落，workflow 不再重定义专业标准。真实红灯与当前集成证据通过，Design 已回写；模型效果与读者理解未实测如实说明。
