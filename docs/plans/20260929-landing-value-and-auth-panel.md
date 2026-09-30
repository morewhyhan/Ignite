<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790620890185389037",
  "release": "landing-value-and-auth-panel-v1",
  "status": "blocked",
  "outcome": "未登录访客能理解 Ignite 的核心价值和文档体系，并顺畅使用登录/注册面板",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "访客浏览首页即可理解模板的价值、文档职责，并能在桌面和手机上清楚地登录或注册",
      "requirements": ["REQ-PRODUCT-019"]
    }
  ],
  "constraints": [
    "保留现有邮箱密码登录、注册、校验、提交状态和认证 API 行为",
    "首页沿用现有语义主题令牌与组件体系，不添加外部服务、图库或新依赖",
    "保留价值区与文档区既定目标，只重排图示与信息层级，提升理解速度和说服力"
  ],
  "non_goals": ["不改变产品定位、认证方式或登录后的工作台", "不创建新的 GitHub Release 或变更版本标签"],
  "authorization": {
    "source": "用户要求改善登录注册面板、首页价值与文档目录展示，区分 GitHub 开始使用和注册登录后的预览；后续明确要求将 README 优化连同此前改动提交并推送 GitHub。"
  },
  "deliverables": [
    "以用户实际使用场景和交付结果为中心的首页价值介绍",
    "准确呈现 Ignite 文档职责、主线流转与 Plan / Design 区别的说明",
    "更清晰、响应式的登录/注册面板",
    "桌面与移动浏览器验收"
  ],
  "remaining_work": [
    "修复或明确现存 tests/contracts/mutation-guards.test.ts 的超时/诊断问题，并重新通过本 Plan 的集成门禁。",
    "本轮按用户反馈重写了价值与文档展示断言；既有 TDD 红灯记录对应修改前的测试内容。Plan 恢复 active 后，须为当前 AC 重新记录有效红灯，再由集成门禁绑定本轮通过结果。"
  ],
  "change_type": "存量改动",
  "base_commit": "358cc1b4393a7b20c468398b84491c559cd993bc",
  "requirements": ["REQ-PRODUCT-019"],
  "acceptance": [
    {
      "id": "AC-PRODUCT-017",
      "tests": [
        "tests/e2e/landing-auth-content.spec.ts::[AC-PRODUCT-017] explains Ignite value and document system before a responsive sign-in panel"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/landing-auth-content.spec.ts::[AC-PRODUCT-017] explains Ignite value and document system before a responsive sign-in panel",
          "layer": "browser"
        }
      ]
    }
  ],
  "verification_requirements": ["browser"],
  "tasks": [
    {
      "id": "T1",
      "title": "识别现有行为、写入边界和原始目标",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "补充需求和目标行为测试",
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "status": "done"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "status": "doing"
    },
    {
      "id": "T5",
      "title": "重构用户价值表达与文档体系说明",
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
  "owner": "integrator",
  "risk": "ui",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "只调整首页介绍与认证表单的展示结构，不改动认证服务、API、Session 或数据归属。",
    "migration_impact": "none",
    "rollback": "还原首页与认证面板组件即可；表单状态和认证 API 保持现状。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/plans/20260929-landing-value-and-auth-panel.md",
    "docs/plans/releases/landing-value-and-auth-panel-v1.json",
    "docs/others/evidence/tdd/",
    "docs/features/product.md",
    "docs/others/test-cases/product.md",
    "docs/designs/design.md",
    "src/modules/landing/components/landing-screen.tsx",
    "src/modules/landing/components/landing-value-story.tsx",
    "src/modules/landing/components/document-system-map.tsx",
    "src/config/site.ts",
    "src/modules/auth/components/auth-modal.tsx",
    "tests/e2e/landing-auth-content.spec.ts",
    "tests/e2e/auth.spec.ts",
    "tests/e2e/tasks.spec.ts",
    "tests/e2e/responsive.spec.ts"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-PRODUCT-017",
      "test": "tests/e2e/landing-auth-content.spec.ts::[AC-PRODUCT-017] explains Ignite value and document system before a responsive sign-in panel",
      "run_id": "tdd-20260928185529-a3b0c9"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": {
    "id": "TASKS-MUTATION-GUARD",
    "owner": "集成者",
    "reason": "现存 mutation-guard 测试在隔离运行时超时，未产生预期断言输出；Plan 处于 blocked 时不能为本轮更新后的 AC 重新记录 TDD 红灯",
    "resume_action": "先修复该测试的超时和诊断，将 Plan 恢复 active；再为当前 AC 记录真实红灯并重跑本计划集成检查"
  },
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-09-29"
}
-->

# Ignite 实施计划：landing-value-and-auth-panel

