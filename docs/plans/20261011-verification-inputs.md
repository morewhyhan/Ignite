<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791658072893651720",
  "release": "verification-inputs-v1",
  "status": "done",
  "outcome": "在开工和检查前拒绝变更后的红灯断言，并准确区分开发与生产浏览器验证输入。",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "verification_contract": 2,
  "goals": [
    {
      "requirements": ["REQ-METHOD-019"],
      "text": "及时识别当前红灯用例变更，避免继续实施或检查后才发现证据无效"
    },
    {
      "requirements": ["REQ-METHOD-020"],
      "text": "允许显式选择生产 E2E，且运行模式变化使旧证据失效"
    }
  ],
  "constraints": [
    "不修改正在运行的学生副本，不提供修复提示。",
    "保留原生红灯、Plan、Release 和历史证据规则，不降低检查标准。",
    "仅本地修改和提交，不推送、部署或改业务数据库。"
  ],
  "non_goals": [
    "不把学生系统实现合入模板。",
    "不把生产模式绕行当作开发服务器路由问题已根治。",
    "不改变测试断言冻结规则，不伪造或重写旧红灯。"
  ],
  "authorization": {
    "source": "用户要求继续修复试跑发现的问题，并重新验证完整执行；沿用本地开发、提交和子智能体测试授权。"
  },
  "deliverables": [
    "开工与日常校验读取当前用例的证据检查。",
    "显式 E2E 模式传递与环境指纹。",
    "真实回归、原生 Plan/Release 证据和当前 Design。"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "2b2c2529eed54c407ab2f8c9c71dfc7b01adddf9",
  "requirements": ["REQ-METHOD-019", "REQ-METHOD-020"],
  "acceptance": [
    {
      "required_layers": ["unit"],
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/method-recovery.test.ts::[AC-METHOD-019] rejects changed live red assertions before implementation"
        }
      ],
      "tests": [
        "tests/contracts/method-recovery.test.ts::[AC-METHOD-019] rejects changed live red assertions before implementation"
      ],
      "id": "AC-METHOD-019"
    },
    {
      "required_layers": ["unit"],
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/verification-inputs.test.ts::[AC-METHOD-020] preserves E2E server selection and invalidates evidence across modes"
        }
      ],
      "tests": [
        "tests/contracts/verification-inputs.test.ts::[AC-METHOD-020] preserves E2E server selection and invalidates evidence across modes"
      ],
      "id": "AC-METHOD-020"
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "确认试跑缺口与回归断言",
      "phase": "prepare",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "提交真实行为测试并记录红灯",
      "phase": "red",
      "acceptance": ["AC-METHOD-019", "AC-METHOD-020"],
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "phase": "implement",
      "acceptance": ["AC-METHOD-019", "AC-METHOD-020"],
      "status": "done"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "phase": "verify",
      "status": "done"
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
    "rollback": "回滚本轮工具提交；保留历史原始证据",
    "access_scope": "not-applicable",
    "migration_impact": "none",
    "destructive_authorization": null,
    "access_rationale": "只改工程验证工具，不读写业务数据"
  },
  "write_scope": [
    "scripts/ignite/source-analysis.mjs",
    "scripts/ignite/state.mjs",
    "scripts/ignite/core.mjs",
    "scripts/run-e2e.mjs",
    "tests/contracts/method-recovery.test.ts",
    "tests/contracts/verification-inputs.test.ts",
    "docs/features/ai-execution-trust.md",
    "docs/standards/testing.md",
    "docs/designs/execution.md",
    "docs/plans/20261011-verification-inputs.md",
    "docs/plans/releases/verification-inputs-v1.json",
    "docs/others/evidence/tdd/",
    "docs/others/evidence/runs/",
    "docs/others/ignite-status.md"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-METHOD-019",
      "test": "tests/contracts/method-recovery.test.ts::[AC-METHOD-019] rejects changed live red assertions before implementation",
      "run_id": "tdd-20261010192753-c16774"
    },
    {
      "acceptance_id": "AC-METHOD-020",
      "test": "tests/contracts/verification-inputs.test.ts::[AC-METHOD-020] preserves E2E server selection and invalidates evidence across modes",
      "run_id": "tdd-20261010192804-a33e9c"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20261010200614-b59eb2"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "a503f638049aff21a9b201f134ffc64ee60c5819",
  "updated_at": "2026-10-10"
}
-->

# 验证输入一致性修复

## 状态

状态由顶部元数据与原生进度块生成。

## 目标

