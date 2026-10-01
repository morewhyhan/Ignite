# Plan 编写与维护

本页负责一轮工作怎样立项、选择行动、接续、纠偏和判断完成。每份具体 Plan 组织本轮目标与各专业产出；模板仅提供填写位置。

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

涉及 Prisma、认证或业务 API，填 `data_contract` 的资源归属、访问依据、迁移影响和恢复方式；破坏性变化引用人的授权。已有决定和实施授权继续有效，普通实现选择无需反复请示。

## 整体判断与推进顺序

先沿本轮相关链路核对结果成立的必要条件，再与实际事实比较缺口，选择当前最阻碍承诺的条件。可能是原因未明、依赖缺失或几个共同条件，不强求唯一根因。既有检查建议与进行中任务不能自动证明重点正确。

有真实竞争方向时用同一目标比较：各自阻碍什么结果、证据是什么、哪些是推测、先处理能解除什么依赖、代价与授权边界是否合适。不凑候选数量或编造评分。权限、数据、安全与兼容性等必需边界失效须处理；容易观察或容易修的局部问题不能因此优先。

在整体判断中记录相关完整链路、当前重点及依据、下一步应取得的结果和会推翻它的证据；其余发现说明纳入、延期或不属于本轮的理由，不另写一份任务状态。原因未明时怎样选择检查见 [测试标准](../standards/testing.md#检查选择与断言尺度)。

例如可靠保存与按钮间距同时有问题，先沿写入、读取、刷新呈现取证。POST 成功不能证明存储；若真实存储和读取正确，再定位界面如何使用结果，未写入则定位写入路径。没有证据时不先认定数据库出错，也不据此更换数据库。

tasks 按可判断产出拆分，不同责任、依赖、风险或验收需要分开时再细分。不把所有工作塞进“优化系统”，也不按读文件或每次命令拆任务。简单修改几句话即可，跨环节问题才展开；各专业的实现、测试和完成标准仍由原规则负责。

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

## 命令与协作字段

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

depends_on 表示最终依赖；dependency_contracts 锁定开发期上游文件快照；shared_files 声明负责人；handoff 保存接口、迁移、测试和剩余项。遇到跨 Plan 依赖、共享写入与交接时按 [跨 Plan 协作](../standards/workflow.md#跨-plan-依赖与交接) 对齐，单 Plan 的专业判断在本页完成。

## 历史与方法依据

具体产品保留自己的 Plan 与证据。Ignite 模板发布仅带说明和空白模板；建设记录提交后由 Git 保存，清理边界见 [采用规范](../standards/adoption.md)。零 Plan 是正常起点，不能创建虚假过程记录。

重点选择参考 [NASA 决策分析](https://www.nasa.gov/reference/6-8-decision-analysis/) 的必要条件、竞争因素、不确定性和相称成本；阶段反馈借鉴 [目标进度监测研究](https://pubmed.ncbi.nlm.nih.gov/26479070/)。后者研究人，对 AI 的适用性仍需验证；作者判断、生成检查及结构校验不证明实际模型效果。
