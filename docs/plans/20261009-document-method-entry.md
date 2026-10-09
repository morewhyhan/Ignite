<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791541445161140320",
  "release": "document-method-entry-v1",
  "status": "active",
  "outcome": "文档维护入口能一次读取所属必需方法与共用写作方法，AI 按固定方法准备需求和计划",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "requirements": ["REQ-METHOD-004"],
      "text": "文档维护入口能一次读取所属必需方法与共用写作方法，AI 按固定方法准备需求和计划"
    },
    {
      "requirements": ["REQ-METHOD-005"],
      "text": "结构化 Plan 的变更类型只在元数据记录，文档门禁一致执行"
    }
  ],
  "constraints": [
    "方法真源仍由原 README 和技能正文维护",
    "不另建适配文件、技能副本或工作流",
    "只用便宜模型做学生准备试验，不开发整个业务系统"
  ],
  "non_goals": ["保证每种模型及宿主都自发遵守", "拦截宿主任意直接文件写入", "推送或部署学生系统"],
  "authorization": {
    "source": "用户要求继续实际试验并优化自动方法使用：那你就你试啊，你把它完全优化好啊。"
  },
  "deliverables": [
    "所属文档必需方法读取命令",
    "前置的固定维护方法入口",
    "无技能提示的模型观察结果"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "1fa791a58e56dff4d7e55c793885dfc143eebe91",
  "requirements": ["REQ-METHOD-004", "REQ-METHOD-005"],
  "acceptance": [
    {
      "tests": ["tests/contracts/document-method-entry.test.ts::[AC-METHOD-004]"],
      "id": "AC-METHOD-004",
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/document-method-entry.test.ts::[AC-METHOD-004]"
        }
      ],
      "required_layers": ["unit"]
    },
    {
      "id": "AC-METHOD-005",
      "checks": [
        {
          "test": "tests/contracts/plan-change-type.test.ts::[AC-METHOD-005]",
          "layer": "unit"
        }
      ],
      "tests": ["tests/contracts/plan-change-type.test.ts::[AC-METHOD-005]"],
      "required_layers": ["unit"]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "识别现有行为、写入边界和原始目标",
      "phase": "prepare",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "提交真实行为测试并记录红灯",
      "phase": "red",
      "acceptance": ["AC-METHOD-004"],
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "phase": "implement",
      "acceptance": ["AC-METHOD-004"],
      "status": "done"
    },
    {
      "id": "T5",
      "title": "取得单一变更类型记录的真实红灯",
      "status": "todo",
      "acceptance": ["AC-METHOD-005"],
      "phase": "red"
    },
    {
      "id": "T6",
      "title": "消除结构化 Plan 正文重复类型要求",
      "status": "todo",
      "acceptance": ["AC-METHOD-005"],
      "phase": "implement"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "status": "todo",
      "phase": "verify"
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
  "owner": "root",
  "risk": "feature",
  "data_contract": {
    "rollback": "回退本次命令和入口提交",
    "access_rationale": "只读项目方法和文档，不访问业务数据",
    "access_scope": "not-applicable",
    "destructive_authorization": null,
    "migration_impact": "none"
  },
  "write_scope": [
    "AGENTS.md",
    "scripts/ignite/cli.mjs",
    "scripts/ignite/skill-reader.mjs",
    "docs/features/",
    "docs/plans/",
    "docs/standards/",
    "docs/designs/",
    "docs/others/",
    "tests/contracts/document-method-entry.test.ts",
    "scripts/check-docs.mjs",
    "tests/contracts/plan-change-type.test.ts"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-METHOD-004",
      "test": "tests/contracts/document-method-entry.test.ts::[AC-METHOD-004]",
      "run_id": "tdd-20261009102933-b83d2b"
    },
    {
      "acceptance_id": "AC-METHOD-005",
      "test": "tests/contracts/plan-change-type.test.ts::[AC-METHOD-005]",
      "run_id": "tdd-20261009110232-ea0078"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20261009105205-0a764f"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-09"
}
-->

# Ignite 实施计划：document-method-entry

## 状态

状态以元数据为准，任务进度由原生命令维护。

## 目标

文档维护入口能一次读取所属必需方法与共用写作方法，AI 按固定方法准备需求和计划。

## 原始目标与覆盖核对

| 用户原话或来源                         | 本轮目标                                         | REQ            | AC            | 处理结果                     |
| -------------------------------------- | ------------------------------------------------ | -------------- | ------------- | ---------------------------- |
| 用户要求实际试验并把自动方法使用优化好 | 修复试验中漏读 Plan 方法的入口，保留已有顺序约束 | REQ-METHOD-004 | AC-METHOD-004 | 纳入工具验收，另观察真实模型 |
| 核心目的维护稳定，方法不要求提速       | 对照真实动作和产物，不以速度或调用数抵消缺口     | 约束           | 不适用        | 保留                         |
| 方法直接融入原文档，不另建适配文件     | 原所属规则决定必需方法，命令从实际链接读取       | REQ-METHOD-004 | AC-METHOD-004 | 纳入                         |

## 整体判断与推进顺序

1fa791a 的无提示学生准备试验读取了 how、experience-first、technical-writing、unslop，并写出先红灯后实现的草稿；但没有读取 figure-it-out、show-me-your-work、sequence-verifiable-units。工具结果中三项 Plan 链接实际可见，不能归因于文件缺失；初次大批输出确实有截断，但再次规则读取已提供该段。错误是读取所属规则后没有完成其必需正文步骤。

先证明现有 CLI 不支持按所属文档读齐方法，再扩展现有 skill read，直接解析原规则中的必需链接和共用写作链接，不创建第二份映射。把原方法段前置，要求在背景调查之前读齐。一次新模型试验观察是否改善，不能把命令测试当成模型有效的证明。

## 非目标

不改变学生产品，不开发整套业务，不增加模型比赛、适配台账或全局安装。

## 变更类型

- 类型：`[存量改动]`

[存量改动]。只扩展现有只读命令和原文档入口，保持按技能名读取兼容。无数据迁移，回退本次提交即可。

## 输入规格

执行可信性 Feature、各文档所属固定维护方法、现有 skill reader、TEMP/自动使用复验.md 与实际子会话工具结果。

## 已关闭问题

既有授权覆盖修复和低成本试验。路径错误、漏读与使用错误分别判断；单例成功不证明所有模型。

## 测试与验收设计

AC-METHOD-004 实际调用 CLI，要求所属必需方法与共用写作正文全文，排除条件方法；缺失任一正文则失败且不输出部分成功，越界 owner 拒绝。模型观察另核对实际工具调用、Plan 阶段与 AC、约束覆盖和未完成说明。

## 实现任务

按元数据 tasks，先真实红灯再实施，最后原生 integration 与 Design 回写。

## 验收方式

通过本 Plan 原生 check，所有任务完成后运行同版本 Release 验收。模型试验只有实际读齐且产物合适才计本次成功，不作全平台保证。

## 设计回写

当前命令与读取入口事实回 docs/designs/execution.md，不将学生草稿当作实现事实。

## 状态记录

2026-10-09：第一轮复验仍漏读三项 Plan 方法；保留失败样本，不提示该开发者补读以冒充自动成功。

## 准出条件

纳入 AC 的真实红灯、绿灯、工程门禁和 Release 齐全；模型观察结果如实记录。发布后建设记录提交入 Git 历史，模板清理按采用规则。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [x] T2 · 提交真实行为测试并记录红灯 · done
- [x] T3 · 实施最小存量修改 · done
- [ ] T5 · 取得单一变更类型记录的真实红灯 · todo
- [ ] T6 · 消除结构化 Plan 正文重复类型要求 · todo
- [ ] T4 · 验证兼容性并回写设计 · todo

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20261009105205-0a764f
<!-- /ignite-progress -->

2026-10-09：第二轮新会话自动读齐七份正文并安排先红灯后实现，草稿原生结构有效，但正文类型仍被文档检查器要求重复。当前 README 和模板都以顶部类型为准，检查器与真源矛盾。本 Plan 追加 AC-METHOD-005 修正门禁，不另建收口 Plan。读齐步骤发生在读取维护记录之前；试验只证明准备阶段，未实现学生系统。
