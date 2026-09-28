<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790564355969714854",
  "release": "template-clean-start-v1",
  "status": "active",
  "outcome": "复制模板后从干净任务上下文开始，同时保留工程规则与历史可追溯性",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "移除模板建设过程材料并保留可从零使用的文档",
      "requirements": ["REQ-EXECUTION-027"]
    },
    {
      "text": "解除验证器对维护记录常驻工作区的依赖",
      "requirements": ["REQ-EXECUTION-028"]
    }
  ],
  "constraints": [
    "保留运行源码、认证、Tasks、长期规则、规格、设计和回归测试",
    "删除的已提交材料仍可在 Git 历史恢复",
    "不以清理为由放宽业务验收"
  ],
  "non_goals": ["不更换技术栈或重排业务源码", "不发布新版本或移动现有标签"],
  "authorization": {
    "source": "用户 2026-09-28 要求逐层检查、直接清理不适合从零开始的材料并检查架构"
  },
  "deliverables": ["干净的 docs 入口和任务目录", "独立于模板建设历史的治理测试与 CI"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "b3f60644abb59aba0a3f159d39e71e6e7708c59d",
  "requirements": ["REQ-EXECUTION-027", "REQ-EXECUTION-028"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-027",
      "tests": [
        "tests/contracts/template-history.test.ts::[AC-EXECUTION-027] accepts a clean template without inventing archived history"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/template-history.test.ts::[AC-EXECUTION-027] accepts a clean template without inventing archived history",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-028",
      "tests": [
        "tests/contracts/ignite-cli.test.ts::[AC-EXECUTION-028] verifies retired template Plans from Git without accepting untested changes"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/ignite-cli.test.ts::[AC-EXECUTION-028] verifies retired template Plans from Git without accepting untested changes",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "逐层盘点并确定保留边界",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "记录空模板和历史验收覆盖的真实红灯",
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "清理过程材料并同步规范、索引和验证器",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "验收干净副本与 CI，保存本轮记录后清理发布快照",
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
  "write_scope": [
    "AGENTS.md",
    "README.md",
    "AI开发执行流程审计清单.md",
    "docs/",
    "scripts/ignite/governance.mjs",
    "scripts/ignite/state.mjs",
    "tests/contracts/template-history-baseline.ts",
    "tests/contracts/template-history.test.ts",
    "tests/contracts/ignite-cli.test.ts"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-027",
      "test": "tests/contracts/template-history.test.ts::[AC-EXECUTION-027] accepts a clean template without inventing archived history",
      "run_id": "tdd-20260928031411-da850d"
    },
    {
      "acceptance_id": "AC-EXECUTION-028",
      "test": "tests/contracts/ignite-cli.test.ts::[AC-EXECUTION-028] verifies retired template Plans from Git without accepting untested changes",
      "run_id": "tdd-20260928033729-84c157"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-09-28"
}
-->

# 模板干净起点

## 状态

以顶部元数据为准。

## 目标

模板只携带可复用的规则、当前规格、设计、空白模板与测试，不让新项目继承 Ignite 建设期的任务、整改报告和运行清单。

## 原始目标与覆盖核对

| 用户请求                                         | 本轮结果                                             | REQ               | AC               | 处理 |
| ------------------------------------------------ | ---------------------------------------------------- | ----------------- | ---------------- | ---- |
| 逐层检查，直接清理审计清单及不适合从零开始的文档 | 清理建设记录、修正导航、简化采用说明                 | REQ-EXECUTION-027 | AC-EXECUTION-027 | 保留 |
| 顺便检查架构不合适的地方                         | 消除测试与 CI 对模板旧 Plan 常驻的耦合，保留业务分层 | REQ-EXECUTION-028 | AC-EXECUTION-028 | 保留 |

## 非目标

不删除可复用 UI、认证、Tasks 或 migration；不重写 Git 历史，不推送或移动版本标签。

## 变更类型

- 类型：`[存量改动]`
- 无业务数据迁移。文档删除可从基线 commit 恢复；治理改动可独立回滚。

## 输入规格

- `docs/features/execution.md`、`docs/features/product.md`
- `docs/standards/workflow.md`、`docs/standards/adoption.md`
- `scripts/ignite/governance.mjs`、`tests/contracts/template-history-baseline.ts`

## 已关闭问题

执行记录先保存为 Git 提交，再从模板工作目录清理。具体产品仍保留自己的 Plan 和证据；兼容旧模板的 adopt-history 入口继续存在。

## 测试与验收设计

空模板夹具验证零历史的合法状态及孤立证据拒绝。CI 夹具验证已完成 Plan 的源码与证据仍可从 Git 核对，并故意移除证据或修改源码以确认拒绝。最终另做干净快照的文档、状态与完整测试检查。

## 实现任务

使用顶部 tasks。

## 验收方式

先记录两项行为红灯，再通过 Plan integration；完成当前 Release 验收后，将本 Plan 及关联证据提交保存，再清理执行记录并验证最终工作目录与 CI diff。

## 设计回写

更新采用流程、文档目录职责、当前执行设计。核对 app/module/server 分层，无需为本次清理新增业务层。

## 状态记录

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 逐层盘点并确定保留边界 · done
- [ ] T2 · 记录空模板和历史验收覆盖的真实红灯 · doing
- [ ] T3 · 清理过程材料并同步规范、索引和验证器 · todo
- [ ] T4 · 验收干净副本与 CI，保存本轮记录后清理发布快照 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

两项 AC 通过；断链和占位过程文本清除；保留功能规格与测试；最终工作目录零维护 Plan/Release/运行清单；工程验证真实通过，Git 历史仍保存本轮和原有维护记录。
