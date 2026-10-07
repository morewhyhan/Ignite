# Ignite 对 pstack 的适配

pstack 的工程原则、51 个主技能、23 个 playbook、Agent 定义及 Benny 配套技能完整保留。本页明确继承流程怎样在 Ignite 运行；读到原文中的工具、模型、授权或交付约定时，按本页映射。它不取代根目录 [AGENTS.md](../../AGENTS.md) 或各文档目录的规则真源。

## 目标与尺度

先确认用户要拿到的具体结果，选择足够完成该结果的技能。明确的小改动直接执行；普通提问直接回答。涉及实现、架构或复杂诊断时使用 poteto-mode 选择一个合适 playbook，按需读叶技能和参考文件，不加载全部方法。Laziness Protocol、Subtract Before You Add 和 Sequence Verifiable Units 用于保持改动小、结果可见。

迁移和使用方法论不以技能跑分、速度比较、重复模型对照或多 Agent 实验为前置门槛。eval、benchmark、hillclimb 完整保留，只有用户确实要求评估/性能优化，或实际交付需要测量时才采用。方法文件与引用的完整性可以检查；代码和实际产品行为继续按 Ignite 原生验收。不能把文件检查说成模型效果已证明。

## 项目流程与真源

- 使用已有 Feature → Plan → Contract/Test → Implementation → Verify → Design。继承 playbook 的步骤映射到当前 Plan 的 tasks，不另造 todo/状态/验收账本。
- 本轮沿用匹配的未完成 Plan；需求回 docs/features，行动回 docs/plans，事实回 docs/designs，证据回 docs/others。来源说明保存方法 provenance，不是平行项目规则。
- 脚手架、红灯、运行时、数据库、Plan integration 和 Release 的执行按现有项目规则。仅文档/方法迁移不虚构数据库、浏览器或生产验收。
- 原文的 commit/PR/ship 结束步骤按用户实际交付范围执行。本地迁移不自动创建 PR、推送、合并或部署。

## 工具与模型映射

| 继承约定 | Ignite 的执行方式 |
| --- | --- |
| Cursor Task、poteto-agent、generalPurpose、run_in_background | 使用当前宿主实际可用的委派能力；没有专属 Agent 类型时，将 agents/poteto-agent.md 的角色和相应技能明确交给可用 Agent。没有委派工具就由当前 Agent 执行必要步骤并披露限制。 |
| grok/opus 固定模型、pstack-models.mdc、强制多模型 | 默认继承当前模型和设置。不猜模型名称、不付费换服务；用户明确配置且宿主支持后才使用指定角色模型。多模型不可用不冒充独立多模型审查。 |
| MCP 枚举、gh、control-ui/control-cli、deslop、create-skill | 使用已经可用且授权的对应工具；技能创作采用宿主 skill-creator。缺少外部插件时使用合适现有工具完成必要步骤，并说明限制，不自动安装或把缺工具说成已执行。 |
| .cursor/projects transcript、agent-transcripts | 只使用本任务明确可读的当前会话记录。不能遍历其他项目或导出私有推理/系统指令。 |
| /setup-pstack 写全局或 Cursor 模型规则 | 本项目的可选能力配置写 .ai/pstack/config.json，保留当前模型默认值；其他平台入口只桥接，不复制规则。不改用户全局配置。 |
| Cursor /loop、agents 窗口、slash custom mode | 按当前宿主实际支持的调用/持续执行方式使用；命令语法不通用，不能承诺其他宿主具有同一 UI 功能。 |

并行有明确收益且当前授权覆盖时才委派；简单任务不强制调查波次、设计竞技或多轮复核。委派提供原始目标、边界、写入范围、交付物和停止条件，使用隔离资源；整合者负责检查实际结果。不能因原文写 default fan-out 就扩大工作范围。

## 权限与可选自动化

技能不授予新权限。原文的“external actions proceed”不能授权消息发送、工单写入、推送、合并、部署、数据删除或生产访问；按当前用户授权与宿主规则执行。已有授权不重复询问。原文泛化的 always-pause 也不能让已授权的普通可逆工作反复等待。

Benny 的文档、脚本和3个技能完整携带，作为可选自动化资源；克隆仓库不启用定时任务、webhook、Tailscale、Bot或云服务。只有用户要求该集成时才配置对应 provider、权限和环境变量，secret不进Git。可选自动化代码作为随附资源，排除在根项目的TypeScript、ESLint和Prettier范围之外；启用时在该子项目独立准备依赖和验收。

## 发现与调用

真源是本目录，入口为 [技能目录](CATALOG.md)。Codex 的 .agents/skills、Claude Code 的 .claude/skills、Cursor 的 .cursor/skills、OpenCode 的 .opencode/skills 保存轻量 SKILL.md 桥接，仅有元数据和真源链接。根 AGENTS.md 同时登记任务路由，供不支持这些发现目录的工具按路径读取。Copilot 通过已有项目规则入口读取同一目录。

支持项目技能发现的宿主加载仓库后可按描述选择技能；需要显式调用时使用宿主支持的技能菜单/名称。已有会话是否刷新目录由宿主决定，必要时重新打开项目会话；不需要将这些方法安装到每个人的全局技能目录。

## 来源与维护

来源为 Lauren Tan 的 pstack，MIT许可，上游快照 d0ef80d86795816da932a153458c5dbe192d294e。上游版权与 LICENSE 保留；[sources.json](sources.json)逐文件保存上游哈希、本地哈希与适配方式。上游原始模型/工具段落作为继承背景保留，执行以本页映射为准。更新先比较来源差异，再更新真源和桥接元数据。
