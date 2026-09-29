<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790683745143711116",
  "release": "public-demo-and-capabilities-v1",
  "status": "active",
  "outcome": "访客能直接获取 Ignite、自动进入真实仪表盘体验并准确理解集成与扩展边界",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "首页区分 GitHub 获取入口、自动登录 Demo 与集成能力说明；Demo 复用原仪表盘和真实业务链路，数据按访客隔离并自动清理",
      "requirements": ["REQ-PRODUCT-020"]
    }
  ],
  "constraints": [
    "正式登录、注册和真实用户 Tasks 行为保持不变",
    "Demo 使用独立 Better Auth session 和临时账号；业务仍走原有 Hono API 与 Prisma，真实账号 cookie 与数据保持隔离",
    "只介绍源码中已交付的技术和能力，不把未来多端扩展说成已实现"
  ],
  "non_goals": [
    "不新增支付、真实访客账号、邮件服务、云存储、队列或其他外部集成",
    "不实现小程序、原生移动端或桌面端",
    "不修改 GitHub 仓库可见性、权限或发布设置"
  ],
  "authorization": {
    "source": "用户明确要求开始使用跳转 GitHub；预览时自动登录临时账号并进入原仪表盘，体验数据需自动恢复；另增加说明当前集成能力和扩展边界的页面"
  },
  "deliverables": [
    "首页 GitHub 开始使用、自动登录 Demo 预览及能力说明入口",
    "自动登录、复用原仪表盘、真实 Tasks CRUD 的短时 Demo 账号；退出/到期后清理临时账号与数据",
    "如实列出已集成能力、可立即开展的工作和未预置范围的说明页",
    "桌面与移动浏览器行为验收及当前事实设计回写"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "746306bcb1dd63ff2df1fbb0454ba113c85684dc",
  "requirements": ["REQ-PRODUCT-020"],
  "acceptance": [
    {
      "id": "AC-PRODUCT-018",
      "tests": [
        "tests/e2e/landing-preview.spec.ts::[AC-PRODUCT-018] auto-signs visitors into the real isolated dashboard and explains capabilities"
      ],
      "required_layers": ["browser", "database"],
      "checks": [
        {
          "test": "tests/e2e/landing-preview.spec.ts::[AC-PRODUCT-018] auto-signs visitors into the real isolated dashboard and explains capabilities",
          "layer": "browser"
        },
        {
          "test": "tests/e2e/landing-preview.spec.ts::[AC-PRODUCT-018] auto-signs visitors into the real isolated dashboard and explains capabilities",
          "layer": "database"
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
    "access_scope": "每次预览建立独立临时 Better Auth 用户/session；Tasks 仍经现有 Hook → Hono Typed RPC → route → Prisma，userId 只从对应 session 读取",
    "access_rationale": "真实仪表盘体验需要真实数据链路；每位访客独立临时身份避免共享账号互相覆盖，独立 auth cookie 保留已登录用户会话，临时用户只允许按 DemoSession 标记退出/到期清理",
    "migration_impact": "新增带 TTL 的 DemoSession 元数据表；不改现有业务表和真实用户数据",
    "rollback": "停止 Demo 入口、删除到期的 DemoSession 所属用户及数据，再回退新增 session 表与认证分流；真实用户记录不纳入删除条件。",
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
    "src/server/auth/",
    "src/server/api/session.ts",
    "src/server/api/index.ts",
    "src/app/api/demo/",
    "prisma/schema.prisma",
    "prisma/migrations/",
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

访客在首页能立即分辨如何取得模板、如何预览以及模板已集成什么。“预览 Demo”不是跳过登录，而是服务端自动创建并登录一个短时、独立的 Demo 账号，然后进入与正式用户相同的 `/dashboard`。现有 Tasks 页面、Hook、Typed RPC 和 Prisma 均照常工作；每位访客的数据独立，退出时删除，到期后失效并在后续 Demo 入口清理。普通账号的认证 Cookie 和数据不能被 Demo 覆盖。能力说明页以源码为准，列出已交付基础、可直接开展的工作和留待按需接入的边界。

## 原始目标与覆盖核对

| 用户原话或来源                                                  | 本轮目标                                              | REQ             | AC             | 处理                                   |
| --------------------------------------------------------------- | ----------------------------------------------------- | --------------- | -------------- | -------------------------------------- |
| “开始使用的话，就直接跳到我的 GitHub 仓库”                      | 首页主入口打开 `https://github.com/morewhyhan/Ignite` | REQ-PRODUCT-020 | AC-PRODUCT-018 | 直接到仓库，不打开认证面板             |
| “预览的话，就是进入那个 Demo…后面的仪表盘”                      | 自动建立 Demo 登录态并进入原有 `/dashboard`            | REQ-PRODUCT-020 | AC-PRODUCT-018 | 使用同一工作台与真实 Tasks 功能         |
| “修改什么之后，它也会自动地去恢复”                               | 每访客独立临时账号；退出删除，到期失效并清理            | REQ-PRODUCT-020 | AC-PRODUCT-018 | 不共用 Demo 用户，不触碰真实用户数据   |
| “多加一个页面说清楚…集成哪些东西…可以直接去做什么…可拓展性极高” | 新建能力说明页，准确区分已集成、可直接用和未预置能力  | REQ-PRODUCT-020 | AC-PRODUCT-018 | 不夸大未实现的原生多端或外部服务       |

## 输入规格与边界

相关真源：`docs/features/product.md`、`src/config/navigation.ts`、`src/server/api/routes/tasks/index.ts`、认证和首页组件、对应 E2E 测试。Demo 只增加临时账号入口和生命周期管理；原有 Tasks、Dashboard 和业务链路保持同一份实现。

## 测试与验收

`AC-PRODUCT-018` 使用 `tests/e2e/landing-preview.spec.ts` 检查仓库链接、自动登录并进入 `/dashboard`、真实 Tasks CRUD、访客间隔离、退出清理、普通账号会话保留、能力页事实准确及窄屏无横向溢出。集成前记录真实浏览器红灯；实现后运行本 Plan 集成检查。

## 实现与设计回写

首页预览通过 POST 创建临时身份和 DemoSession 元数据，再以独立 Demo auth cookie 重定向到原有 `/dashboard`；用户继续使用同一导航、认证感知和 Tasks Hook → RPC → Prisma。Demo session 绝对有效期为 60 分钟，退出时级联删除标记为 Demo 的用户和数据，新的预览入口清理已到期账号。普通认证 Cookie 单独保留。`/capabilities` 说明实际集成内容和未来扩展边界；完成后只需把已实现边界同步回 Design。

## 准出条件

AC-PRODUCT-018 浏览器用例验证真实 CRUD、至少两个访客隔离、退出清理、到期策略和普通账号会话保留；首页与能力页在桌面及窄屏通过。数据库迁移、类型检查和本 Plan 行为验收通过后，回写简明 Design 事实。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 对齐访客入口、Demo 隔离与能力说明规格 · done
- [ ] T2 · 编写并记录 Demo 与能力页行为红灯 · doing
- [ ] T3 · 实现首页入口、临时仪表盘和能力说明页 · doing
- [ ] T4 · 验证桌面与移动路径并回写设计事实 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
