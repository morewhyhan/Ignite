# pstack 与 Ignite 文档体系结合审查

审查日期：2026-10-08。审查版本：`d62328a4154f547b73204caec26354a9cc7ef099`。

本报告是本机审查交付物，不是新的项目规则、任务状态或验收账本。源码和项目规则本轮未修改。没有运行模型实验、工程检查、可选脚本或外部自动化。

## 阅读覆盖

上游清单共164项：157份文本已分工全文阅读，7张图片已查看。文本包括131份Markdown、脚本与测试源码、配置、锁文件、许可证和日志模板。长输出被截断的段落另行补读，不以搜索命中代替全文阅读。

另读4份本项目适配文件及相关原生规范、规格、Plan、Design和资产测试。四端216份发现入口均加载检查，去除技能名称与目标路径差异后，正文为同一桥接模板。阅读范围逐文件登记于同目录的 `20261008-pstack-read-scope.json`。JSON来源哈希作为元数据核对，不属于本轮重新执行哈希验收。

完整阅读由主审和两个当前模型的审查助手分工完成。不是每份文件都由主审重复读一遍，也不是多模型效果比较。没有读取或启用参考资料中提到的外部账号和服务。

## 结论

完整搬入与技能发现入口已经落地，但具体工作产物和工具执行路径尚未全部接入 Ignite。不能将“有适配声明、链接可达”当作“每个流程已完整结合好”。

多数思考方法可以保留，包括追查原因、比较方案、少写代码、按真实行为取证和保持可恢复。需要补的主要是每个方法的产物去向与现有工具复用方式，不是再建一套工作台。

## 必须先处理的文档结合缺口

| 方法或流程 | 已读到的原始要求 | Ignite 已有位置 | 最小处理方式 |
| --- | --- | --- | --- |
| show-me-your-work、长期执行、hillclimb | 另建 decisions.tsv、decision.tsv 或 .audit 日志 | 当前 Plan 的整体判断、状态记录；长期架构取舍在 ADR | 保留决定、理由、证据的方法，写回原 Plan。实验原始数据可为本机附件，不成为第二状态真源 |
| multi-phase-plan、figure-it-out | 复制另一套计划格式、复选框、阶段清单，并使用上游 check-plan | docs/plans/_template.md 和结构化 tasks | 阶段和依赖进入已有 Plan；真正独立交付才分 Plan。不上游固定十路验证和每项性能检查 |
| orchestrate | preferences.md、units.tsv、ledger.tsv、gates.md、status.md 等完整协调库 | 原规则、Plan 协作字段、运行证据、ignite status 和 Release | 保留分工、交接和队列处理思想；原 orch CLI 标为未接入的可选工具，不默认 init |
| create/maintain-verification-skill、Benny feature-map | 另建维护中的功能地图，称其为验收真源 | Feature 的 REQ/AC、测试用例、Plan 层级和运行证据 | 控制技能只教怎样启动和操作应用；功能覆盖引用既有规格，不复制需求和通过状态 |
| automate-me、reflect、新技能生成 | 直接在 .cursor/skills 中写方法正文、修改描述 | 方法真源与各平台发现桥接 | 写到统一方法位置，再同步必要入口元数据。项目规则回原专业文档，不写成个人模式的第二套规则 |

## 具体证据与影响

### 1. 决定日志

`skills/show-me-your-work/SKILL.md:43,51` 明确使用 `log.sh` 创建 TSV；脚本 `scripts/log.sh` 实际会创建文件并追加内容。`docs/guide/07-overnight.md:63` 继续推荐该日志。`playbooks/hillclimb.md:12` 还使用另一套九字段格式。

Ignite 的 `docs/plans/README.md` 已要求重要结果、范围变化和原因留在原记录，`docs/designs/README.md` 将需长期解释的架构取舍交给 ADR。ADAPTER 只给了泛化优先级，没有直接说明本技能应怎样使用这些既有位置。

影响是重复维护决定和进度，且新会话可能不知道哪份记录为准。不是日志思想有问题，而是默认产物位置没有完成映射。

### 2. 计划格式与长期协调

`playbooks/multi-phase-plan.md:11` 起要求复制上游复选框模板；`scripts/check-plan.mjs` 固定检查英文标题、十条 live lane、perf 栏目及 `/loop 1h`。它不是 Ignite 的 Plan 校验器。

`playbooks/orchestrate.md:28` 起登记另一套规则和状态文件。`scripts/orch/store.ts:1576` 起的初始化会真实创建该库，`ledger record` 接受调用者提供的 verdict/evidence 文本，并不读取 Ignite 的真实运行清单。其 Graphite `gt` 依赖也未成为 Ignite 当前能力。

ADAPTER 的“不另造账本”可以禁止冲突，但需要在实际流程入口给出替代去向，否则 Agent 面对的是原步骤和总覆盖声明之间的跳转。

### 3. 验证地图与正式完成

`skills/create-verification-skill/SKILL.md:41` 称新地图是 maintained verification source。维护技能只允许修改自己的目录，这不足以同步原 Feature、AC、测试用例及 Plan。Benny 的地图也是独立示例，尚未填入 Ignite 的实际用户路径。

可复用的是启动、观察、操作、清理、稳定定位和副作用核对方法。截图、手动操作和自报 verified 都不能替代原生 AC 分层或真实运行证据。已有 Playwright 和原生检查入口应优先引用。

### 4. 新技能与模型配置

