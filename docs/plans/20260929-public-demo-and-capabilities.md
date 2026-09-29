<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790683745143711116",
  "release": "public-demo-and-capabilities-v1",
  "status": "active",
  "outcome": "访客能直接获取 Ignite、免登录体验仪表盘，并准确理解已集成与可扩展边界",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "首页清楚区分 GitHub 获取入口、免登录 Demo 与集成能力说明；Demo 可操作但永不改动访客账户或服务端数据",
      "requirements": ["REQ-PRODUCT-020"]
    }
  ],
  "constraints": [
    "正式登录、注册和真实用户 Tasks 行为保持不变",
    "Demo 与真实登录态、Hono API、Prisma 数据库隔离",
    "只介绍源码中已交付的技术和能力，不把未来多端扩展说成已实现"
  ],
  "non_goals": [
    "不新增支付、真实访客账号、邮件服务、云存储、队列或其他外部集成",
    "不实现小程序、原生移动端或桌面端",
    "不修改 GitHub 仓库可见性、权限或发布设置"
  ],
  "authorization": {
    "source": "用户明确要求首页提供开始使用与预览两个入口，开始使用跳转其 GitHub 仓库，预览进入临时数据 Demo 仪表盘，并增加解释集成能力和可扩展边界的独立页面"
  },
  "deliverables": [
    "首页 GitHub 开始使用、免登录预览及能力说明入口",
    "无服务端写入、离开/刷新即还原的交互式 Demo 仪表盘",
    "如实列出已集成能力、可立即开展的工作和未预置范围的说明页",
    "桌面与移动浏览器行为验收及当前事实设计回写"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "3fc622213af9799de79b99c98b6326f62788603c",
  "requirements": ["REQ-PRODUCT-020"],
  "acceptance": [
    {
      "id": "AC-PRODUCT-018",
      "tests": [
        "tests/e2e/landing-preview.spec.ts::[AC-PRODUCT-018] routes visitors to GitHub or a resettable demo and explains shipped capabilities"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/landing-preview.spec.ts::[AC-PRODUCT-018] routes visitors to GitHub or a resettable demo and explains shipped capabilities",
          "layer": "browser"
        }
      ]
    }
  ],
  "verification_requirements": ["browser"],
  "tasks": [
    {
      "id": "T1",
      "title": "对齐访客入口、Demo 隔离与能力说明规格",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "编写并记录 Demo 与能力页行为红灯",
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "实现首页入口、临时仪表盘和能力说明页",
      "status": "doing"
    },
    {
      "id": "T4",
      "title": "验证桌面与移动路径并回写设计事实",
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
  "owner": "integrator",
  "risk": "feature",
  "data_contract": {
    "access_scope": "访客 Demo 仅操作客户端内存中的固定示例任务，不读取或写入真实账号、Hono 业务 API 或 Prisma 数据",
    "access_rationale": "匿名预览是展示路径而非真实账户；内存态避免访客互相影响、数据库清理任务及真实数据污染。正式登录工作台保持原有用户归属与持久化行为。",
    "migration_impact": "none",
    "rollback": "撤回 /demo 和能力说明页面、移除首页入口并恢复原始 CTA；不涉及数据回滚。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/product.md",
    "docs/others/test-cases/product.md",
    "docs/designs/design.md",
    "docs/plans/20260929-public-demo-and-capabilities.md",
    "docs/plans/releases/public-demo-and-capabilities-v1.json",
    "docs/others/evidence/tdd/",
    "src/config/site.ts",
    "src/modules/landing/components/landing-screen.tsx",
    "src/modules/demo/",
    "src/modules/capabilities/",
    "src/app/demo/",
    "src/app/capabilities/",
    "tests/e2e/landing-auth-content.spec.ts",
    "tests/e2e/landing-preview.spec.ts"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-09-29"
}
-->

# Ignite 实施计划：public-demo-and-capabilities

## 目标

访客在首页能立即分辨如何取得模板、如何预览以及模板已集成什么。预览不需要注册，呈现类似工作台的样例仪表盘，允许尝试任务操作，但任何改动只存在当前页面内存，刷新、离开或重置后恢复；正式登录工作台仍按真实账号持久化。能力说明页以源码和规格为依据，列出已交付基础、可直接开展的工作和刻意留给后续按需接入的边界。

## 原始目标与覆盖核对

| 用户原话或来源                                                  | 本轮目标                                              | REQ             | AC             | 处理                                   |
| --------------------------------------------------------------- | ----------------------------------------------------- | --------------- | -------------- | -------------------------------------- |
| “开始使用的话，就直接跳到我的 GitHub 仓库”                      | 首页主入口打开 `https://github.com/morewhyhan/Ignite` | REQ-PRODUCT-020 | AC-PRODUCT-018 | 直接到仓库，不打开认证面板             |
| “预览的话，就是进入那个 Demo…后面的仪表盘”                      | 提供免登录仪表盘和可操作样例任务                      | REQ-PRODUCT-020 | AC-PRODUCT-018 | 独立于受保护的正式 Dashboard 路由      |
| “这些数据…只是让他体验一下子”                                   | 操作只改客户端内存；离开、刷新或手动重置即还原        | REQ-PRODUCT-020 | AC-PRODUCT-018 | 不调用真实业务 API，不建立共享演示账号 |
| “多加一个页面说清楚…集成哪些东西…可以直接去做什么…可拓展性极高” | 新建能力说明页，准确区分已集成、可直接用和未预置能力  | REQ-PRODUCT-020 | AC-PRODUCT-018 | 不夸大未实现的原生多端或外部服务       |

## 输入规格与边界

相关真源：`docs/features/product.md`、`docs/standards/workflow.md`、`docs/designs/design.md`、`src/config/navigation.ts`、`src/server/api/routes/tasks/index.ts`、认证和首页组件、对应 E2E 测试。正式 Tasks 的 Hook → Hono Typed RPC → Hono route → Prisma 链路不变；Demo 是明确隔离的只读服务端、可交互客户端预览，不伪装成生产全栈验收。

## 测试与验收

`AC-PRODUCT-018` 使用 `tests/e2e/landing-preview.spec.ts` 检查仓库链接、免登录进入 Demo、示例任务临时变更与刷新还原、没有 `/api/tasks` 写入请求、能力页真实说明及窄屏无横向溢出。集成前先使用 `pnpm ignite tdd red --plan IGT-1790683745143711116 --ac AC-PRODUCT-018` 记录真实浏览器断言红灯；实现后测试文件保持不变并运行本 Plan 集成检查。

## 实现与设计回写

以最小独立路由实现 `/demo` 与 `/capabilities`。Demo 不调用认证 Hook、业务 Hook 或浏览器持久化存储；访客手动重置或页面重新加载/退出即回到固定样例。首页 CTA 清楚区分 GitHub 获取、Demo 预览与可选账号登录。结束时回写 `docs/designs/design.md` 当前页面和数据边界事实。

## 准出条件

AC-PRODUCT-018 浏览器用例在桌面和移动视口通过；Demo 不发起业务 CRUD 请求且刷新后恢复样例；能力说明无超出源码事实的承诺；任务完成、`remaining_work` 清空，当前 Design 与实现一致并留有集成证据。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 对齐访客入口、Demo 隔离与能力说明规格 · done
- [ ] T2 · 编写并记录 Demo 与能力页行为红灯 · doing
- [ ] T3 · 实现首页入口、临时仪表盘和能力说明页 · doing
- [ ] T4 · 验证桌面与移动路径并回写设计事实 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
