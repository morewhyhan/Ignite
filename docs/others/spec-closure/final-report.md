# 规格闭环：体系说明

本文件写给**要使用或维护这套模板的人**。它说明这套文档体系现在是什么、为什么这样设计、
一条改动该走哪条通道、以及哪里还没有覆盖。它不是某次任务的流水账。

## 一、这套体系是什么

三层，各有明确职责：

| 层     | 位置                                                                                | 管什么                                     |
| ------ | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| 文档   | `docs/features/`、`docs/designs/`、`docs/plans/`、`docs/standards/`、`docs/others/` | 需求、当前事实、计划、工程标准、验收与决策 |
| 规则   | 各目录的 `README.md` 与 `AGENTS.md`                                                 | 每类文档怎么写、什么时候可以进入下一步     |
| 检查器 | `scripts/ignite/`、`scripts/check-docs.mjs`                                         | 把规则变成可执行的判定，防止只靠自觉       |

设计取舍：**规则必须能被机器判定，否则会退化成"看起来做了"**。这也是为什么大部分规则都对应一条检查器行为，
而不是只写在文档里。

## 二、一条改动走哪条通道

先判断改动是否改变他人可观察的行为，再选通道：

| 改动类型  | 判据                                                              | 通道     | 需要的证据                                                                                 |
| --------- | ----------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| 纯文档    | 只改 `docs/**` 下的 Markdown 或只被文档引用的 JSON                | 文档通道 | `check-docs` + 一次独立审查；**不需要红灯**                                                |
| 功能/行为 | 改源代码、迁移、配置默认值、测试                                  | 功能通道 | feature → plan → 红灯 → 实现 → `check --plan` → done → `delivery:check` → `release verify` |
| 规则本身  | 改 `docs/**/README.md`、`AGENTS.md`、`scripts/ignite/` 的判定逻辑 | 规则通道 | 按功能通道执行（规则同样是行为），并说明它解决了哪个真实卡点                               |

判据是"是否改变他人可观察的行为或验证结果"，不是改动行数。

## 三、状态词

### Plan 状态

`draft` → `ready` → `active` → `verifying` → `done`；另有 `blocked`、`cancelled`、`superseded`。
只有 `done` 表示交付完成；`cancelled` 表示主动放弃并保留记录，不等于完成。

### 证据状态

`red`（实现前失败）→ `green`（实现后通过）；`stale`（对应提交或测试变了，不能再用）；`restarted`（明确记录重启原因）。

### Release 状态

`included`（由已列入的 Plan 交付）、`deferred`（本轮不做，写明原因或触发条件）、`excluded`（明确不做）。

三套状态不能互相冒充：Plan `done` 不等于 Release 验收通过，Release `included` 也不代表 Plan 已完成。

## 四、账本四档

`docs/others/spec-closure/ledger.json` 用四档记录每条要求的状态，判据写在文件 `criteria` 字段：

- `met`：有可运行的实现或检查，能用一条具体命令复现；
- `kept`：模板基线本来就满足，无需新增实现；
- `partial`：已落地一部分，未覆盖全部，必须写明缺哪部分；
- `missing`：没有实现；决定不做或延期用 `disposition` 记录，`result` 仍是 `missing`。

关键区分：**非目标、延期、排除都不是 partial**。"不打算做"与"做了一半"是不同的事，
混在一起会让账本失去判断价值。

## 五、当前边界

| 边界                 | 现状                                                                                | 触发条件                                                     |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 文档通道的检查器支持 | 已实现：`required_evidence` 含 `check-docs` 且写入范围全在 `docs/` 的计划不要求红灯 | —                                                            |
| 账本覆盖率           | met 6 / kept 11 / partial 18 / missing 17（共 52）                                  | 补齐"done 前强制回写""模块级 AC""需求模板先现实后术语"后复评 |
| GitHub Actions 实跑  | 8 个步骤已在本地以相同命令执行且全部通过                                            | 推送到远端触发                                               |
| `check-docs` 的覆盖  | 只扫正文的结构与链接，不校验代码块内容                                              | 需要时扩展为语法级校验                                       |

## 六、这次改了什么，为什么

| 改动                                                                   | 原因                                                                                               |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `docs/standards/testing.md` 增加纯文档改动的边界                       | 原规则要求"红灯前实现不存在"，却没有给文档改动留通道，导致文档类交付一旦先写内容就永远满足不了红灯 |
| `scripts/ignite/state.mjs` 增加 `docOnlyPlan` 判定与 `check-docs` 证据 | 让上面的边界真的生效，而不是只写在文档里                                                           |
| `ledger.json` 增加 `criteria` 字段                                     | 四档原来只有名字没有判据，使用者无法据此判断该记哪一档                                             |
| 术语表 `docs/others/glossary.md`                                       | 同一概念有多种叫法，导致沟通成本                                                                   |

## 七、怎么验证

```
node scripts/check-docs.mjs           # 文档结构、编号、占位符、链接
node scripts/ignite.mjs validate      # 计划/发布/绑定/账本的治理合法性
pnpm ignite check --plan <ID>         # 单个计划的工程门禁与该计划验收
pnpm delivery:check --plan <ID>       # 交付覆盖与证据完整
pnpm ignite release verify <ID>       # 生产构建与生产态 E2E
pnpm test                             # 全量单元与契约测试
```

任一层的绿灯都不代表另一层完成。

### 记录：P5 计划检查两次在 130 退出

