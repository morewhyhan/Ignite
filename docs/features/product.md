# Ignite 产品与模板规格

## 当前状态

- 项目身份以 `.ai/project.json` 的 `mode` 为准；当前是模板基线。
- 产品名称：Ignite
- 目标用户：需要快速启动个人项目、比赛或黑客松产品的开发者
- 核心价值：提供可运行、可验证、方便 AI 理解和继续扩展的全栈基线

采用为具体项目后，应把 `.ai/project.json` 的 `mode` 改为 `adopted`，并用真实产品信息替换本节。

## 背景与目标

Ignite 不是一个固定业务产品，而是一个可复制的全栈模板。它通过明确的模块边界、规格文档、类型安全 RPC 和自动化测试，降低从想法到可运行产品的启动成本。

## 模板边界

| 分类         | 当前内容                                        | 采用时决策             |
| ------------ | ----------------------------------------------- | ---------------------- |
| 核心基础设施 | 认证、Hono RPC、Prisma、React Query、环境和测试 | 默认保留               |
| 产品外壳     | Landing、Dashboard、Settings、Theme、品牌       | 替换成真实产品         |
| 参考业务     | Tasks 完整纵向切片                              | 保留、改造或删除三选一 |

## 非目标

- 不默认提供企业级多租户、支付、审计或微服务。
- 不把 SQLite 定位成无状态生产平台的持久数据库。
- 不要求所有衍生项目保留 Tasks。
- 不为了展示架构而提前创建没有业务复用价值的空层。

## 业务规则

- R1（REQ-PRODUCT-001）：AI 必须先识别当前状态是模板基线还是已采用项目。
- R2（REQ-PRODUCT-002）：新增业务使用独立模块；修改现有能力必须标记存量影响。
- R3（REQ-PRODUCT-003）：可复用基础设施与一次性业务需求必须分开。
- R4（REQ-PRODUCT-004）：采用时必须更换项目 slug 和本地 secret，避免多个衍生项目 Cookie 冲突。
- R5（REQ-PRODUCT-005）：每个行为变化都必须经过规格、Plan、测试和设计回写闭环。
- R6（REQ-PRODUCT-006）：Plan 只有在必需证据来自当前输入、当前环境且绑定真实 Git commit 时才能完成。
- R7（REQ-PRODUCT-007）：检查范围必须由 Plan 基线与实际改动推导，AI 只能提高、不能降低最低风险等级。
- R8（REQ-PRODUCT-008）：同一输入的检查只能运行一次；运行中、通过、失败、失联和阻塞必须是不同状态。
- R9（REQ-PRODUCT-009）：Release 状态必须由纳入 Plan 和证据自动推导，不能手工声明完成。
- R10（REQ-PRODUCT-010）：每条验收标准必须能追踪到实际启用的测试和运行证据，Design 与源码边界必须能检测结构性漂移。
- R11（REQ-PRODUCT-011）：验证、状态读取和测试不得产生与任务无关的工作区修改，也不得提交原始日志、绝对路径或敏感输出。
- R12（REQ-PRODUCT-012）：Windows 与 WSL 的依赖、进程和证据不得交叉复用；项目必须提供可检查的规范化运行环境。
- R13（REQ-PRODUCT-013）：采用模板时，项目身份、全部推送目标和运行环境必须按实际配置值判定，并给出可执行的修复动作；无法静态核实的运行时配置必须明确拒绝，不执行应用代码或猜测配置值。
- R14（REQ-PRODUCT-014）：任务依赖、状态迁移和实际执行必须使用一致的准入判断，不能把另一任务的修改归给当前任务；运行控制进程中断后，其检查子进程必须自动停止，并留下可接续的失败或孤儿状态。
- R15（REQ-PRODUCT-015）：验收必须核对真实发现和执行的测试，证据必须来自可追溯的运行，环境变化应使相关结果失效；关键私有资源访问要用故障注入证明测试会因权限过滤失效而失败。
- R16（REQ-PRODUCT-016）：已有数据升级和 Git 合并后的最终版本必须重新验证，不得用空库结构或旧提交代替实际交付结果；迁移检查必须使用关联有效的样本，在隔离文件数据库中经 Prisma 逐版本部署，并核对旧记录和外键完整性。只有远端分支提交与本地 HEAD 相同时，才能报告该版本已同步。

