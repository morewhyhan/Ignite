# 验收证据

`.ignite/runs/` 保存本机运行状态和完整日志，已被 Git 忽略。只有成功运行才会在 `runs/` 发布 schema 2 脱敏清单：Plan、证据 ID、输入与环境指纹、commit、命令结果和日志哈希；这里不保存 PID、绝对路径、日志正文或 secret。

证据只证明它声明的层级。结构检查、Vitest、真实数据库、Playwright 和外部 provider 不能互相替代；缺少适用证据时，Plan 必须保持 `verifying` 或 `blocked`。

生成方式：

```text
pnpm ignite check --plan IGT-000 --level auto
pnpm ignite run status
pnpm ignite release status
```

证据与输入、运行环境和 commit 绑定。Plan 完成前，任一相关输入变化都会让旧证据失效；Plan 完成后，证据按当时 commit 保留为历史事实，新的代码变化必须由新的 Plan 覆盖。Release 状态由 Plan 与有效证据推导，不在 Release JSON 中手填。Ignite 模板发布快照只保留当前基线证据；建设期记录在 Git 历史中。具体产品保留自己的运行证据，不继承模板开发的旧运行清单。
