# 文档系统

[返回项目介绍](../README.md) · [首次采用模板](./standards/adoption.md) · [开发工作流](./standards/workflow.md)

文档让人和 AI 都能查清三件事：要做什么、这轮做到哪里、系统现在是什么样。它们随代码一起维护，为下一次修改留下依据。

**本页导航**　[选择入口](#按当前任务选择入口) · [文档分工](#每类文档回答一个问题) · [开发循环](#文档如何进入开发循环) · [执行入口](#执行入口) · [文档与实现](#文档与实现的关系)

> 第一次使用：从[模板采用指南](./standards/adoption.md)开始。准备开发：先读 [AGENTS.md](../AGENTS.md)，再按下表进入本轮相关资料。

## 按当前任务选择入口

| 当前任务                     | 建议阅读                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 第一次用 Ignite 建项目       | [模板采用指南](./standards/adoption.md)：环境、项目身份、示例替换与交付边界                                                                 |
| 了解模板已经提供什么         | [产品基线](./features/product.md)、[认证](./features/auth.md)、[Tasks](./features/tasks.md)                                                 |
| 交给 AI 实现或修改功能       | [AGENTS.md](../AGENTS.md) → [工作流](./standards/workflow.md) → 对应 Feature、Design 和 Plan                                                |
| 查代码应该放在哪里、如何连接 | [架构规范](./standards/architecture.md)、[领域设计](./designs/domain.md)、[API 设计](./designs/api.md)、[数据库设计](./designs/database.md) |
| 判断工作是否真正完成         | [测试规范](./standards/testing.md)、[验收用例](./others/test-cases/)、[验证证据](./others/evidence/)                                        |
| 接入或调整 AI 工具           | [AI 工作台](../.ai/README.md)、[AI 协作规范](./standards/ai-agents.md)                                                                      |

普通业务开发只读本轮相关资料。只有修改执行器、验收或适配边界时，才需要阅读[执行工具规格](./features/execution.md)、[执行可信性规格](./features/ai-execution-trust.md)和[执行系统设计](./designs/execution.md)，无需每轮加载全部工具文档。

## 每类文档回答一个问题

| 入口                               | 回答的问题                           | 维护方式                                            |
| ---------------------------------- | ------------------------------------ | --------------------------------------------------- |
| [AGENTS.md](../AGENTS.md)          | AI 在这个项目里应怎样工作？          | 所有工具共用的项目执行规则，工具入口只引用它        |
| [Standards](./standards/README.md) | 开发应遵守哪些长期约定？             | 架构、API、数据库、安全、测试等标准，规则改变时更新 |
| [Features](./features/README.md)   | 用户需要什么，怎样才算做对？         | 按模块维护需求与验收标准                            |
| [Plans](./plans/README.md)         | 这轮怎么做，做到哪里，还缺什么？     | 记录方案、任务状态、范围和证据，保留过程            |
| [Designs](./designs/README.md)     | 系统现在实际怎样工作？               | 随实现更新，保存当前模块、接口、数据库等事实        |
| [Others](./others/README.md)       | 如何验收，重要取舍与交付记录在哪里？ | 按分类维护验收用例、ADR 和证据记录                  |

> **Plan 保存这一轮的过程，Design 保存当前的事实。** 下一轮开发从现行需求与设计出发，接续相关计划，避免把历史方案误当成当前实现。

---

## 文档如何进入开发循环

```text
Feature → Plan → Contract/Test → Implementation → Verify → Design
需求      计划    契约与行为测试    实现             验证      当前事实
```

Standards 约束整个过程。先明确需求与验收方式，再制定本轮计划、编写测试并实现；检查失败就定位和修复，超出授权或缺少外部条件则记录阻塞。验证通过后回写事实设计，让下一轮有据可依。完整顺序与准入、准出条件见[工作流](./standards/workflow.md)。

每轮先区分 `[新增模块]` 与 `[存量改动]`：新能力建立模块；修改现有能力或基础设施，要说明影响路径、兼容性、迁移和回归验证。风险强度由 Plan 的 `risk` 表达。

品牌、页面、Tasks 和当前视觉都属于可替换的模板基线。采用时按[采用指南](./standards/adoption.md)确定去留；没有具体项目目标时保留现状，不替用户猜测产品决定。

## 执行入口

先查看状态、读取目标模块的 Feature 与 Design，再接续匹配的未完成 Plan：

```text
pnpm ignite status
pnpm ignite next --plan <IGT-ID>
pnpm ignite check --plan <IGT-ID> --level auto
pnpm ignite release status
```

新的独立交付结果才创建 Plan：新增模块用 `pnpm create:module <plural-kebab-name>`，存量改动用 `pnpm create:change <kebab-name>`。脚手架生成草稿，需按实际目标完善需求、任务和验收。结构见 [Plan 模板](./plans/_template.md)，整轮发布范围见 [Release 说明](./plans/releases/README.md)。

活动运行和完整日志保存在 Git 忽略的 `.ignite/runs/`；通过的检查将脱敏摘要写入 [`others/evidence/runs/`](./others/evidence/runs/)。相同输入与环境的已有运行应复用，避免重复检查。状态表用 `pnpm ignite status --write` 生成，不手工维护第二份进度。

模板发布快照只带可复用资料，建设期任务与审计记录留在 Git 历史中；采用后的项目保留自己的 Plan、Release 和证据，不能套用模板清理规则。

## 文档与实现的关系

- **AGENTS 与 Standards** 是执行规则和长期工程约定。
- **Feature** 保存产品意图与验收标准，**Plan** 保存本轮过程、状态和证据引用。
- **Design** 是当前设计事实，也是下一轮 Plan 的依据。
- **源码、Prisma schema、测试与 `package.json`** 是可执行实现。

文档和实现不一致，代表仍有未完成的变更。应在任务范围内同步修正，或在 Plan 中明确记录差异，不能忽略其中一方。

---

[返回项目介绍](../README.md) · [工程标准](./standards/README.md) · [当前设计](./designs/README.md) · [版本更新](../CHANGELOG.md)