## 原型与交互

- 当前没有外部原型链接。
- 可执行参考界面位于 `/`、`/dashboard`、`/dashboard/tasks` 和 `/dashboard/settings`。
- 视觉规则见 [`../designs/design.md`](../designs/design.md)。

## 验收标准

- AC-PRODUCT-001（REQ-PRODUCT-001）：Given 全新克隆，When 按 README 配置环境，Then 可以部署 migration、启动项目并运行基线测试。
- AC-PRODUCT-002（REQ-PRODUCT-004）：Given 开发者采用模板，When 更换名称、slug 和 secret，Then 新项目不会与其他本地衍生项目共享认证 Cookie。
- AC-PRODUCT-003（REQ-PRODUCT-002、REQ-PRODUCT-003、REQ-PRODUCT-005）：Given 新增业务，When AI 读取规则，Then 它建立独立模块并生成 Feature、Plan、测试和设计更新。
- AC-PRODUCT-004（REQ-PRODUCT-003、REQ-PRODUCT-005）：Given 决定删除 Tasks，When 执行采用计划，Then 认证和路由守卫仍保留独立回归覆盖。
- AC-PRODUCT-005（REQ-PRODUCT-006）：Given 缺少运行记录、证据过期或 commit 无效，When AI 尝试完成 Plan，Then 状态校验必须拒绝。
- AC-PRODUCT-006（REQ-PRODUCT-007）：Given 实际改动属于更高风险等级，When AI 指定较低等级或遗漏文件，Then 检查入口必须拒绝降级并使用真实改动范围。
- AC-PRODUCT-007（REQ-PRODUCT-008）：Given 相同检查正在运行或会话中断，When 另一个 AI 请求同一检查，Then 系统复用唯一运行并准确报告 pending、orphaned 或 retryable。
- AC-PRODUCT-008（REQ-PRODUCT-009）：Given Release 纳入多个 Plan，When 生成状态，Then Release 结果完全由 Plan 和必需证据推导。
- AC-PRODUCT-009（REQ-PRODUCT-011、REQ-PRODUCT-012）：Given 全新克隆、使用模板创建新 Git 历史或切换 Windows/WSL，When 执行模板诊断和验证，Then 环境错误会在运行测试前被明确阻止，继承记录可预览并原样归档，验证结束后工作区保持干净。
- AC-PRODUCT-010（REQ-PRODUCT-010）：Given 任意 REQ、AC 或架构边界，When 查询覆盖关系和校验当前实现，Then 能定位实际启用的测试、运行证据与 Design 契约，并拒绝绕过 Hook、Typed RPC、服务端边界或模块公开入口。
- AC-PRODUCT-011（REQ-PRODUCT-013）：Given 合法的不同配置写法与不同 Git 来源，When 执行项目接管检查，Then 按真实值识别身份、密钥和远端归属，并明确缺失能力。
- AC-PRODUCT-012（REQ-PRODUCT-014）：Given 循环依赖、其他任务的独立提交或运行控制进程中断，When 任务进入实施、集成或恢复，Then 系统提前拒绝不可执行任务、不误报修改归属，并停止失去控制进程的检查子进程，恢复时不发布虚假通过证据。
- AC-PRODUCT-013（REQ-PRODUCT-015）：Given 未运行的指定用例、伪造结果或影响测试的环境变化，When 校验完成条件，Then 不允许复用不匹配的证据或宣称验收通过。
- AC-PRODUCT-014（REQ-PRODUCT-016）：Given 已有数据或改写提交身份的合并，When 验证升级与交付，Then 检查最终快照的数据和证据，发现丢失或过期即失败。
