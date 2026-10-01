# 规格驱动开发工作流

本文档把 Ignite 的需求规格、Plan/Go、测试先行和 E2E 闭环转化为可执行流程。工具可以替换，闭环不能省略。`pnpm ignite` 是状态、检查和证据的统一入口。

## 0. 任务单位和状态机

一个 Plan 必须对应一个可独立验收、集成和回滚的交付结果。实现、测试修复、格式修复和设计回写是这个 Plan 的子任务；没有事实变化的状态同步不能单独开 Plan。

新 Plan 在顶部使用 `ignite-plan` JSON 元数据，状态只能按下面的有限集合使用：

```text
draft → ready → active → verifying → done
                    ├→ blocked → active
                    ├→ cancelled
                    └→ superseded
```

历史 `verification_contract: 1` Plan 按原必需证据执行。新 `verification_contract: 2` Plan 的 `required_evidence` 只包含本切片的 `check-integration`，`done` 必须绑定当前输入、测试层级、红灯证据与真实集成 commit。Release 独立要求最终组合的 `check-release`，不会塞回单个 Plan。`blocked` 必须说明缺什么、责任方、恢复动作；`legacy_unverified` 只用于历史 Plan，不代表完成。

当前发布范围只在 `docs/plans/releases/*.json` 维护。Release 文件不保存状态；`pnpm ignite status --write` 从 Plan 与证据实时推导 `docs/others/ignite-status.md`，不要手改派生表。

## 1. 先确定输入

AI 开始实现前必须读取：

1. 对应的 `docs/features/` 需求规格；
2. `AGENTS.md` 和受影响的 `docs/standards/`；
3. 当前 `docs/designs/` 与实际源码、Schema、测试；
4. 本轮唯一的 `docs/plans/` 文件。

先查看 `pnpm ignite status` 的精简摘要；只有需要脚本化解析完整机器字段时才添加 `--json`，找到覆盖本轮目标的未完成 Plan 并接续；本轮实现、修复和验证不另建计划。新的独立交付结果才新建 Plan，已交付结果的后续改动使用新的存量改动 Plan，保留原交付记录。涉及用户行为、API、Schema、依赖、架构、测试或执行规则时，必须由一个 Plan 覆盖；改动文件的数量不是是否新建 Plan 的依据。

免业务 Plan 的范围仅限检查器认定的安全说明和展示资产：根 `README.md`、`docs/README.md`、`docs/others/README.md` 和 `docs/assets/`。这些修改仍需文档、格式和差异检查。源码格式修复、Feature、Design、Standards 和 AI 执行规则的改动继续归入对应 Plan，不能因“只是改几个字”跳过契约和验收。

新模块或存量修改可分别用 `pnpm create:module <plural-kebab-name>`、`pnpm create:change <kebab-name>` 建立 draft；脚手架先检查 Git 工作区，发现已有改动就拒绝写入，`--dry-run` 可只读预览。草稿不替用户决定需求，也不把占位断言当验收。先补齐目标、REQ/AC、影响范围、数据边界与授权，再转 `ready`。未来 draft 不阻塞当前任务；它自己转 `ready` 时必须补齐实施输入。

已有任务的日常入口只需记住：

```text
pnpm ignite next --plan <IGT-ID>                       # 读取目标、当前任务、缺口与建议动作
pnpm ignite task set-status <IGT-ID> <task-id> doing   # 开始一项任务；完成后改为 done
pnpm ignite check --plan <IGT-ID> --level auto         # 在可验证的改动完成后检查
pnpm ignite release status                              # 查看最终发布验收是否仍缺
```

`next` 提供接续信息，不替代读取原始目标和实现工作。新 Plan 补齐输入后依次转为 `ready`、`active`；上述命令用于执行中的任务。检查仍在运行时，用 `pnpm ignite run status <run-id>` 接续已有运行。任务状态命令会生成正文进度，不另写一份勾选表。

`next` 和 `release status` 默认给精简接续摘要；需要完整 Plan/Release 元数据时加 `--verbose`。`next_action.files` 指向需处理的相关文件；若 `command` 为空，按 `reason` 继续实现或修正规格与范围，不要绕过校验。

