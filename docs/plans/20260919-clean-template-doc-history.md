<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-004",
  "release": "ignite-template-baseline-v1",
  "status": "done",
  "outcome": "复制 Ignite 后只看到当前有用的文档真源、模板和一份可追溯的基线记录，而不继承模板建设期的任务档案",
  "contract_version": 2,
  "goals": [
    {
      "text": "清除模板建设期的 Plan、Release、运行证据和审计报告，并保持文档入口与校验可用",
      "requirements": [
        "REQ-PRODUCT-017"
      ]
    }
  ],
  "constraints": [
    "保留 Standards、Feature、Design、ADR、测试用例和可复用模板",
    "保留当前认证、Tasks 与模板执行机制的实际行为",
    "历史仍可从 Git 提交读取，不改写已应用数据库迁移"
  ],
  "non_goals": [
    "删除有实际使用者的 UI 组件或依赖",
    "把模板基线检查冒充某个衍生产品的实测",
    "重写历史 Git 提交"
  ],
  "authorization": {
    "source": "用户要求文档系统在复制后简洁、干净、有效，允许删除对后续项目无帮助的建设期资料"
  },
  "deliverables": [
    "精简后的 docs/plans 与 evidence",
    "正确的采用说明和当前状态",
    "防止建设期档案重新混入模板的检查"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "d08be6dae20f17572f1a49bc5e851006798622bc",
  "requirements": [
    "REQ-PRODUCT-017"
  ],
  "acceptance": [
    {
      "id": "AC-PRODUCT-015",
      "tests": [
        "tests/contracts/template-history.test.ts::[AC-PRODUCT-015] keeps template history out of a copied baseline"
      ]
    }
  ],
  "depends_on": [],
  "owner": "template-maintainer",
  "risk": "infrastructure",
  "write_scope": [
    "EXECUTION_AUDIT.md",
    "docs/",
    "tests/contracts/template-history.test.ts",
    "scripts/ignite/checks.mjs"
  ],
  "required_evidence": [
    "check-integration",
    "check-release"
  ],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20260919165542-15f025"
    },
    {
      "id": "check-release",
      "run_id": "run-20260919170145-151a48"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "1d53b67c5d23ef5e0085fd08eeda3e57a3cb2595",
  "updated_at": "2026-09-19"
}
-->

# 清理模板建设期文档

## 状态

以顶部 Plan 元数据为准。当前只处理文档包装，不改变产品功能。

## 目标

复制模板后，AI 先看到当前规格、设计事实、可复用模板和一个真实可验的基线，而不是 Ignite 建设过程中的一串旧任务。

## 原始目标与覆盖核对

| 用户目标                                     | 本轮处理                                                                 | REQ             | AC             |
| -------------------------------------------- | ------------------------------------------------------------------------ | --------------- | -------------- |
| 文档系统简洁干净有效，删除复制后无帮助的资料 | 移除旧 Plan、Release、证据及根目录审计；留下当前基线记录和必要的文档规则 | REQ-PRODUCT-017 | AC-PRODUCT-015 |

## 非目标

- 不删除 current Feature、Design、Standards、ADR 与测试用例。
- 不动 UI 组件、主题和产品代码。
- 不宣称使用模板创建的具体项目已通过验收。

## 变更类型

- 类型：`[存量改动]`
- 影响的存量路径：`docs/plans/`、`docs/others/evidence/`、根目录审计与采用说明。
- 兼容性：Git 历史仍保存原档案；当前 CLI 只消费保留的结构化记录。
- 数据迁移：无。

## 输入规格

- Feature：`docs/features/product.md`
- Standards：`docs/standards/adoption.md`、`docs/standards/workflow.md`
- Designs：`docs/designs/runtime.md`
- 可执行事实：`scripts/ignite/`、`tests/contracts/`

## 测试与验收设计

先建立复制基线的文档卫生检查，确认它会因现存建设期档案失败；清理后检查 Plan、Release、证据和派生状态相互一致。

## 实现任务

- [x] 删除无后续用途的模板建设期档案和重复状态。
- [x] 更新采用入口与文档职责说明。
- [x] 通过文档、治理、集成与发布检查。

## 验收方式

- 当前模板不包含旧建设期 Plan、Release、孤立运行证据和根目录整改报告。
- 新项目可从 `_template.md` 创建自己的 Plan；现有基线记录在新 Git 历史采用时可以按现有机制归档。
- 结构化状态和独立模板测试可通过。

## 设计回写

本轮不改变运行设计；采用与文档路由说明同步更新。

## 状态记录

| 时间       | 状态   | 说明                               |
| ---------- | ------ | ---------------------------------- |
| 2026-09-19 | draft  | 定义文档基线清理范围               |
| 2026-09-20 | active | 历史记录已移出工作区，准备正式验证 |
| 2026-09-20 | done   | 集成与发布检查通过，基线证据已绑定 |

## 准出条件

- [x] 当前版本的集成与发布证据绑定真实 commit。
- [x] Plan 完成后复制模板不再继承早期建设档案。