在 AI 继续实施或启动检查前发现红灯用例变化，确保开发与生产 E2E 的证据不能混用。

## 原始目标与覆盖核对

| 用户要求与实际来源                                                                        | 目标                                       | REQ              | AC            | 处理结果 |
| ----------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------- | ------------- | -------- |
| 用户要求修复试跑问题、验证完整闭环；副本 AC-STUDENTS-004 已改变绑定用例，但日常校验仍通过 | 当前用例必须与红灯一致，及时拒绝变更       | REQ-METHOD-019   | AC-METHOD-019 | 纳入     |
| 同一试跑因开发路由扫描失败自行新增生产模式透传；静态审查确认模式不进入环境指纹            | 显式选择必须贯穿 E2E 运行器和证据身份      | REQ-METHOD-020   | AC-METHOD-020 | 纳入     |
| 用户要求保持可复用模板、让智能体独立运用方法                                              | 修复原生工具，不改副本业务、不提供方法提示 | Plan constraints | 上述两项      | 保留     |

## 整体判断与推进顺序

红灯记录保存的是原始用例。当前 state 校验在未完成 Plan 上把 finalSource 指回 redSource，因此自动与自己比较；独立读取当前用例已证明删除案例变化未被及时发现。先用原生任务命令复现错误接受，再改当前文件读取，保留完成 Plan 对被测 commit 的历史核对。

副本新增 E2E_SERVER_MODE 只有透传与运行选择，没有证据身份。模板尚未采纳该改动。先用真实安全环境入口、环境指纹和 E2E 启动边界证明旧行为不支持显式选择，再一起实现传递和身份。E2E 测试替身只证明运行器边界，不证明学生业务或真实浏览器行为；最终模板 Release 仍执行真实生产浏览器回归。

两项都属于完整验证输入。子智能体的学生结果独立保留，不把本轮模板工具绿灯当作它已闭环。开发路由扫描与挂载目录超时仍等待独立试跑证据，不用这两项修复宣称根治。

## 非目标

不合入学生业务，不降低红灯一致性检查，不清除或改写失败历史，不推送或部署。

## 变更类型

存量工程工具修复。只读当前测试与历史 Git 文件，新增安全运行选择；没有业务数据变更。可回滚本轮代码提交，旧记录继续保存。

## 输入规格

依据 ai-execution-trust Feature、Plan README、testing 标准与 execution Design。实现入口为 state、core、run-e2e；复现来源是 TEMP 中公开调用和当前文件审查，不读取私有推理。

## 已关闭问题

用户已授权继续修复实际问题；工程选择按现有契约执行。生产 E2E 指已构建的本地 Next 服务器，不代表部署生产；调用者须先准备构建。

## 测试与验收设计

AC-METHOD-019 用临时 Git 仓库和原生 task set-status 命令，验证原始断言允许、修改后拒绝且 Plan 不被写成完成、还原后允许。临时证明数据只属于测试 fixture，正式 Plan 使用原生真实失败回执。

AC-METHOD-020 用实际安全环境、身份函数与 E2E 运行器，验证开发/生产选择传递到子进程，模式改变指纹、默认与 development 相同。Prisma 与 Playwright 子程序为观察执行边界的替身；不据此声称真实数据库或浏览器通过。

## 实现任务

先完成并提交以上测试与规格，记录两项真实行为红灯，再实施输入核对及模式选择，最后集成、回写 Design 与 Release 验收。

## 验收方式

先 plan validate --prepare，再原生 tdd red 逐 AC 运行。实现后运行 check --level auto；Plan 完成后执行 verification-inputs-v1 Release 的真实生产构建和全量 E2E。

## 设计回写

说明未完成 Plan 如何核对当前断言、完成 Plan 如何核对被测版本，以及 E2E 模式如何进入证据身份。

## 状态记录

基线 2b2c252，原模板干净。学生副本独立试跑，不接受父智能体业务或方法修复提示。本轮尚未实现或生成通过证据。

## 准出条件

两项 AC 均有真实失败、对应绿灯和当前版本 Plan integration；原有历史、验收严格性和模板浏览器回归通过；Design 已回写，Release 与本地交付覆盖有效。

<!-- ignite-progress -->

状态：`done`（由元数据生成）

- [x] T1 · 确认试跑缺口与回归断言 · done
- [x] T2 · 提交真实行为测试并记录红灯 · done
- [x] T3 · 实施最小存量修改 · done
- [x] T4 · 验证兼容性并回写设计 · done

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20261010200614-b59eb2
<!-- /ignite-progress -->
