# Plan 编写与维护

本页负责一轮工作怎样立项、选择行动、接续、纠偏和判断完成。每份具体 Plan 组织本轮目标与各专业产出；模板仅提供填写位置。

任务状态、执行笔记和审查记录直接更新对应 Plan，不在每次轻量回写时重新扫描所有历史。`docs/others/ignite-status.md` 是派生视图；需要刷新时运行 `pnpm ignite status --write`。完整治理和正式验收仍检查全局记录，不能用局部回写成功宣称整体有效。

## 固定维护方法

先读本节适用条款，正文读取与复用按 [共同规则](../standards/ai-agents.md#固定维护方法)。以下方法按本页步骤使用，不预读尚未触发的后续阶段。

准备时先把用户已确定的目标、字段、权限和验收写入 Feature/Plan；安装依赖的会话等待期间继续这些不依赖运行环境的工作。仅依赖缺失工具的脚手架、测试与检查等待环境。已给定事实不留作待确认，准备只写规格、计划与测试，不提前改实现。

新 Plan 声明 `task_contract: 2`。tasks 的 `phase` 只能为 prepare、red、implement、verify；red 与 implement 列出负责的 `acceptance` AC。每个实施任务前先列覆盖同一 AC 的 red 任务，原生校验会拒绝逆序或缺失阶段。开始或完成 implement、完成 red 时，原生任务命令核对有效红灯记录；只有任务标题写了“先测试”不算满足条件。历史 `task_contract: 1` 和未声明此契约的 Plan 保留兼容，不能据此推断它已遵守新约束。

准备阶段写规格、计划和真实测试，并将 Feature、Plan 与测试提交为基线。品牌代码、产品配置、package 元数据和业务代码都属于实现，不能在准备阶段顺手修改。新契约的准备检查和首个红灯入口会检查基线以来的代码变化，包括暂存区；发现提前实现时先还原这些改动，不能伪造红灯或修改基线绕过。

准备检查 `ready=true` 后，把 prepare 任务设为 done，并将 Plan 转为 ready、active。prepare 任务负责编写真实测试并声明测试路径；red 任务只运行原生 red 并记录证据。用 `pnpm ignite task set-status <ID> <red-task> doing` 启动对应红灯任务，再运行原生 red。记录有效红灯后，将对应 red 任务设为 done，启动其实施任务。ready 不要求已有红灯证据。按可验收单元循环，不要求所有 AC 一次性先做完红灯。

已记录红灯的用例需要正确修正时，继续原 Plan，按 [测试修正恢复步骤](../standards/testing.md#测试修正后重新取得证据) 使用原生 `tdd restart` 重开对应 AC。工具先核对已绑定证明；绑定仍有效时保留任务和证据并返回 `restarted=false`，不为不相关测试的改动重做红灯。绑定失效时撤销相关完成状态及旧验收绑定并保存原因，保留旧记录；仍需在真实未实现版本取得新红灯，不能补写或伪造旧证明。无需为同一交付另建“收口” Plan。

委派前运行 `pnpm ignite next --plan <ID> --task <task-id> --handoff`，将当前任务生成的工作目录、运行时、范围、接口、方法入口和阻碍交给实际执行者。有两个以上接口确定、写入独立且前置满足的切片时，AI 主动按已有授权并行派发；依赖共同规格不等于前端必须等后端实现完。共享文件继续只有一个集成者。任务包不启动 Agent、不保证宿主发现技能，也不许可越过阻碍。

执行经过使用 `pnpm ignite plan note <ID> --text "实际结果与剩余缺口"` 写入原 Plan 状态记录；该入口不改 tasks、不创建凭证。需要改变目标、接口或验收时仍改对应语义真源并重新审查，不用状态记录隐藏需求变更。

写计划时先安排规格与真实断言、提交准备基线、记录红灯、实现、验证和 Design 回写，再对照正文与 tasks 检查顺序一致。prepare 任务的 scope 包含真实测试路径。red 任务只负责运行并记录；测试路径可保留在 red scope，供 `tdd restart` 修复断言时沿用同一任务。用户暂不运行测试时保留待办，不把未来红灯挪到实现之后。开始实现前使用 `pnpm ignite task set-status <ID> <task> doing` 检查前置条件；直接编辑文件仍须遵守同一规则，CLI 无法拦截宿主任意写入。

草稿回查时，每条 `required_layers` 都须在该 AC 的 `checks` 中有对应层级；真实数据库和浏览器检查分开映射。尚未编写的测试路径是后续设计，不是已通过证据。缺少对应检查时保留缺口，不能因为任务顺序正确就进入 ready。

涉及本类文档时，先读取以下必需方法：[figure-it-out](../../.ai/pstack/skills/figure-it-out/SKILL.md)、[show-me-your-work](../../.ai/pstack/skills/show-me-your-work/SKILL.md)、[principle-sequence-verifiable-units](../../.ai/pstack/skills/principle-sequence-verifiable-units/SKILL.md)、[review-plan](../../.ai/skills/review-plan/SKILL.md)、[review-delivery](../../.ai/skills/review-delivery/SKILL.md)。这些是 Plan 生命周期的必需方法：准备阶段读取并应用 review-plan，交付阶段再读取并应用 review-delivery；其它方法用于本轮规划和记录。必须按下面的顺序处理，不能省略对应阶段职责。

1. 接续覆盖本轮结果的未完成 Plan。需要新交付时，新增模块用 `pnpm create:module <name>`，存量改动用 `pnpm create:change <name>`。仅准备文档的新模块使用 `pnpm create:module <name> --docs-only`，只生成 Feature、Plan 和 Release。无法运行脚手架时复制原模板并保留全部栏目，Plan ID 只使用 `IGT-数字`，不要凭印象另写格式。
2. 确定原始目标、基线、写入范围、验收和回退，逐项映射 Feature REQ/AC。Plan 必须同时有其 release 引用的 Release 草稿，scope 写清原始目标、REQ/AC、负责 Plan 和处理方式，未运行的证据留空。本轮暂不实现写入执行约束，后续仍要交付的功能不能同时被写成永久 non_goals。明确任务不重复塞入 remaining_work。
3. 准备结束前，按下文的独立审查约定完成 draft 审查，再运行 `node scripts/ignite.mjs plan validate <ID> --prepare`。按 failures 修正原文件，再运行同一检查，不能以 JSON 可解析、空白检查或自评代替。prepared 只表示文档准备结构有效；pending_tests 表示尚未写完的真实断言。用户仅让准备或暂不测试时保留 draft 和待办，不能把准备结果当作 ready、功能通过或完成。报告开工条件以 ready 字段为准，ready=false 时明确写“尚不具备正式开工条件”。已经完成的 prepare 任务用 `pnpm ignite task set-status <ID> <task> done` 回写，不把对应未来任务再抄进 remaining_work。另逐条回查用户原始要求，机器结构检查不能证明语义无遗漏。
4. 开工后按原生契约记录真实红灯、实现与验收，依据实际证据更新任务、状态与 Design；交付前按 review-delivery 独立审查实际产物和证据。检查失败、审查发现和完善仍留在同一 Plan。

### 条件方法

可独立产出的任务且宿主支持委派时，才按 [swarm](../../.ai/pstack/skills/swarm/SKILL.md) 拆分，并读取 [principle-separate-before-serializing-shared-state](../../.ai/pstack/skills/principle-separate-before-serializing-shared-state/SKILL.md)，明确写入范围、依赖与交接；共享文件先分工，再集成。存在真实竞争方案或高风险分歧时才采用 [arena](../../.ai/pstack/skills/arena/SKILL.md)、[interrogate](../../.ai/pstack/skills/interrogate/SKILL.md)。明确的小改动可以压缩分析，但不能省略必要记录与完成证据。

## 交付单位与状态

先接续覆盖当前目标的未完成 Plan。新的独立交付结果才创建 Plan；已交付后的新改动建立存量 Plan 并保留原记录。API、页面、测试、失败修复、格式和设计回写是同一交付的子任务，不另建“收口”计划。

一个 Plan 对应可独立验收、集成和回滚的结果。新 Plan 使用顶部 `ignite-plan` 元数据，`execution_contract: 1`、`verification_contract: 2`；合法状态为：

```text
draft → ready → active → verifying → done
                    ├→ blocked → active
                    ├→ cancelled
                    └→ superseded
```

`legacy_unverified` 仅表示未迁移历史，不代表完成。`tasks` 是唯一任务进度，使用 todo/doing/done；正文进度由工具生成，不手写第二份复选框。`remaining_work` 只放尚不能转成明确任务的真实验收缺口，非空时不能 done。

## 输入与原始目标核对

先读当前用户要求、相关 Feature、当前 Design、实现和测试，再接续本轮 Plan；专业规则在所属入口查阅，不必先通读跨任务工作流。

将“用户原话或可追溯来源 → 本轮目标 → REQ → AC”记录在原始目标核对表，确认约束和必须保留能力都已列入；不能从自己改写的 goals 反推原请求，也不能用 `open_questions=[]` 或结构检查宣称语义完整。新会话先回看此表。

进入 ready 前写清变更类型、目标与非目标、基线 commit、写入范围、兼容与回滚、实际验收和 Design 回写位置；相关 Feature、AC、测试与 Release scope 不得有占位符，关键问题关闭或记录用户接受的假设。脚手架只是 draft，失败占位和页面外壳不能视为功能完成。

结构化 Plan 的 `change_type` 只在元数据记录，正文解释影响和回退，不再复制类型字段。文档检查器读取同一元数据并拒绝非法类型；只有旧非结构化 Plan 继续在正文选择类型。

涉及 Prisma、认证或业务 API，填 `data_contract` 的资源归属、访问依据、迁移影响和恢复方式；破坏性变化引用人的授权。已有决定和实施授权继续有效，普通实现选择无需反复请示。

## 整体判断与推进顺序

先沿本轮相关链路核对结果成立的必要条件，再与实际事实比较缺口，选择当前最阻碍承诺的条件。可能是原因未明、依赖缺失或几个共同条件，不强求唯一根因。既有检查建议与进行中任务不能自动证明重点正确。

有真实竞争方向时用同一目标比较：各自阻碍什么结果、证据是什么、哪些是推测、先处理能解除什么依赖、代价与授权边界是否合适。不凑候选数量或编造评分。权限、数据、安全与兼容性等必需边界失效须处理；容易观察或容易修的局部问题不能因此优先。

在整体判断中记录相关完整链路、当前重点及依据、下一步应取得的结果和会推翻它的证据；其余发现说明纳入、延期或不属于本轮的理由，不另写一份任务状态。原因未明时怎样选择检查见 [测试标准](../standards/testing.md#检查选择与断言尺度)。

例如可靠保存与按钮间距同时有问题，先沿写入、读取、刷新呈现取证。POST 成功不能证明存储；若真实存储和读取正确，再定位界面如何使用结果，未写入则定位写入路径。没有证据时不先认定数据库出错，也不据此更换数据库。

tasks 按可判断产出拆分，不同责任、依赖、风险或验收需要分开时再细分。不把所有工作塞进“优化系统”，也不按读文件或每次命令拆任务。简单修改几句话即可，跨环节问题才展开；各专业的实现、测试和完成标准仍由原规则负责。

### 精细任务契约

新脚手架显式使用 `planning_contract: 1`。每项任务填写以下字段，状态仍只在 `tasks` 中维护：

| 字段                  | 要回答的问题                                                            |
| --------------------- | ----------------------------------------------------------------------- |
| `result`              | 做完后能观察什么结果，怎样判定失败？                                    |
| `scope`               | 此任务实际允许写哪些仓库相对路径？必须包含在 Plan 的 `write_scope` 内。 |
| `depends_on`          | 哪些任务完成后才允许启动？没有前置时填空数组。                          |
| `owner`               | 谁实际负责？角色需求不是已经派发的身份。                                |
| `phase`、`acceptance` | 属于准备、红灯、实现还是验证？red/implement 对应哪些 AC？               |

例如“完善学生管理”无法验收；“当前用户新增学生后刷新仍能读取，未登录写入被拒绝”给出了结果，API、页面和持久化测试可在同一交付内按依赖分工。只有标题写得长、字段非空或任务数多，仍不能证明颗粒度合适。

官方入口拒绝缺字段、范围越界、未知或循环依赖；依赖任务未完成不能启动下游。接续先看允许启动的任务，再依据本轮重点选择。实际委派后回写真实负责人，共享文件明确单一写入者，未派发不能声称已并行。准备审查、交付审查和 Design 回写也要有具体任务产出。

### 独立审查约定

新脚手架显式使用 `review_contract: 1`。AI 负责发起两次审查，用户无需额外提醒或手动调用技能。准备审查核对原始目标和执行合同；交付审查读取实际改动、运行证据及当前事实，不能只看实施者摘要。审查方法正文分别在 review-plan、review-delivery，触发及准入规则只在本页维护。

1. 使用 `pnpm ignite review context <ID> draft` 或 `delivery` 取得当前对象和范围。没有批准记录时 context 仍可读取，避免审查自身无法启动。
2. 用当前宿主的实际委派能力安排未参与实施的独立角色，给它原请求、完整对象、相关规格/事实与证据。没有独立角色时保留缺口，不把作者重读、角色文件或虚构名字当成派发。
3. 审查者给出具体发现与结论，协调者以 `pnpm ignite review record <ID> <draft|delivery> --file <review.json>` 写入原 Plan 的 `reviews`。JSON 只是本次输入，长期记录只存原 Plan，不能另建状态账本。
4. 未解决阻断不能批准；修正回原 Plan，并重新审查当前对象。准备和正式开工需要有效 draft；Plan 准出需要有效 delivery，不能以交付审查替代真实验收。

记录包含 `stage`、`reviewer`、`executor`、`source`、`subject_fingerprint`、`verdict` 和 `findings`。阶段只有 draft/delivery；verdict 为 approved/needs-revision。发现保存 id、severity、summary、resolved，阻断为 blocking。executor 是 Plan owner；reviewer 不得是执行者或任一实施任务负责人。source 指向实际宿主委派或独立读者来源。CLI 检查这些声明，不认证任意宿主身份，协调者仍须核对真实来源。

draft 绑定原目标、Plan 语义及关联 Feature；delivery 还绑定真实实现和测试输入。语义或受审实现变化使对应记录失效，任务状态、运行证据和审查回填不因自身写入而失效。历史已完成记录按受测版本追溯，不能要求它批准后来不同的系统。

缺少 planning_contract/review_contract 的历史 Plan 按原契约解释，包括 task_contract 1/2；不会自动升级，也不能据此声称经过新审查。新 Plan 的草稿可以不完整，但不能越过新契约的正式准入。工具不能阻止宿主任意改文件或伪造身份声明，这些边界如实保留。

## 接续与纠偏

接续先核对原始目标、当前整体判断、用户最新要求及未完成项。取得阶段结果、出现重要新证据、准备扩大范围或重复失败时，比较承诺、已证明结果和剩余差距，确认当前行动仍解除主要阻碍。没有这些触发时不反复生成全套分析。

新发现阻止交付或违反必需边界，在原 Plan 补任务、规格与验收并解释重点变化；无关优化说明去向后继续原目标。保存修复中若证实跨用户读取私有数据，应更新重点与权限验收，不能用“只抓主问题”忽略它。

无信息重试按 [运行恢复](../others/evidence/README.md#运行恢复) 停止当前路径，改变假设或取证方式。局部探索停止不等于整个 Plan 阻塞；独立相关工作继续。确认剩余工作依赖未满足条件时才 blocked，并写明缺什么、责任方和恢复动作。

重要结果、范围变化和理由追加在原记录，不把失败改写成没发生，也不加逐工具日志。发现已通过检查仍未证明用户目标时保留真实缺口，不能只清空清单宣布完成。

## 完成与证据

从原始承诺逐项回查实际结果、对应 AC 与证据、被测版本和条件、剩余影响；不能只凭实现、测试标签或局部绿灯推断完成。任务同时满足：

- 纳入的 REQ/AC 与重要边界均有适用真实行为证据；
- 原目标行为已有 [真实 TDD 红灯与对应绿灯](../standards/testing.md#测试先行)；
- 当前输入通过 Plan integration，所有映射层级满足，实际差异要求的迁移检查有效；
- tasks 全部完成、真实缺口已解决、integrated_commit 可追溯；
- 当前 Design 已回写，未解决差异与取消/延期如实记录。

新版 Plan 的 required_evidence 仅为 check-integration；旧 verification_contract 1 按原契约处理。证据的生成、恢复和有效性见 [验收证据](../others/evidence/README.md)，不要重跑已有匹配证据。状态回填不能掩盖新输入；过期证据不妨碍继续修复，却不能完成 Plan。

Plan done 只证明此交付，不表示整个 Release 完成；组合版本由 [Release 完成条件](./releases/README.md#完成与证据) 判断，也不自动表示推送、部署或用户可访问。最终报告遵循 [沟通规则](../../AGENTS.md#沟通)。

报告本地交付前运行 `pnpm delivery:check --plan <IGT-ID>`，从该完成 Plan 的真实基线核对整个提交区间、暂存、未暂存和未跟踪改动。只有当前内容仍由有效完成记录覆盖才通过；其它 Plan 或后续改动不能靠一项完成记录掩盖。没有具体 Plan 的干净模板基线检查可用 `pnpm delivery:check --base <初始快照的40位commit>`，只证明声明范围没有未覆盖改动，不证明存在产品交付。不能把 HEAD 或最近一个提交当作本轮基线来缩小范围。

普通 `check` 和 `build` 保持工程检查含义。交付覆盖不代替原始目标的语义核对、Release 最终验收、远端或部署验证。这个只读入口不创建通过回执、不改任务状态，也不能阻止宿主绕过命令直接写文件或给出文本报告。用户明确暂不测试时不执行交付检查，按原约束保留待验证。

## 命令

模板见 [_template.md](./_template.md)。需要新交付时用 create:module 或 create:change；脚手架要求工作区干净，dry-run 只读预览。免业务 Plan 仅限检查器认定的根 README、docs/README、docs/others/README 和 docs/assets 静态展示资产，仍须文档、格式和差异检查；执行规则、专业规格、设计、测试和代码不能使用该豁免。

```text
pnpm ignite status
pnpm ignite next --plan <IGT-ID>
pnpm ignite task set-status <IGT-ID> <task-id> <todo|doing|done>
pnpm ignite check --plan <IGT-ID> --level auto
pnpm ignite plan set-status <IGT-ID> verifying --commit HEAD
pnpm ignite plan set-status <IGT-ID> done
```

next 默认保留全部 goals、constraints、non_goals 与 tasks，是接续建议；active 的进行中任务优先，没有进行中任务时列出全部待办供按证据选择。输入错误、真实缺口、阻塞和活动运行优先，快速验证仍可按需执行。详细机器上下文才加 --verbose。默认 next 不联网，不宣称远端已同步；需要核对时使用 next --verify-remote，只有 verified 表示该提交已在远端。

## 跨 Plan 依赖与交接

有跨 Plan 依赖、共享写入或交接时，在原 Plan 的协作字段对齐，不另建协调文件、收口 Plan 或状态表：

- `depends_on` 约束最终集成；开发阶段由上游提交明确接口及相关文件，下游在 `dependency_contracts` 引用 commit 和 paths。接口变化后重新对齐，文件快照不代替依赖 Plan 完成。
- Prisma Schema、API 注册、导航等共享文件在各相关 Plan 的 `shared_files` 声明同一负责人和模式。非负责人提交业务切片和 `handoff`；集成人接管相关 Plan owner 后修改共享文件并集成。
- 结构化任务只为未完成任务的 `scope` 保留写入范围。代码任务已完成、只剩文档验证时，不继续锁住整个 Plan 的代码范围；尚未完成的写入仍检查冲突。旧式或未声明任务范围的 Plan 保守使用 `write_scope`。这不改变上游 Plan 必须完成的集成门禁。
- `handoff` 包含接口、迁移、测试入口和未完成项。接收者核对实际快照与现有证据，上游局部通过不能当作组合完成。
- 并行开发优先不同工作区，提交用 `Ignite-Plan` trailer 标明归属。依赖或写入冲突在原 Plan 对齐；组合版本由 [Release 完成条件](./releases/README.md#完成与证据) 验证，当前事实按 Design 规则回写。

例如两个 Plan 都涉及 Prisma Schema，由已声明的集成人统一修改，其他人交接业务需求与迁移信息。上游 API 改动时更新原契约，让实际下游执行者对齐；发送消息仍须已有用户授权，文档交接不自动授权通知。

发生冲突时先辨明是目标、规格、接口、实现还是证据不一致，在所属真源修正：需求回 Feature，范围与行动回原 Plan，实际实现回 Design 和测试，组合范围回 Release。影响当前重点时按本页的接续与纠偏处理；产品结果或授权边界由人决定，独立相关工作继续。需要长期解释的架构取舍才记 ADR。

## 历史与方法依据

具体产品保留自己的 Plan 与证据。Ignite 模板发布仅带说明和空白模板；建设记录提交后由 Git 保存，清理边界见 [采用规范](../standards/adoption.md)。零 Plan 是正常起点，不能创建虚假过程记录。

重点选择参考 [NASA 决策分析](https://www.nasa.gov/reference/6-8-decision-analysis/) 的必要条件、竞争因素、不确定性和相称成本；阶段反馈借鉴 [目标进度监测研究](https://pubmed.ncbi.nlm.nih.gov/26479070/)。后者研究人，对 AI 的适用性仍需验证；作者判断、生成检查及结构校验不证明实际模型效果。
