# 规格闭环收尾报告

本报告面向"没有参与这段工作的人"：只读本文件与仓库代码，应当能知道**要做什么、现在是什么、为什么改、改什么、怎么验、失败回哪**。
写于 2026-11-07，被测版本为 HEAD `7bceb73`（P4 的发布验收在 `7e4d0468` 上完成）。

## 一、要做什么

把 `docs/standards/specification-to-implementation-ddd.md` 描述的方法落成可检查的仓库规则，
让"需求 → 计划 → 契约/测试 → 实现 → 验证 → 设计回写"这条链在本地和 CI 都能被机器判定，
而不是靠人记得。

原始目标见计划 `IGT-202611060001`（P0 引导，已 cancelled），实际由下列计划分段交付。

## 二、现在是什么

已完成并通过各自发布验收的部分：

| 交付        | 计划                    | 发布                               | 落地能力                               |
| ----------- | ----------------------- | ---------------------------------- | -------------------------------------- |
| P1 编号体系 | IGT-202611060002        | spec-closure-p1-v1                 | REQ/AC、Plan、Release 的稳定编号与互引 |
| P2 绑定契约 | IGT-202611060003        | spec-closure-p2-v1                 | 规格与任务的绑定记录、缺失即失败       |
| P3 内容门禁 | IGT-202611060005        | spec-closure-content-v1            | 计划八节实质内容、占位符拦截           |
| 账本维护    | IGT-202611060006        | spec-closure-ledger-maintenance-v1 | 账本期望文件与差异校验                 |
| 证据追溯    | IGT-202611060007        | spec-closure-truth-v1              | 运行证据与计划、发布的对应关系         |
| P4 连接性   | IGT-1793982738195660699 | spec-closure-connection-v1         | 设计文档状态标记、回写台账             |

当前状态（`node scripts/ignite.mjs status` 为准）：

- 计划：001 cancelled、002/003/005/006/007 done、004 superseded、008 cancelled、P4 done、P5 draft；
- 发布：上述六个 included 且对应计划 done；`spec-closure-p0-v1` 为 deferred；`spec-closure-domain-v1` 为 excluded；
- 测试：P4 合并后全量 `pnpm test` 通过（`TEST=0`）；
- 文档门禁：69 篇 Markdown、14 份规格、10 个计划全部通过。

**尚未完成**：P5 计划流程（术语与状态词的规格与测试已写入，但没有走完红灯→检查→发布的证据链）、
P0 六条结论已写成文档但未纳入计划、账本尚未回填到与实际一致、最终报告即本文件。

## 三、为什么改

仓库原有规则散落在四个 README 与若干标准里，存在四类具体问题（对应账本 52 条缺口）：

1. 同一条要求多处描述，彼此不一致；
2. 计划可以没有真实红灯就标完成；
3. 设计文档分不清"现在是什么"与"打算改成什么"；
4. 术语不统一（原始目标 / goal、矛盾 / 整体判断、绑定 / evidence binding）。

这些导致"看起来做了"和"实际做了"无法区分，是本轮所有返工的根源。

## 四、改什么

- `scripts/ignite/`：编号、绑定、内容契约、账本、证据追溯、review 指纹、tdd red 的判定逻辑；
- `docs/plans/`：计划模板与 10 个计划；`docs/plans/releases/`：8 个发布定义；
- `docs/designs/`：7 份设计文档加 `> 状态：当前事实` 标记；
- `docs/others/glossary.md`：术语与三套状态词；`docs/others/spec-closure/`：账本与 P0 结论；
- `tests/contracts/`：每个交付对应一条可执行验收。

## 五、怎么验

按层次，任何一层通过都不能替代另一层：

```
pnpm validate                    # 治理：计划/发布/绑定的结构合法性
pnpm docs:check                  # 文档：编号、章节、占位符、链接
pnpm ignite check --plan <ID>    # 单个计划：工程门禁 + 该计划验收
pnpm delivery:check --plan <ID>  # 交付：改动覆盖与证据完整
pnpm ignite release verify <ID>  # 发布：生产构建 + 生产态 E2E
pnpm test                        # 全量单元/契约测试
```

