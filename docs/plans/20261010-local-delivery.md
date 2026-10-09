<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791588953510062310",
  "release": "local-delivery-v1",
  "status": "active",
  "outcome": "本地交付拒绝缺少完成 Plan 或与受测版本不一致的改动，并接回现有开工与完成流程",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "从本轮真实基线完整核对本地交付改动",
      "requirements": [
        "REQ-DELIVERY-001",
        "REQ-DELIVERY-002"
      ]
    }
  ],
  "constraints": [
    "复用原有 CI 覆盖逻辑和文档真源，不新增适配文件或流程台账",
    "保留干净模板和普通工程检查，不强制小任务委派",
    "WSL/NVM 固定运行时；不能宣称提示词可拦截宿主任意写入"
  ],
  "non_goals": [
    "通用 AI 宿主拦截器、自动调度引擎、部署和外部服务",
    "未实证的所有模型和宿主必定遵守技能"
  ],
  "authorization": {
    "source": "本会话用户明确要求 poteto-mode 直接解决自动维护流程问题"
  },
  "deliverables": [
    "原生 validate --delivery 本地覆盖检查",
    "现有 Plan 和 AGENTS 中的开工与交付入口",
    "同一回归文件的真实红灯、集成证据与 Release 验收"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "7eb1f554d01098fb2e7a16a91d1d8a65f181ff21",
  "requirements": [
    "REQ-DELIVERY-001",
    "REQ-DELIVERY-002"
  ],
  "acceptance": [
    {
      "id": "AC-DELIVERY-001",
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/ignite-cli.test.ts::[AC-DELIVERY-001] rejects unplanned committed and working changes with an explicit baseline"
        }
      ],
      "tests": [
        "tests/contracts/ignite-cli.test.ts::[AC-DELIVERY-001] rejects unplanned committed and working changes with an explicit baseline"
      ]
    },
    {
      "id": "AC-DELIVERY-002",
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/ignite-cli.test.ts::[AC-DELIVERY-002] refuses working and staged drift from a completed Plan while accepting unchanged delivery"
        }
      ],
      "tests": [
        "tests/contracts/ignite-cli.test.ts::[AC-DELIVERY-002] refuses working and staged drift from a completed Plan while accepting unchanged delivery"
      ]
    }
  ],
  "verification_requirements": [
    "unit"
  ],
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
        "AC-DELIVERY-001",
        "AC-DELIVERY-002"
      ],
      "status": "todo"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "phase": "implement",
      "acceptance": [
        "AC-DELIVERY-001",
        "AC-DELIVERY-002"
      ],
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "phase": "verify",
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
  "owner": "codex-owner",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "rollback": "回退本轮提交，不触及业务数据",
    "migration_impact": "none",
    "access_rationale": "本轮只改变治理工具与规则，不改变业务资源",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/plans/20261010-local-delivery.md",
    "docs/plans/releases/local-delivery-v1.json",
    "docs/others/evidence/tdd/",
    "docs/features/ai-execution-trust.md",
    "tests/contracts/ignite-cli.test.ts",
    "scripts/ignite/core.mjs",
    "scripts/ignite/governance.mjs",
    "scripts/ignite/cli.mjs",
    "package.json",
    "AGENTS.md",
    "docs/plans/README.md",
    "docs/designs/execution.md",
    "docs/standards/adoption.md"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-DELIVERY-001",
      "test": "tests/contracts/ignite-cli.test.ts::[AC-DELIVERY-001] rejects unplanned committed and working changes with an explicit baseline",
      "run_id": "tdd-20261009233949-2e64a4"
    }
  ],
  "required_evidence": [
    "check-integration"
  ],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-09"
}
-->

# Ignite 实施计划：本地交付覆盖

## 状态

状态与任务由顶部元数据和原生命令维护。

## 目标

本地交付必须核对真实基线、完成 Plan 与受测内容，不能以局部构建通过替代完整交付。

## 原始目标与覆盖核对

| 用户来源                               | 本轮目标                                 | REQ              | AC              | 处理结果 |
| -------------------------------------- | ---------------------------------------- | ---------------- | --------------- | -------- |
| 用户要求直接解决自动维护流程的实际缺口 | 使用真实基线覆盖全部本地改动             | REQ-DELIVERY-001 | AC-DELIVERY-001 | 纳入     |
| 用户要求稳定维护与真实完成             | 旧完成证据不能覆盖后续修改，正常路径保留 | REQ-DELIVERY-002 | AC-DELIVERY-002 | 纳入     |

## 整体判断与推进顺序

普通需求试验收到正确规则但没有读取方法、建立文档和行为测试。学生版本 9c0055 的带基线 CI 覆盖检查拒绝全部 11 个改动；没有基线的完成覆盖函数返回空失败列表。问题不是缺少技能真源。本轮先用两个真实 Git 行为断言记录红灯，再复用 CI 覆盖逻辑增加本地入口，并更新原有开工和完成规则。

不把新增 CLI 或规则当作通用宿主拦截器。任意 AI 仍能直接写文件；真实模型自动遵守的效果与工具检查分开报告。若回归显示正常完成记录被误拒绝，修正比较方式，不降低覆盖义务。没有新的输入变化时复用有效运行。

## 非目标

本轮不构建跨平台自动机器人，不机械运行全部方法或多个模型。不宣称模型自动维护闭环已经通过。

## 变更类型

存量基础设施修改，不改变数据库和业务 API。普通 check 和 build 保持工程门禁含义；本地交付使用明确原生入口。回退本轮提交即可恢复。

## 输入规格

[执行信任](../features/ai-execution-trust.md)、[Plan 规则](./README.md)、[测试标准](../standards/testing.md)、[当前执行设计](../designs/execution.md)。实际失败及公开轨迹在本地 TEMP，程序断言在现有 ignite-cli 回归文件。

## 已关闭问题

用户已授权直接实现。CI 已有覆盖机制，复用而不另造规则。全局构建不适合作为业务 Plan 开工拦截器，因为模板和旧验收仍需运行。基线必须显式或取自指定 Plan，不猜测最近提交。

## 测试与验收设计

AC-DELIVERY-001 检查真实临时 Git 中无 Plan 的提交、工作区、暂存和未跟踪代码，以及 CLI 的基线诊断。AC-DELIVERY-002 检查既有完成记录和受测文件一致性，暂存变化不能被工作区恢复掩盖。保持已有 CI 历史模板回归。测试通过只证明工具行为，不能证明模型自动遵守。

## 实现任务

任务阶段与负责 AC 只由元数据维护。准备、红灯、实现、验证及事实回写在同一 Plan。

## 验收方式

准备检查后进入 ready 和 active。提交行为断言，逐条运行原生 tdd red，提交红灯记录后才开始实现。随后运行原生 Plan integration；所有任务完成后运行本 Release 的最终生产构建与 E2E。相同输入不重复检查。

## 设计回写

只更新 execution 的现有事实和边界。模板发布不保留建设期 Plan、Release 与清单；先提交维护证据，再按模板规则清理。

## 状态记录

已核对 CI、方法读取和实际学生执行轨迹。九类方法入口可解析，发现桥接无漂移。本轮新增程序约束的效果以原生运行记录为准，未实施时不声明完成。

## 准出条件

两条 AC 的同一路径由红灯转为通过，原生集成和 Release 检查通过，设计与入口一致。明确报告宿主直接写入仍不能由仓库 CLI 拦截，不把工具通过当作模型闭环通过。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [x] T2 · 提交真实行为测试并记录红灯 · done
- [ ] T3 · 实施最小存量修改 · doing
- [ ] T4 · 验证兼容性并回写设计 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