现有 216 个桥接正文一致，指向 canonical 方法和 ADAPTER。以后新建技能或调整 description 时，继承流程仍偏向 `.cursor/skills/` 单端写入，未明确统一真源和其他入口如何跟随更新。

`reflect/SKILL.md:61` 要求按 Routing 指定路径修改，却没有说明当该路径是发现桥接时，应先回到 canonical 正文，以及描述变更怎样同步入口。`correct/SKILL.md:35` 要求每次纠正都向 Agent 规则文件加表格，未明确已有专业条款的归属与合并；这可能让 AGENTS 重新堆积本应由标准和目录 README 维护的内容。

`architect/SKILL.md:88` 的方案 rationale 可保留为思考产物，但项目中的普通方案依据应归 Plan，确需长期解释的架构取舍才归 ADR，最终事实归 Design。不应为每个草图机械新增 ADR 或独立设计历史。

`.ai/pstack/config.json` 当前记录 `inherit-current-host`、空 roles 与自动化关闭。除 ADAPTER 指向它外，继承技能仍教读取 Cursor 的全局模型规则，未给出这个 JSON 的角色字段格式与统一读取步骤。默认继承当前模型有明确规则依据，但不能把该文件说成已经接好的角色调度器或自动生效的设置引擎。

## 可选工具的接入缺口

### 5. 可执行路径

`multi-phase-plan.md:13` 的 `node pstack/...`，以及该文件、`autopilot-full.md`、`autopilot-stack.md` 中的 `git show origin/main:pstack/...` 都保留上游路径。实际方法位置是 `.ai/pstack/`，本地文件可读也不说明远端存在该路径。

这些是行内命令，不是 Markdown 链接。原资产链接检查不能证明命令可用。应在项目执行入口明确当前路径及版本来源，原命令只保留为来源示例。

### 6. PR watcher 的状态含义

`watch-pr/cli.ts`、`policy.ts` 的 status-only 路径可能输出红色状态后仍返回退出码 0。它的 READY 是该工具自己的 GitHub 检查与评论判定，不读取 REQ/AC、Plan 或 Release，也不能独立证明可以合并。

应把它作为观察 GitHub 状态和唤醒工作的工具。正式完成仍使用 Ignite 的原生证据；不得由 watcher 的退出码、patch-id 或审查文字替代 Plan/Release 判定。

### 7. 运行环境和清理

`scripts/bootstrap.ts:35` 起会自动执行 Bun 安装，再重启命令，因此首次运行辅助命令可能产生安装副作用。`worktree-audit.sh` 会 fetch，按空格取路径，还使用 macOS/BSD 的 stat/date 方式。这些不能直接承诺适配默认 WSL/Linux 或带空格路径。

`worktree-cleanup.md` 把未跟踪文件视作可丢弃 scratch，这个推断不成立。Codex 受管 worktree 应优先采用能保存快照的原生归档方式；普通目录也必须确认实际工作内容和归属。

脚本目前未启用，以上是采用前的缺口，不是已发生的损坏。无需为了完成方法迁移立即安装 Bun 或全面重写所有可选工具。

### 8. Benny 复制和宿主流程

Benny 的原安装步骤仍复制整个包到 `.cursor/automations/benny/`。现在加入的相对 ADAPTER 链接按原位置成立，但照搬到新位置后会解析到 `.cursor/ADAPTER.md`，当前该文件不存在。复制模板到 `.cursor/benny/` 也有同类链接问题。

原文说三个 Benny SKILL 不作为 slash skills，而当前四端均有发现桥接。应明确“可选设置入口可发现”和“已配置自动化直接读取运行方法”两种情况。

设置流程还限定 Cursor 的 `/automate` 编辑器交接，尚没有 Codex 对应接法。示例触发数据使用 `message_ts`，运行技能读取顶层消息时回退到 `trigger.ts`；接入时须统一这个事件契约，否则按示例输入可能无法取得父线程。

Benny 尚未启用，没有连接 Slack、tracker 或实际控制适配器。以上问题不阻止普通技能被阅读，但说明它不是当前已经可运行的自动化。

## 已经明确适配，不重复当成新问题的内容

- 原规则优先，Feature → Plan → Contract/Test → Implementation → Verify → Design 保留。
- 默认继承当前模型，固定 Grok/Opus 名称不自动生效。
- 不因方法文字扩大外部动作授权，不自动发消息、推送、合并或部署。
- 简单任务不强制调查、模型实验或多 Agent。
- 只读取授权范围内的会话，不能按上游示例遍历无关私人历史。
- 真实行为取证、最小改动、方案比较、根因分析、可恢复交接等思考方法基本兼容。

## 本次审查和此前检查的区别

原 AC-PSTACK-001/002 资产检查针对完整性与入口，不能证明全部宿主运行正常。AC-PSTACK-003 的现有测试只检查每份 Markdown 能解析到 ADAPTER，没有断言本报告列出的具体产物和工具映射。

本报告对应 REQ-PSTACK-003 / AC-PSTACK-003 的内容审查缺口。它不是新的通过清单，不改变当前 Plan 的 draft 状态，不声称 Plan integration 或 Release 已通过。

## 建议实施顺序

先补项目实际入口中的产物映射，优先处理决定日志、Plan/协调库、验收地图和新技能维护。再明确可选工具的用途、当前路径、环境和状态含义。Benny 保留为未启用资源，真正要启用时再配置外部服务与事件合同。

保留原方法及来源，但不能只依赖每份文件的一句“先读适配说明”。在涉及写文件、判定完成或调用脚本的入口，应能直接找到本项目对应动作。