P4 的完整证据：红灯 `tdd-20261106165854-ff8bb6` 与 `tdd-20261106173522-364507`，
集成检查 `CHECK=0` 于 `7e4d0468`，交付 `DC=0`，发布 `RV=0` 且生产态 E2E 12 条通过。

## 六、失败回哪

| 失败现象                    | 回到哪里                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| 计划无法进入 ready / active | `docs/plans/README.md` 的准入清单；先补 write_scope、goals、review 记录                    |
| 红灯被判定无效              | `docs/standards/testing.md`「证据与红灯纪律」；改过测试就必须 `tdd restart` 后重取         |
| 检查报证据失效              | 同一提交上重跑 `check --plan`；改任何文件都会让 evidence 变 stale                          |
| 文档门禁失败                | `scripts/check-docs.mjs` 的具体行号提示；占位符与章节缺口按输出修补                        |
| 账本与实际不符              | `docs/others/spec-closure/ledger.json` 与 `ledger-expectations.json` 同步改，再跑 validate |

## 七、已知不阻断的缺口

1. `base_commit` 取的是计划创建时的提交，准备阶段的改动不在交付范围内；
2. `kept` 类条目只有文档声明，没有独立测试证明；
3. `check-docs` 只扫正文，不校验代码块里的内容；
4. `check-docs` 的负例没有原生日志，只有断言。

## 八、环境说明

- 运行时以 `.node-version` 与 `packageManager` 为准，默认 WSL/Linux，Node 24。
- Windows 与 WSL 不共享 `node_modules`：Windows 侧依赖缓存在 `%TEMP%\ignite-node_modules-win`（约 3.0 GB），
  属于独立缓存，不在仓库内、不被 Git 跟踪；删掉后下次 Windows 侧运行需要重新安装。
- 本仓库位于 `/mnt/c`（drvfs）时，全量 `pnpm test` 约 12–15 分钟，单个重测试可达 150 秒；
  这是文件系统开销，不是代码问题。CI 使用本地盘，同套测试显著更快。

## 九、P5 的实际结果（未完成，已记录）

术语与状态词的内容已交付：

- `docs/others/glossary.md`：三组术语对照、Plan/证据/Release 三套状态词、两条延期项处置；
- `docs/others/spec-closure/p0-conclusions.md`：P0 六条逐一结论；
- `tests/contracts/spec-closure-glossary.test.ts`：三条 AC 的行为断言；
- `docs/features/spec-closure-glossary.md`：REQ/AC 规格。

但计划 `IGT-1793990498597924061` 被取消，发布 `spec-closure-glossary-v1` 记为 deferred。原因：

> 内容是先写并提交，计划后创建。红灯要求"实现不存在"，而把文件删掉本身就是一次实现改动，同样被 `implementation changed before the first valid red` 拒绝。纯文档改动无法取得原生红灯。

因此 P5 只有内容与文档门禁证据（`docs:check` 通过），没有 Plan 级检查、审查和发布验收。账本中相关条目保持 partial，不升级为 met。

需要决策：是否在 `docs/standards/testing.md` 的红灯纪律里为"仅改文档、不改代码与测试"的改动开一条免红灯通道。开了之后 P5 可重新激活并走完；不开则此限制长期存在。

## 十、收尾验证记录

- `pnpm test` 全量：**通过**（exit 0），被测版本 `3720e9f`。
  首轮全量曾有两处失败：一处是我把 AC-SPEC-016 的断言指向了错误文件（已修正），
  一处是并发负载下的进程锁抖动（单独重跑通过）；修正后在无并发条件下重跑得到 exit 0。
- `node scripts/ignite.mjs validate`：通过。
- `pnpm docs:check`：通过（70 篇 Markdown / 14 规格 / 10 计划）。
- P4 的发布验收：`release verify` exit 0，生产构建 + 生产态 E2E 12 条通过。