> 复制本文件到 `docs/plans/YYYYMMDD-landing-value-and-auth-panel.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

顶部元数据的 `status` 是唯一状态；正文不复制当前状态。`tasks` 是唯一的子任务状态，使用 `todo`、`doing`、`done`；真正阻塞时由 Plan 的 `status` 与 `blocker` 表达。不要在正文另建任务复选框。下方进度块由工具刷新，勿手改。

## 目标

让未登录访客在首页读懂 Ignite 为什么能帮助快速启动并持续修改项目、项目文档如何分工；打开认证面板后，能够清楚区分登录与注册并顺畅填写表单。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                                            | 本轮目标                                                                                      | REQ             | AC             | 处理结果                                                       |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------- | -------------- | -------------------------------------------------------------- |
| 用户指出登录/注册面板很丑                                                       | 简化认证面板层级、强化表单可读性并适配窄屏；不改变认证行为                                    | REQ-PRODUCT-019 | AC-PRODUCT-017 | 保留邮箱密码认证与现有 API 行为                                |
| 用户要求访客向下滚动能看到项目优势和文档体系                                    | 首页补充模板价值与文档分工说明，使访客登录前理解项目                                          | REQ-PRODUCT-019 | AC-PRODUCT-017 | 纳入首页正文与浏览器验收                                       |
| 用户明确价值页要说明何时用、实际得到什么；下一页要按项目文档与 PDF 讲清文档系统 | 价值页展示用户情境、具体交付结果和继续修改的影响；文档页解释规则入口、主线与 Plan/Design 分工 | REQ-PRODUCT-019 | AC-PRODUCT-017 | 按 README、docs/README.md、Standards 与 PDF 对齐文案和信息结构 |

进入 `ready` 前回看原始请求，确认目标、约束、必须保留的能力都已列入；不把 AI 自己改写后的 goals 当作原始输入。此表是语义审查记录，不能伪称机器已证明无遗漏。

## 非目标

把本轮不处理的范围写入顶部 `non_goals`，这里仅解释容易误解的边界。

## 变更类型

- 类型：`[存量改动]`

仅修改已有首页和认证面板的说明与布局，不改变接口、认证行为或存储；回滚时还原对应组件和文档即可，无迁移。未改动共享服务端文件。

涉及 `prisma/`、认证或业务 API 的 Plan，还要填写顶部 `data_contract`：资源属于谁、访问控制依据、迁移影响和恢复方式。删除或不可逆转换必须记录用户授权。简单决定写在这里即可；只有存在需要长期解释的架构取舍时才新增 ADR。

## 输入规格

只引用本轮相关的 Feature、Standards、Design、代码与测试：`docs/features/product.md`、`docs/standards/workflow.md`、`docs/designs/design.md`、首页/认证组件和 `tests/e2e/landing-auth-content.spec.ts`。本轮以当前设计系统为准，无外部原型；仅修改文案与展示，不触及认证接口或数据。

## 已关闭问题

顶部 `open_questions` 为空：本轮范围、内容重点与不改变认证行为的约束均已明确。

## 测试与验收设计

`AC-PRODUCT-017` 由 `tests/e2e/landing-auth-content.spec.ts` 的浏览器用例验收：首页优势与文档职责都可见；登录和注册入口可切换；在桌面与手机视口中认证面板不超出屏幕、标签和表单可用。认证是否真实成功由既有 `tests/e2e/auth.spec.ts` 继续回归。

## 实现任务

分解可交付工作至顶部 `tasks`，每项有稳定 ID、标题和状态。`remaining_work` 仅放尚未能转成明确任务的验收缺口，不重复列任务。

## 验收方式

新行为先写验收测试并提交规格基线，再对每条 AC 执行 `pnpm ignite tdd red --plan <IGT-ID> --ac <AC-ID>`。该命令只记录真实断言失败；环境错误和脚手架占位失败均不算。提交红灯记录后再实施，测试文件在红灯与绿灯之间保持不变。随后运行 `pnpm ignite check --plan <IGT-ID> --level integration`，完成本 Plan 后将它标记为 done。Release 中所有 Plan 都完成后，运行 `pnpm ignite release verify <release-id> --plan <done-plan-id>`，只对最终组合执行一次生产构建和全量浏览器回归。历史 `verification_contract: 1` Plan 继续按旧流程验证。

## 设计回写

完成后只回写受影响的当前事实到 `docs/designs/`，不把本 Plan 的过程说明复制过去。

### 2026-09-30 提交前复核

按用户要求一并提交已有首页改动，更新目录展示、两个按钮的浏览器断言，并同步认证、Tasks 和响应式测试的旧入口及邮箱定位。针对当前本地开发服务（localhost:3000）运行的 `AC-PRODUCT-017` 检查通过；`AC-PRODUCT-016` 主题回归未通过，点击主题按钮后未找到“海军蓝”选项，仍需排查。文档检查与 README 导航检查通过。

WSL 新命令暂时无响应，此次轻量检查使用 Windows Node 和独立的依赖解析入口，没有重装或修改 WSL 依赖。以上不替代规定运行时中的 Plan integration / Release 验收，也不作为有效 TDD 红灯归档；本 Plan 保持 blocked，既有验收缺口未被清空。

## 状态记录

<!-- ignite-progress -->

状态：`blocked`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [x] T2 · 补充需求和目标行为测试 · done
- [x] T3 · 实施最小存量修改 · done
- [ ] T4 · 验证兼容性并回写设计 · doing
- [x] T5 · 重构用户价值表达与文档体系说明 · done

验收缺口：修复或明确现存 tests/contracts/mutation-guards.test.ts 的超时/诊断问题，并重新通过本 Plan 的集成门禁。；本轮按用户反馈重写了价值与文档展示断言；既有 TDD 红灯记录对应修改前的测试内容。Plan 恢复 active 后，须为当前 AC 重新记录有效红灯，再由集成门禁绑定本轮通过结果。
证据：尚无
<!-- /ignite-progress -->

## 准出条件

每条 REQ 被 AC 覆盖，AC 有匹配层级的真实测试；`tasks` 全部完成，`remaining_work` 清空；`integrated_commit` 可追溯，所需证据属于当前输入与环境；Design 已回写。只有这些条件经验证成立，才把 Plan 标记为 `done`。