`next` 的精简摘要还保留本 Plan 的全部 goals、constraints、non_goals 与 tasks。active Plan 有未完成任务时先提示接续进行中任务，没有进行中任务时列出全部待办，由执行者结合 Plan 的推进依据选择；不以列表第一项或缺少运行证据自动判定主要问题。命令为空也可能表示继续实现任务；快速反馈仍按需运行，状态建议不替代语义判断。

## 2. 关闭 Plan 中的开放问题

Plan 进入实现前必须写清：

- 只选择一种变更类型；
- 目标、非目标和影响路径；
- 兼容性、数据迁移与回滚要求；
- 若涉及 Prisma、认证或业务 API，填写 `data_contract`：资源归属、访问依据、迁移影响与恢复方式；只有破坏性修改需要具体用户授权；
- 每条验收标准对应的测试层级和命令；
- 需要更新的设计规格；
- 所有开放问题均已关闭，或记录用户明确接受的假设。

脚手架只建立草稿骨架，必须把占位需求和失败测试替换为真实行为断言。新 Plan 进入 `ready` 前，相关 Feature 不能含占位符。每条 AC 的 `required_layers`、`checks` 与 Plan 的 `verification_requirements` 应覆盖实际改动：页面交互需要 `browser`，持久化需要 `database`，真实外部服务需要 `external`。同时补齐测试文件、页面入口和执行条件；一个 mock API 测试不能证明这些层级已经验收。结构校验通过只代表关联和字段完整。

在 Plan 正文保留“原始目标或约束 → 本轮目标 → REQ → AC”的核对表。进入 `ready` 前由 AI 回看用户原话，逐项说明保留、排除或待确认的理由；不能只从自己改写后的 goals 反推原始请求。验收测试证明已列出的目标，不自动证明遗漏的目标不存在。新会话先读此表和结构化元数据，再接续实现。

若执行中发现检查通过但用户目标仍有未验证的场景，把它记录在 Plan 顶部 `remaining_work`；`ignite next` 会优先提示继续做，`done` 会拒绝非空清单。新执行契约把这份清单视为进度，不因状态回填重跑；补充目标、AC、测试或实现后仍须重验。旧契约保持原有指纹语义。不能只清空清单就宣布完成。

用户在同一请求中明确要求“直接实现”即视为已授权执行；否则涉及产品取舍、破坏性操作或基础设施替换时应等待确认。

### 需求写到能判断行为

Feature 描述谁在什么条件下操作、输入如何处理、可观察结果及影响结果的边界。需求充分的标准是：不同实现者能据此判断同一产品行为正确还是错误。需求不替实现指定每个函数或每次工具调用。

从原始结果倒推必要条件，沿本轮相关的输入、处理、保存、读取和呈现核对权限、依赖和失败状态。只保留适用环节；简单文案修改可引用既有行为，不重新设计整个系统。已读规格、Design、代码和运行结果是事实依据；未确认原因保留为推测，只调查会改变行动、范围或验收的未知。证据表明影响扩散时再扩大阅读。

例如“支持保存”不能区分临时显示和持久化；若用户已经确定“当前用户保存后刷新仍能看到自己的内容，失败保留输入并显示错误”，这才足以制定行为验收。示例里的边界不能自动成为所有项目的默认承诺。产品结果、权限或失败行为有实质分歧时，先查既有决定；仍未确定的交由人选择，继续不依赖它的工作。普通可回退的实现选择由执行者处理。

### Plan 写到能选择下一步

Plan 的“整体判断与推进顺序”连接原始目标、必要条件、实际缺口和行动。先沿相关链路检查是否漏掉影响结果的条件，再判断当前最阻碍承诺成立的缺口；它可能是原因未明、依赖缺失或几个共同条件，不强求唯一根因。

有真实竞争方向时，按同一目标比较：各自阻碍什么结果、依据是什么、先处理能解除什么依赖、代价和授权边界是否合适。不凑候选数量或编造评分。必需权限、数据、安全与兼容性边界失效要处理，不能被当作次要问题；局部优化须说明它服务哪个目标。其余发现说明纳入、延期或不属于本轮的理由。

例如目标是可靠保存，同时发现刷新后数据消失和按钮间距不齐，先沿保存链路取证。POST 成功不能证明存储或刷新呈现；若真实写入与读取正确，再定位界面如何使用读取结果；若未写入，再定位写入路径。没有证据时不先认定数据库出错，也不据此更换数据库。