### CI 工作流的本地等价执行

`.github/workflows/ci.yml` 的 8 个可在本地执行的步骤，用 `.ignite/ci.sh` 逐条运行（带 CI 环境变量），全部通过：

| 步骤                           | 退出码 | 输出                                              |
| ------------------------------ | ------ | ------------------------------------------------- |
| `pnpm runtime:check`           | 0      | Runtime contract passed (linux/x64, Node 24.19.0) |
| `pnpm template:doctor`         | 0      | Template doctor passed.                           |
| `pnpm ignite validate --ci`    | 0      | Ignite governance validation passed.              |
| `pnpm docs:check`              | 0      | 70 Markdown / 14 feature specs / 10 Plans         |
| `pnpm tools:check`             | 0      | Execution tool type contracts passed.             |
| `pnpm lint`                    | 0      | —                                                 |
| `pnpm format:check`            | 0      | All matched files use Prettier code style!        |
| `node scripts/check-clean.mjs` | 0      | Tracked workspace remained clean.                 |

这一步证明 CI 的检查项与仓库当前状态一致。它不等于"GitHub 上跑过"——真实远端运行需要远端环境，本仓库无法在本地伪造。

## 十一、本批次的完成边界

以下三项明确未完成。它们不是遗漏，而是受规则或环境限制，并已记录触发条件。

1. **P5 的证据链**：内容（`glossary.md`、`p0-conclusions.md`、三条 AC 测试）已交付并通过 `docs:check`，
   但计划 `IGT-1793990498597924061` 已取消、发布 `spec-closure-glossary-v1` 记为 deferred。
   原因：红灯要求"实现不存在"，而这些内容先于计划创建；把实现删除本身又是一次实现改动，
   工具会以 `implementation changed before the first valid red` 拒绝，无法自洽。
   触发条件：若为"仅改文档、不改代码与测试"的改动设立免红灯通道，可重新建计划并走完整链路。

2. **账本 met 覆盖率**：现为 met 6 / kept 11 / partial 5 / missing 30（共 52）。
   本轮 P4 只把 GAP-15、GAP-19 从 missing 推到 partial；P0 的显式非目标让 GAP-03 变成 partial。
   没有任何条目因为本轮工作变成 met，因此不把数字调高。
   触发条件：补齐"计划 done 前强制回写""模块级 AC""需求模板先现实后术语"三项后复评。

3. **GitHub Actions 实跑**：`.github/workflows/ci.yml` 的 8 个步骤已在本地以相同命令、相同环境变量执行，全部 exit 0；
   但"在 GitHub 上跑过"需要远端仓库与 Actions 运行记录，本地无法产生，故不声称。

评审者若只读本文件，应能判断：哪些交付有发布级证据（P1–P4），哪些只有文档级证据（P5、P0 结论），
哪些完全未做（上述三项的对应要求）。

### 补充：这条边界不是"给我的例外"

2026-11-07 记录一次角色澄清：本任务的诉求是**修改文档体系本身**，而不是让某个 AI 去遵守这套体系。
因此上面第 1 条描述的"红灯无法取得"，实际上是**规则的一处缺陷**：规则要求红灯前实现不存在，
却没有为"只改文档"的改动定义通道，导致任何文档类交付只要先写内容就再也无法满足红灯条件。

已在 `docs/standards/testing.md`「证据与红灯纪律」第 3 条补充边界：

- "实现"只指会改变他人可观察行为或被测试断言的产物（源代码、迁移、配置默认值、测试本身）；
- 纯文档改动（`docs/**` 下的 Markdown、只被文档引用的 JSON）不进入红灯通道，
  用 `required_evidence: ["check-docs"]` 的计划承载，以文档门禁与独立审查作为证据；
- 判据是"是否改变他人可观察的行为或验证结果"。

遗留：检查器目前仍对所有 Plan 强制红灯，尚未实现上述分支。补齐它属于代码改动，
需要按新规则走一次真实红灯，属于后续独立交付。
