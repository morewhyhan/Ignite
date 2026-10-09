<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791546105773634465",
  "release": "method-owner-steps-v1",
  "status": "active",
  "outcome": "方法入口保留所属必需步骤，文档准备明确原生 REQ 格式和关联 Release 草稿",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "让 AI 默认取得完整所属方法并写出配套文档准备",
      "requirements": ["REQ-METHOD-006"]
    }
  ],
  "constraints": [
    "规则继续以所属 README 为真源，不创建适配文件或第二份映射",
    "不为读取方法安装依赖",
    "学生观察仅准备，不实现或虚构通过证据"
  ],
  "non_goals": ["学生业务实现", "保证所有模型无错误", "全局安装技能"],
  "authorization": {
    "source": "用户：那你就你试啊，你把它完全优化好啊。"
  },
  "deliverables": [
    "返回所属编号步骤与必需正文的只读入口",
    "原 Feature/Plan 步骤明确 REQ 格式和 Release 草稿",
    "无提示模型观察与真实软件验收"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "d9c4930e6bdffa0ee1cd9a54f2d840c46b092baf",
  "requirements": ["REQ-METHOD-006"],
  "acceptance": [
    {
      "id": "AC-METHOD-006",
      "tests": ["tests/contracts/method-owner-steps.test.ts::[AC-METHOD-006]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/method-owner-steps.test.ts::[AC-METHOD-006]"
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
      "acceptance": ["AC-METHOD-006"],
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "phase": "implement",
      "acceptance": ["AC-METHOD-006"],
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
  "owner": "root",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "只读工具与文档规则，无业务数据",
    "migration_impact": "none",
    "rollback": "回退本轮提交",
    "destructive_authorization": null
  },
  "write_scope": [
    "scripts/ignite/skill-reader.mjs",
    "scripts/ignite/cli.mjs",
    "docs/features/ai-execution-trust.md",
    "docs/features/README.md",
    "docs/plans/README.md",
    "docs/designs/execution.md",
    "tests/contracts/method-owner-steps.test.ts",
    "docs/plans/20261009-method-owner-steps.md",
    "docs/plans/releases/method-owner-steps-v1.json",
    "docs/others/evidence/",
    "docs/others/ignite-status.md"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-METHOD-006",
      "test": "tests/contracts/method-owner-steps.test.ts::[AC-METHOD-006]",
      "run_id": "tdd-20261009114937-ecd657"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-09"
}
-->

# Ignite 实施计划：method-owner-steps

## 状态

状态以元数据为准，任务状态用原生命令维护。

## 目标

方法读取入口同时返回所属必需步骤，文档准备明确原生 REQ 格式和关联 Release 草稿。

## 原始目标与覆盖核对

| 用户原话或来源                                                   | 本轮目标                                               | REQ            | AC            | 处理结果             |
| ---------------------------------------------------------------- | ------------------------------------------------------ | -------------- | ------------- | -------------------- |
| 要实际试并完全优化；固定方法不能全部交给 AI 自选                 | 让原生方法入口保留所属步骤、明确文档配套关系           | REQ-METHOD-006 | AC-METHOD-006 | 纳入                 |
| 第二轮模型自动读齐七份方法，但普通复核仍遗漏 Release 与 REQ 格式 | 在原所属步骤说明原生可识别字段与草稿关联，不只要求认真 | REQ-METHOD-006 | AC-METHOD-006 | 纳入；另做无提示观察 |
| 方法是维护稳定的过程，不要求提速或额外适配文件                   | 继续直接读取 owner 真源，不创建第二份方法映射          | 约束           | 不适用        | 保留                 |

## 整体判断与推进顺序

前一读齐工具及类型真源修复已通过原生 Plan/Release 并由历史保留。本次新的实际缺口是已读方法后写出的准备文档仍不满足原生结构；固定维护方法没有明确提醒 REQ 解析格式与 Plan 引用的 Release 草稿关系，按 owner 的读取命令也只返回技能正文，漏掉 owner 的必需步骤。不能由七份正文已读推断整体文档准备合格。

先取得命令缺少 owner 步骤的真实失败，保持旧 API 和条件方法边界；再让入口返回原规则的编号必需步骤，并在 Feature/Plan 的原步骤说明原生语法和 Release 草稿。新模型观察仍不提供技能名或错误答案，不运行整个学生实现。文档稿仍不含真实行为测试，不能宣称 ready 或交付。软件断言与模型语义观察分开。

## 非目标

不开发学生业务，不增加全局安装、适配文件或模型比赛，不保证所有模型无错误。

## 变更类型

元数据记录存量改动。只读命令、所属规则和当前 Design 更新，无数据库变更；回退本轮提交。

## 输入规格

执行可信性 Feature、原 Feature/Plan 固定步骤、skill-reader、CLI、TEMP/自动使用复验.md 及原始工具观察。

## 已关闭问题

用户授权试验和实际优化，模型继续用既有 GPT-5.6-luna low。失败样本保留，不提示原试验者补答案以冒充冷启动通过。

## 测试与验收设计

AC-METHOD-006 真实调用现有 CLI，核对 owner 原编号步骤与完整必需正文，条件技能正文没有被加载；既有 AC-METHOD-004 保持原断言不修改。无提示模型观察另外核对 R/REQ、AC、任务顺序、Release scope 和不虚构证据。

## 实现任务

按元数据 tasks，真实红灯后修改，最后原生 integration 与 Release 验证。

## 验收方式

本 Plan 的软件验收与完整模板构建、浏览器回归使用原生命令。模型仅做准备，未写实际业务测试造成的预期门禁缺口不冒充通过。

## 设计回写

当前只读入口及必需步骤在 docs/designs/execution.md 回写。试验详情仍只留 TEMP，不混入发布模板。

## 状态记录

2026-10-09：接续复核仍没有自行补齐 Release 或原生 REQ 语法；新的步骤交付独立于已完成的读取工具交付，保留前轮完成记录，不改写失败。

## 准出条件

工具真实红绿、工程和 Release 证据齐全，模型观察按实际结果判定；所有未实现的学生功能保持未实现，不以调用次数或结构绿灯声称全部 AI 流程完成。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [x] T2 · 提交真实行为测试并记录红灯 · done
- [ ] T3 · 实施最小存量修改 · todo
- [ ] T4 · 验证兼容性并回写设计 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
