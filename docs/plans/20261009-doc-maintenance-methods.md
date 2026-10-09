<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791503770196694819",
  "release": "doc-maintenance-methods-v1",
  "status": "ready",
  "outcome": "克隆后的AI按固定文档职责使用pstack核心方法，保持一套原生状态与准确验收范围",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "固定默认文档维护步骤与核心技能、原则、条件分支和写回位置",
      "requirements": ["REQ-PSTACK-004"]
    },
    {
      "text": "延期与授权排除可如实登记且不能伪称完成",
      "requirements": ["REQ-EXECUTION-001"]
    }
  ],
  "constraints": [
    "保持原生Feature/Plan/Design/Standards/ADR/证据/Release真源",
    "简单直接执行仍保留必要记录，不强制全技能、全代理、原型或速度实验",
    "不新增ADAPTER、方法路由文件、独立台账、云服务或机器人"
  ],
  "non_goals": [
    "证明模型普遍改善或提速",
    "启用外部机器人、模型服务、PR监控、发布部署",
    "改动业务API、数据库、认证和数据"
  ],
  "authorization": {
    "source": "2026-10-09当前会话：用户要求开始落实，并固定文档维护的核心方法与条件，不完全交由AI自由选择"
  },
  "deliverables": [
    "AGENTS.md",
    "docs各所属README固定方法步骤",
    ".ai/pstack技能与流程正文及生成发现入口",
    "scripts/ignite/execution-contract.mjs延期排除契约"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "d8686b5b842a1d3d555fd4236a4c58f3e56db62e",
  "requirements": ["REQ-PSTACK-004", "REQ-EXECUTION-001"],
  "acceptance": [
    {
      "id": "AC-PSTACK-004",
      "tests": ["tests/contracts/document-methods.test.ts::[AC-PSTACK-004]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/document-methods.test.ts::[AC-PSTACK-004]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-001",
      "tests": ["tests/contracts/release-disposition.test.ts::[AC-EXECUTION-001]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/release-disposition.test.ts::[AC-EXECUTION-001]",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "落实原始目标与真实合同红灯",
      "status": "doing"
    },
    {
      "id": "T2",
      "title": "固定所属文档方法并修正技能和验收冲突",
      "status": "todo"
    },
    {
      "id": "T3",
      "title": "同步入口、回写事实并完成原生验收",
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
  "owner": "root",
  "risk": "feature",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "仅文档方法与执行契约；不接触业务数据",
    "migration_impact": "none",
    "rollback": "回退本轮方法、规则与契约提交；不涉及数据迁移",
    "destructive_authorization": null
  },
  "write_scope": [
    "AGENTS.md",
    ".ai/README.md",
    ".ai/skills/README.md",
    ".ai/pstack/",
    ".agents/skills/",
    ".claude/skills/",
    "docs/",
    "scripts/ignite/execution-contract.mjs",
    "scripts/ignite/cli.mjs",
    "tests/contracts/document-methods.test.ts",
    "tests/contracts/release-disposition.test.ts"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-09"
}
-->

# Ignite 实施计划：固定文档维护方法

## 目标

克隆后的AI按固定文档职责使用pstack核心方法，保持一套原生状态与准确验收范围

## 原始目标与覆盖核对

| 用户要求                                                 | 本轮结果                                     | REQ               | AC               | 处理 |
| -------------------------------------------------------- | -------------------------------------------- | ----------------- | ---------------- | ---- |
| 维护文档默认使用方法论，核心技能原则相对固定，步骤说清楚 | 所属入口规定核心步骤、方法、分支、回写与完成 | REQ-PSTACK-004    | AC-PSTACK-004    | 纳入 |
| 简单任务直接执行，项目修改仍记录必要资料                 | 简单路径缩短过程但保留必要记录和验收         | REQ-PSTACK-004    | AC-PSTACK-004    | 纳入 |
| 落实研究中影响准确文档维护的验收冲突                     | Release延期与授权排除的原生校验一致          | REQ-EXECUTION-001 | AC-EXECUTION-001 | 纳入 |

## 整体判断与推进顺序

主缺口是手动模式门槛与自由选择描述，以及所属README缺少固定核心方法。先更新规格与真实入口/生成/Release契约测试，记录行为红灯；再在现有真源原位修正。各写入者独占canonical范围，root集成共享入口与派生资料。结构检查和审查只证明明确范围，不宣称模型收益。

## 分类与边界

[存量改动]；无业务数据、网络服务和破坏性动作。基线、写入范围和授权见顶部元数据。同目标修复在本Plan；回滚本轮源提交，不回退已应用migration。

## 验收方式

按[测试标准](../standards/testing.md)对两条AC记录真实断言红灯；采用同一测试路径验证绿色。入口测试证明可读取和同步行为，内容逐项核对用户目标；Release测试使用真实校验器与隔离仓库。没有模型评估或速度KPI。最终执行Plan integration及同版本Release验证，复用有效运行。

## 设计回写

更新docs/designs/execution.md的方法启动、固定职责与实际程序边界。规则与过程归所属README和本Plan，不复制到Design。

## 状态记录

2026-10-09：读取全量研究并核对最新用户决定。Windows预检版本不符，使用已有WSL Node24.19.0与独立依赖，runtime/template doctor已通过；没有安装。

<!-- ignite-progress -->

状态：`ready`（由元数据生成）

- [ ] T1 · 落实原始目标与真实合同红灯 · doing
- [ ] T2 · 固定所属文档方法并修正技能和验收冲突 · todo
- [ ] T3 · 同步入口、回写事实并完成原生验收 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

原始目标、两条AC、实际证据、被测版本和Design一致；所有tasks完成且无缺口；Plan与Release结论分开。模板发布的建设记录按采用规范保存在Git历史。
