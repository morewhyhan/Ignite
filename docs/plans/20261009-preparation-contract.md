<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791557113512648376",
  "release": "preparation-contract-v1",
  "status": "active",
  "outcome": "默认文档准备经过原生完整校验、纠错与清晰的未完成判定，减少自由填写、错误环境与局部绿灯误报",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "原生 Plan 校验、状态转换和完整文档门禁共用实际标题与关联 Release 检查，不能用子串或代码示例冒充必需栏目",
      "requirements": ["REQ-METHOD-007"]
    },
    {
      "text": "开发前准备检查覆盖当前 Feature、Plan、Release 的完整结构和范围，明确区分未写测试、开工条件和实际验收",
      "requirements": ["REQ-METHOD-008"]
    },
    {
      "text": "读取所属方法同时保留未编号必需条款，条件分支仍需符合触发条件",
      "requirements": ["REQ-METHOD-009"]
    },
    {
      "text": "CLI 在加载业务依赖前检查 Node 真源，技能读取在无依赖克隆中可用",
      "requirements": ["REQ-METHOD-010"]
    },
    {
      "text": "只准备时用原模板生成 Feature、数字 ID Plan 和 Release，不生成业务源码或测试",
      "requirements": ["REQ-METHOD-011"]
    },
    {
      "text": "原始目标与验收逐项对应，不能借其他目标验收凑齐整体覆盖",
      "requirements": ["REQ-METHOD-012"]
    }
  ],
  "constraints": [
    "规则直接维护在原文档和原生工具，不创建适配文档或平行台账",
    "方法评价为正确取舍与真实结果，不以提速证明技能",
    "运行与验收使用 WSL/NVM；模型继续既有最便宜 GPT-5.6-luna low"
  ],
  "non_goals": ["学生产品实现", "保证所有模型一遍无误", "重写历史任务或改变业务架构"],
  "authorization": {
    "source": "用户：围绕这件事情的本质，把实际导致效果不好的 bug 找到并解决。"
  },
  "deliverables": [
    "共享结构校验与准备阶段入口",
    "方法原条款完整读取与早期运行时提示",
    "只文档脚手架与无答案冷会话观察"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "4d93b7300a937e5b903be1ea936be0ba1a065c88",
  "requirements": [
    "REQ-METHOD-007",
    "REQ-METHOD-008",
    "REQ-METHOD-009",
    "REQ-METHOD-010",
    "REQ-METHOD-011",
    "REQ-METHOD-012"
  ],
  "acceptance": [
    {
      "id": "AC-METHOD-007",
      "tests": ["tests/contracts/preparation-contract.test.ts::[AC-METHOD-007]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/preparation-contract.test.ts::[AC-METHOD-007]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-METHOD-008",
      "tests": ["tests/contracts/preparation-contract.test.ts::[AC-METHOD-008]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/preparation-contract.test.ts::[AC-METHOD-008]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-METHOD-009",
      "tests": ["tests/contracts/preparation-contract.test.ts::[AC-METHOD-009]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/preparation-contract.test.ts::[AC-METHOD-009]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-METHOD-010",
      "tests": ["tests/contracts/preparation-contract.test.ts::[AC-METHOD-010]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/preparation-contract.test.ts::[AC-METHOD-010]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-METHOD-011",
      "tests": ["tests/contracts/preparation-contract.test.ts::[AC-METHOD-011]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/preparation-contract.test.ts::[AC-METHOD-011]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-METHOD-012",
      "tests": ["tests/contracts/preparation-scope.test.ts::[AC-METHOD-012]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/preparation-scope.test.ts::[AC-METHOD-012]",
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
      "phase": "prepare",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "提交真实行为测试并记录红灯",
      "phase": "red",
      "acceptance": [
        "AC-METHOD-007",
        "AC-METHOD-008",
        "AC-METHOD-009",
        "AC-METHOD-010",
        "AC-METHOD-011",
        "AC-METHOD-012"
      ],
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "phase": "implement",
      "acceptance": [
        "AC-METHOD-007",
        "AC-METHOD-008",
        "AC-METHOD-009",
        "AC-METHOD-010",
        "AC-METHOD-011",
        "AC-METHOD-012"
      ],
      "status": "done"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "phase": "verify",
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
  "owner": "root",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "只维护工程工具和规则，无业务数据变化",
    "migration_impact": "none",
    "rollback": "回退本轮提交",
    "destructive_authorization": null
  },
  "write_scope": [
    "scripts/",
    "tests/contracts/preparation-contract.test.ts",
    "docs/features/ai-execution-trust.md",
    "docs/features/README.md",
    "docs/plans/README.md",
    "docs/plans/_template.md",
    "docs/plans/releases/README.md",
    "docs/standards/ai-agents.md",
    "docs/standards/testing.md",
    "docs/designs/README.md",
    "docs/designs/execution.md",
    "docs/others/test-cases/README.md",
    "docs/others/evidence/README.md",
    "docs/others/adr/README.md",
    "docs/plans/20261009-preparation-contract.md",
    "docs/plans/releases/preparation-contract-v1.json",
    "docs/others/evidence/",
    "docs/others/ignite-status.md"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-METHOD-007",
      "test": "tests/contracts/preparation-contract.test.ts::[AC-METHOD-007]",
      "run_id": "tdd-20261009153500-2c8d5a"
    },
    {
      "acceptance_id": "AC-METHOD-008",
      "test": "tests/contracts/preparation-contract.test.ts::[AC-METHOD-008]",
      "run_id": "tdd-20261009153504-b52a72"
    },
    {
      "acceptance_id": "AC-METHOD-009",
      "test": "tests/contracts/preparation-contract.test.ts::[AC-METHOD-009]",
      "run_id": "tdd-20261009153509-db3b52"
    },
    {
      "acceptance_id": "AC-METHOD-010",
      "test": "tests/contracts/preparation-contract.test.ts::[AC-METHOD-010]",
      "run_id": "tdd-20261009153514-5b0ae8"
    },
    {
      "acceptance_id": "AC-METHOD-011",
      "test": "tests/contracts/preparation-contract.test.ts::[AC-METHOD-011]",
      "run_id": "tdd-20261009153520-372f83"
    },
    {
      "acceptance_id": "AC-METHOD-012",
      "test": "tests/contracts/preparation-scope.test.ts::[AC-METHOD-012]",
      "run_id": "tdd-20261009171343-ac0c6a"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20261009163237-0abc02"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-09"
}
-->

# Ignite 实施计划：preparation-contract

## 状态

状态和任务仅由元数据及原生命令维护。

## 目标

默认文档准备经过原生完整校验、纠错与清晰的未完成判定，减少自由填写、错误环境与局部绿灯误报

## 原始目标与覆盖核对

用户要求找出并修复实际问题 → 原生 Plan 校验、状态转换和完整文档门禁共用实际标题与关联 Release 检查，不能用子串或代码示例冒充必需栏目 → REQ-METHOD-007 → AC-METHOD-007，全部纳入本轮。

用户要求找出并修复实际问题 → 开发前准备检查覆盖当前 Feature、Plan、Release 的完整结构和范围，明确区分未写测试、开工条件和实际验收 → REQ-METHOD-008 → AC-METHOD-008，全部纳入本轮。

用户要求找出并修复实际问题 → 读取所属方法同时保留未编号必需条款，条件分支仍需符合触发条件 → REQ-METHOD-009 → AC-METHOD-009，全部纳入本轮。

用户要求找出并修复实际问题 → CLI 在加载业务依赖前检查 Node 真源，技能读取在无依赖克隆中可用 → REQ-METHOD-010 → AC-METHOD-010，全部纳入本轮。

用户要求找出并修复实际问题 → 只准备时用原模板生成 Feature、数字 ID Plan 和 Release，不生成业务源码或测试 → REQ-METHOD-011 → AC-METHOD-011，全部纳入本轮。

## 整体判断与推进顺序

实际学生冷会话虽读齐技能，初稿漏栏目、ID与字段错误、错误 Node20。Plan validate 和完整文档检查职责割裂，includes误认状态记录；草稿阶段没有区分结构与未来测试的入口，next仍建议必然被拒绝的ready。方法读取只保留编号段，漏掉草稿层级与任务前置条款。不是再加认真要求，而是在原工具共用约束，并用完整准备检查产生明确纠错与待办。先取得真实红灯，再小步修复，冻结测试到绿灯。没有证据支持所有宿主无误，冷会话按真实结果报告。

## 非目标

学生产品实现；保证所有模型一遍无误；重写历史任务或改变业务架构

## 变更类型

元数据是存量改动真源；旧未配置正文模板的夹具和历史契约保持兼容，历史完成记录按受测模板验证。无迁移，回退本轮提交。

## 输入规格

执行可信性 Feature、Plan/Feature/Release 所属规则、CLI/state/check-docs/skill-reader/runtime 与既有学生原始观察。

## 已关闭问题

当前任务、只读观察和修复已授权，无破坏性或产品边界决定。

## 测试与验收设计

五条 AC 分别通过真实 CLI、状态转换、缺未来测试的准备稿、条件方法、错误运行时和文档脚手架行为验证。红灯测试对应同一文件并保持不变；模型观察单独核对默认调用、原生纠错和真实草稿缺口。

## 实现任务

按元数据 prepare、red、implement、verify。新发现仍在同一计划修复。

## 验收方式

按实际 AC 记录红灯，再运行 auto integration；Plan完成后同一最终版本运行Release生产构建和全局浏览器回归。

## 设计回写

只将已实现的工具职责回写 execution.md。

## 状态记录

2026-10-09：接续用户对上轮原因的确认，查出校验范围割裂、前缀标题误报、准备入口缺失、读取漏条款、静态依赖先于运行时提示。原学生失败样本保留在 TEMP/自动使用复验.md。

2026-10-10：首次 integration 的工程门禁与五条新增 AC 通过；全量契约发现无关草稿被强制关联 Release，以及旧红灯文件未从活动证据退休。修复批量草稿校验兼容性，保留显式准备检查与状态晋级严格性；旧红灯由 Git 历史保留，活动记录只保留最终冻结测试的五条真实红灯。

2026-10-10：新冷会话自读七份方法并自动运行 prepare，按反馈自行修正，但原始目标的刷新 REQ 仍借其他目标 AC 被整体覆盖检查放过，且最后误称可开工。增加同目标 REQ/AC 对应断言；准备状态不冒充 ready，并在原 Plan 所属条款明确状态报告与已完成准备任务更新。初次 Windows/错误 NVM 调用及最终准备稿的缺口保留。

## 准出条件

所有 AC 实际红绿，原工具兼容与正式Plan/Release证据有效；模型观察如实保留初稿、纠正和缺口，不把草稿当已实现学生功能。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [x] T2 · 提交真实行为测试并记录红灯 · done
- [x] T3 · 实施最小存量修改 · done
- [ ] T4 · 验证兼容性并回写设计 · doing

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20261009163237-0abc02
<!-- /ignite-progress -->