一个 Plan 对应独立交付结果，tasks 按可判断的产出拆分。不同依赖、责任、风险或验收需要分开时再细分；不把所有工作塞进“优化系统”，也不把读文件和每条命令拆成任务。小修改几句话即可，跨环节问题才展开。检查如何选、断言细到哪里见 [测试标准](./testing.md#检查选择与断言尺度)。

## 3. API 与业务逻辑 Core Loop

1. 根据需求和 Plan 编写或更新真实行为测试，确认 AC 的具体测试映射与行为层。
2. 提交稳定 Plan/Feature/测试基线后，对每条 AC 运行 `pnpm ignite tdd red --plan <IGT-ID> --ac <AC-ID>`；runner 只接受行为断言失败，不接受环境错误和 scaffold 占位失败。本次运行只判定目标 AC，不把测试筛选导致的其他 AC 跳过误报为失败。提交 runner 生成的红灯记录。
3. 保持该 AC 对应的活动测试用例不变，编写满足测试的最小实现；同一测试文件内其他用例的增改不影响这条红灯证据。
4. 用最小目标测试确认行为，再完成必要的重构；没有新变化或失败不重复执行。
5. 运行 `pnpm ignite check --plan <IGT-ID> --level auto`，完成 Plan integration，确保原红灯测试变绿并覆盖所有映射层级；CLI 根据真实改动选择不可降级的最低检查层级。

如果修复会扩大范围、需要新权限、会破坏数据或与规格冲突，应停止循环并报告，而不是静默绕过。

### 执行中按结果纠偏

接续时回看原始目标映射、整体判断和用户最新要求；进行中的任务不自动证明重点仍正确。取得阶段结果、出现重要新证据、准备扩大范围或重复失败时，比较承诺、已证明结果和剩余差距，判断当前工作是否仍解除主要阻碍。没有这些触发时，不反复生成全套分析。

会阻止交付或破坏必需边界的新发现，在原 Plan 补任务、规格和验收并说明重点变化；无关优化说明去向后继续原目标。保存修复中若证实跨用户读取私有数据，权限已成为必需缺口，应更新重点；“只抓主问题”不能成为忽略它的理由。

检查没有新信息时按第 7 节停止无效路径，改变假设或取证方式。一次探索停止不等于整个 Plan 阻塞：能独立推进的相关任务继续；缺少外部条件时说明缺什么、责任方和恢复动作。只把改变判断的证据与原因写回原有记录，不增加逐工具日志或第二份进度。

## 4. UI 与 E2E Loop

涉及页面或交互时，在 Core Loop 之外增加：

1. 在需求中提供原型链接、仓库内原型，或明确写“无外部原型，以当前设计系统为准”。
2. 在 `docs/others/test-cases/` 写出关键用户路径、断言和失败状态。
3. 实现并通过 API/组件层验证。
4. 使用真实浏览器检查布局、交互、loading、error、empty 和成功状态。
5. 将稳定路径固化为 Playwright 测试。
6. Plan integration 会运行其映射的真实浏览器路径。所有 Release Plan 都完成后，使用 `pnpm ignite release verify <release-id> --plan <done-plan-id>` 在同一最终快照运行生产构建和全量生产态 E2E。视觉无法由 DOM 断言覆盖时保留截图或人工验证记录。

浏览器探索只用于发现行为，Playwright 脚本才是可重复执行的回归资产。

## 5. 结果回写

完成回写从原始承诺核对，不能只从实现或测试反推：每个纳入目标现在能得到什么结果，哪条 AC 和证据证明它，在哪个版本与条件下执行，还缺什么。缺账号、外部条件或未实现保持未完成；延期不自动变为排除。修改长期规则按 [AI 工作台维护规则](./ai-agents.md#维护规则) 更新原真源。

- Plan 是过程方案：追加状态记录，不把失败尝试改写成从未发生。
- `docs/designs/` 是当前设计契约：完成后更新最终状态。
- 源码、Schema、Migration 和测试是可执行实现：发现与设计不一致时，本轮必须修正或明确记录未解决差异。
- 影响长期规则时更新 `docs/standards/`；只有形成需长期解释的架构取舍时追加 ADR，不为常规 CRUD 机械建 ADR。

### 沟通和交付报告

每次回应先简短复述用户本次意图和重要边界；接续沿用已有决定，不重问已授权事项。进展先说发现和影响，再解释下一步为何有用；最终报告自包含，说明实际结果、对应证据与未完成部分。需要人决定时给出具体选项、影响和推荐依据。

使用具体行为解释问题，先给共同结论，再按不同结果分类，去掉重复。已确认事实、待验证推断和建议应能区分；不以术语、命令或日志堆积代替解释。例如“刷新后仍看不到内容；读取结果已确认正确，下一步检查界面怎样使用它”比“完善跨层闭环”明确，但前提是这些事实已经确认。

发送前检查读者能否仅凭报告复述结果、优先原因、未完成部分和待定事项；实际理解由读者反馈或复述验证，作者自查不能冒充读者已理解。工程、Plan、Release 分别报告，只列实际通过的检查；工具与文档交付不能声称模型行为已经改善。

## 6. 准出条件

任务只有同时满足以下条件才算完成：

- 需求验收标准均有证据；
- 新 Plan 的每条 AC 都有 CLI 生成的目标行为红灯记录，且同一测试在 Plan 验收中通过；环境错误和占位失败不算；
- `pnpm ignite check --plan <IGT-ID> --level integration` 通过；
- Schema/Migration 变化通过 `pnpm test:migrations`；
- 只有声明整个 Release 完成时，才要求 `pnpm ignite release verify <release-id> --plan <done-plan-id>` 的同 commit 生产构建与生产态 E2E；
- 相关设计文档和 Plan 状态已更新；
- 最终报告列出实际执行的验证，不声称未执行项通过。

以上是验收结果要求，不是额外运行一遍命令的清单。统一检查已覆盖的迁移、构建或用户路径，使用其匹配当前输入的证据；有真实行为缺口时再补充验证。Plan 内出现失败时修复原任务并重验，完成前更新 `remaining_work` 和最终 Design。

## 7. 运行恢复与阻塞

长命令由 `pnpm ignite check` 记录 `run_id`、Plan、命令、仓库输入指纹、commit、环境指纹、runner 身份、心跳和退出码。运行中状态与完整日志只保存在被忽略的 `.ignite/`；成功后才把脱敏、无绝对路径的摘要写入 `docs/others/evidence/runs/`。`pnpm ignite run status` 会只读地区分运行中、已通过、失败和 `orphaned`。观察超时、暂时无输出或一次轮询失败都不能直接重跑；先读取原 run。

同一 Plan、同一命令和同一输入指纹已有活动 run 时复用它；已有通过记录时默认复用，只有输入改变或明确 `--force` 才重新执行。相同失败连续两次且没有新证据时停止机械重试，记录失败原因及恢复条件；确认剩余工作依赖未满足条件时才将 Plan 标为 blocked，不能修改目标宣布完成。

Plan integration 后先提交其证据绑定，再把 Plan 标为 verifying/done。新 Release 必须等待所有纳入 Plan 完成，再运行 `release verify`；该 run 只写入 Release，不混成单个 Plan 的必需证据。Release 证据同时记录被测 commit、package version 和指向该 commit 的 Git tag 名称；包版本、tag 名称集合、源码、规则或 Release scope 变化会要求重验。旧 `verification_contract: 1` 继续按原 release check 流程处理。

每个子命令有总时限；本地运行表同时记录当前命令与最后输出时间。安静不等于挂起，先检查 `pnpm ignite run status <run-id> --verbose`；确需停止本机当前运行时调用 `pnpm ignite run cancel <run-id>`，由其拥有者清理自己创建的进程组，不直接按外部 PID 杀进程。超时、失败和孤儿运行应根据错误类型定位原因，不能简单继续 `--force`。损坏的单条本地记录会以 `corrupt` 显示，不会隐藏其他运行。

旧证据按运行 commit 保留为历史记录，允许继续修改代码和重新检查；进入 `done` 的瞬间，所有必需证据必须匹配当前输入。过期证据不能完成 Plan，也不应阻止 Plan 回到 `active`、记录阻塞或启动重测。后续增量不会重跑旧 Plan，但 CI 会要求本次 diff 由本次完成 Plan 的 `write_scope` 覆盖。

并行任务优先在不同工作区修改；每个实现提交带 `Ignite-Plan: IGT-<ID>` trailer，以便检查器区分任务归属。集成后针对整体快照重验；共享 Schema、API 注册和导航先声明 `shared_files` 的统一负责人，其他 Agent 只交接，集成人接管 Plan owner 后修改和检查。`handoff` 必须包含接口、迁移、测试与剩余项。

开发依赖与最终验收分开：上游未 done 时，下游可用 `dependency_contracts` 锁定上游已提交的文件快照进入 active；文件变化必须重新对齐。下游进入 verifying/done 时仍要求上游 done。

`tasks` 是唯一任务进度；用 `pnpm ignite task set-status <ID> <task-id> <todo|doing|done>` 更新，并用 `pnpm ignite plan refresh <ID>` 生成正文进度。正文不再手写另一份状态或任务勾选表。`pnpm ignite next --plan <ID>` 返回任务、真实证据缺口与交接信息。

Release scope 必须逐项追溯原始目标。缺凭据、未实现、等外部条件属于 deferred，仍阻止整个目标完成；只有用户明确授权的舍弃才属于 excluded。范围完整性须回看原始请求，不能只看 AI 自己拆出的 Plan。

普通保留历史的 merge 可以沿用已有提交证据；squash 或 rebase 改写了提交身份后，在合并提交上执行 `pnpm ignite plan reintegrate <ID>`，再重新运行集成、发布检查和完成状态。旧运行清单留作历史，不能只改 `integrated_commit` 的字符串来宣称新提交已测。

CI 的合并门禁只要求本次变更涉及的独立 Plan 已完成并覆盖本次差异；同一 Release 内未交付的未来任务不阻挡这次合并。宣布整个 Release 已完成仍需范围内全部有效 Plan 与证据齐备。`done` 表示本地受测提交完成，不自动表示已经推送、部署或用户可访问；这些交付结果需另核对并如实报告。

交付时可执行 `pnpm ignite next --plan <IGT-ID> --verify-remote`，只读比较本地 HEAD 与 `origin` 同名分支的远端提交。`verified` 才表示这一个 Git 提交已在远端；`pending_first_push`、`pending_push`、`behind_remote`、`diverged_or_unknown` 和 `unreachable` 均不能宣称已同步。默认 `next` 不访问网络，远端状态保持 `not_verified`；仓库同步不等于应用已部署或页面可访问。

## 8. 模板维护记录与发布快照

维护 Ignite 时仍按上述闭环保存 Plan 和证据。交付后可把建设期记录从模板工作目录清理，先前 Git 提交保留原件；发布快照只分发可复用资产。此规则只用于 `template-baseline`，已采用项目保留自己的过程历史。

CI 检查跨越清理的提交区间时，从最近删除前的 Git 快照读取完成 Plan 和原运行清单，沿用完整证据校验，再逐个比较当前源码与被测提交。缺失、无效或不能覆盖当前改动的记录不提供放行依据；不得用清理隐藏尚未验收的实现。新 Git 历史的零记录副本从自己的初始提交起步。

## 9. 运行时边界

`.node-version`、`packageManager` 与 `.ai/runtime.json` 共同定义可复现运行时。默认在 WSL/Linux 执行；若改用 Windows，必须单独安装该平台的 `node_modules`。两个系统不得共享同一依赖目录，`pnpm runtime:check` 会在执行前拒绝跨平台复用。

## 方法依据与边界

需求尺度参考 [NASA 需求编写指南](https://www.nasa.gov/reference/appendix-c-how-to-write-a-good-requirement/)；必要条件、竞争方向和相称的分析成本参考 [NASA 决策分析](https://www.nasa.gov/reference/6-8-decision-analysis/)。执行反馈借鉴 [目标进度监测研究](https://pubmed.ncbi.nlm.nih.gov/26479070/)，研究对象是人，对 AI 的适用性仍须验证。沟通用 [复述检验](https://digital.gov/guides/plain-language/test/paraphrase-testing) 检查理解。上述具体流程是本项目的工程设计，不能据此保证所有模型有效；实际行为按 [评估案例](../others/test-cases/execution-focus.md) 检验。