`check --plan IGT-1793990498597924061` 两次运行都显示 8 项门禁通过、验收用例 `✓ 217`、`FAIL 0`，
随后以退出码 130（SIGINT）中断——是宿主对长任务的时限，不是断言失败。
对应日志：`.ignite/ck21.log`、`.ignite/ck22.log`。

结论：P5 作为纯文档计划的通道验证已完成（红灯要求不再出现、范围与格式问题已消除），
但"一次跑完的绿色检查"在本机 drvfs 环境下难以取得。计划状态记为 `verifying`，
不记为 `done`；换到本地盘或更宽松时限的 CI 上重跑一次即可闭合。

## 附：纯文档计划的真实成本（实测）

新建一个纯文档计划并让它通过 `check --plan`，实际要补 8 处，缺一处就换一条报错：

| #   | 报错                                                       | 需要的修改                            |
| --- | ---------------------------------------------------------- | ------------------------------------- |
| 1   | acceptance must map at least one AC to tests               | 计划 acceptance 指向一条测试          |
| 2   | release scope references unknown requirement               | 发布 scope 的 requirements 写真实 REQ |
| 3   | REQ has no matching acceptance                             | 发布 scope 的 acceptance 补 AC        |
| 4   | T4 owner must name the responsible person                  | 每个任务补 owner                      |
| 5   | ready Plans cannot retain placeholder authorization.source | 写真实授权来源                        |
| 6   | implement task requires acceptance IDs                     | red/implement 任务映射 AC             |
| 7   | draft review fingerprint is stale                          | 元数据改完后重记审查（且必须先提交）  |
| 8   | Plan scope violation / committed execution inputs          | 写入范围覆盖被改文件，且工作树干净    |

这不是缺陷清单，而是**新建计划的真实准入成本**。如果希望降低，应让 `create-change` 生成时就带 owner、AC 映射与 release scope 骨架，而不是让使用者逐个试错。

## 十二、本轮（批次 A / B）实际解决的条目

| 账本条目                        | 落地位置                                                    | 提交    |
| ------------------------------- | ----------------------------------------------------------- | ------- |
| GAP-02 草案留在标准目录         | `docs/standards/ai-agents.md`：未定稿不进 standards         | 67619cd |
| GAP-05 五步法与 Loop 并存       | `AGENTS.md`：五步法是单次交付顺序，Loop 跨交付，接口是 Plan | 67619cd |
| GAP-06 四份执行顺序             | `AGENTS.md`：执行顺序只有一处，其它文档只写差异             | 67619cd |
| GAP-08 目录即方法入口           | `AGENTS.md`：承认并由目录+README 承载方法                   | 67619cd |
| GAP-11 缺阶段目标/代价/假设     | `docs/plans/_template.md` 原始目标章节                      | a36b3e7 |
| GAP-29 任务缺改变条件与失败判定 | `docs/plans/_template.md` 实现任务章节                      | a36b3e7 |
| GAP-33 主要矛盾缺三项           | `docs/plans/_template.md`：两条件真实、方向相反、相互制约   | a36b3e7 |
| GAP-12 目标与事实只比四维       | `docs/plans/_template.md`：同维度比较表                     | b9fabe4 |
| GAP-28 回退只覆盖数据类         | `docs/plans/_template.md`：含配置、接口、对外行为           | b9fabe4 |
| GAP-34 来源不适用无理由         | `docs/plans/_template.md`：不适用来源与理由                 | b9fabe4 |
| GAP-26 准备/验证任务不绑验收    | `docs/plans/_template.md`：无验收指向不算任务               | 2b736cc |
| GAP-30 十条准入只落实一半       | `docs/plans/README.md`：进入实现前的十条准入                | 2b736cc |
| GAP-32 计划不是任务清单         | `docs/plans/_template.md`：任务只是证明落点                 | 2b736cc |

这 13 条记 `partial` 而非 `met`：改动已落地并有提交号，但**没有承载它们的计划编号**。账本判据要求 `met` 指向真实计划；补计划属于下一轮的结构问题，不是改数字能解决的。

## 十三、仍未闭合的两项与原因

**P5 收尾**：计划 `IGT-1793990498597924061` 停在 `verifying`。`check --plan` 已消除红灯与范围问题，但连续撞上三条元数据约束——基线漂移、`integrated_commit` 必须晚于基线、且该提交必须包含当前 Plan 契约。三者互相牵制，形成"改一个换一条报错"的循环，且每次重跑约 12 分钟。处理方式记录为：需要一次专门的基线对齐（base / 契约 / integrated 同时确定），不是重复重试。

**GAP-47 模块级 AC**：AC 结构是扁平数组，无模块字段；加字段要迁移 11 个已完成计划的 AC 结构。影响面大且不影响收尾判定，记为 `missing` 并写明触发条件：当出现"模块边界被改坏但 AC 未覆盖"的真实事故时优先做。

## 十四、全量测试的最终结果与一处环境限制

最终一次全量（提交 50e3040 之后）：

```
pnpm exec vitest run --maxWorkers=1  → TEST=0
```

默认并发（`maxWorkers=2`）下曾失败一次，唯一失败项是
`tests/contracts/execution-trust.test.ts [AC-TRUST-010]`，报
`Test timed out in 240000ms`；单独运行该用例 `TRUST=0` 通过。
因此这是 `/mnt/c`（drvfs）上并发争用 IO 造成的超时，不是断言失败，也不是本轮改动引入的回归。
结论按事实记：**单并发全绿；默认并发下有 1 条 240 秒超时**。
跑 CI 或本地验收时，建议在本地盘执行，或把该用例与其它 CLI 用例串行。
