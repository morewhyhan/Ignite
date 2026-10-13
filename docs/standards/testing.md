# 测试标准

测试按风险分层：

| 层级     | 工具                                                  | 当前职责                                                      |
| -------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| 静态检查 | TypeScript / ESLint / Prettier                        | 类型、边界、格式和禁止依赖                                    |
| API 行为 | Vitest                                                | 认证、校验、所有权、CRUD 和错误码                             |
| 迁移契约 | `scripts/test-migrations.mjs`、`pnpm ignite validate` | 干净数据库部署、重复部署、schema drift 与带样本数据的连续迁移 |
| 用户流程 | Playwright                                            | 路由守卫、认证和任务完整流程                                  |
| 视觉检查 | Playwright 截图 / 人工浏览器                          | 布局、响应式、动效和 DOM 难以断言的状态                       |
| 代码审查 | 人 + AI                                               | 复杂度、安全、边界和可维护性                                  |

`test:e2e:production` 使用已经编译的 Next.js 产物，以 `next start` 和隔离的测试数据库执行浏览器用例；这里的“production”指生产构建与启动方式，不代表真实生产环境、真实数据或部署验收。

桌面与移动项目共用每次运行新建的临时 SQLite，因此默认单 worker 串行执行，避免并发写锁把基础设施抖动误报成产品失败。

Vitest 的普通测试文件使用最多两个隔离 worker 并行；每个文件内的用例保持原有顺序，临时 Git 仓库和数据库按用例独立创建。需要嵌套启动测试进程的 Tasks 所有权故障注入在普通组完成后单独执行，避免并发资源竞争造成子进程时限失败；所有组仍由同一次运行和 reporter 验收。调度采用 [Vitest 分组顺序](https://v4.vitest.dev/config/sequence#sequence-grouporder)，不改变断言、时限或验收范围。

涉及外键、鉴权或私有资源的关键测试要做有针对性的故障注入：暂时移除所有权过滤后，对应测试必须失败。测试替身应按生产查询条件工作，不能在替身中偷偷补回生产代码漏掉的过滤。Playwright 仍使用单 worker，保护同一临时数据库。

常用命令：

```text
pnpm ignite check --plan IGT-000 --level auto --dry-run # 查看不可降低的检查范围
pnpm ignite check --plan IGT-000 --level integration    # 生成集成证据
pnpm ignite release verify <release-id> --plan <done-plan-id> # 新契约的最终生产构建 + 全量 E2E
pnpm ignite run status                                  # 只读查看运行状态
pnpm ignite release status                              # 查看派生发布状态
```

### 分级检查

`ignite check` 根据 Plan 声明的风险，以及 `base_commit...HEAD`、暂存区、工作区和未跟踪文件选择三层检查；两者取更高等级：

| 层级          | 用途                 | 默认范围                                                      |
| ------------- | -------------------- | ------------------------------------------------------------- |
| `dev`         | 实现中的快速反馈     | 文档结构/相关格式，或受影响源码 lint                          |
| `integration` | 一个 Plan 的集成验证 | 工程门禁 + 此 Plan 映射的 unit/database/browser/external 验收 |
| `release`     | 最终 Release 准出    | 所有 Plan 完成后，同一最终 commit 上生产构建与全量 E2E        |

普通说明文字不会启动 Next、Prisma 或 E2E。公共契约、认证、数据库、脚本、CSS、模块 Hook、设计快照、CI 和锁文件至少进入 integration；不能为了提速手工降低风险等级。真实运行不接受调用者提供的 `--files`。每个运行都保存输入与环境指纹，源码、测试、Schema、锁文件、Node、pnpm 或平台改变后旧运行不能复用。

目标测试优先从 Plan 的验收映射与模块名推导（例如 `src/modules/projects/` 对应可发现的 `tests/api/projects.test.ts` 或 `tests/contracts/projects.test.ts`）；影响关系不明或没有对应测试时回退全量 Vitest，不靠持续增加 Tasks 专属硬编码来维持。

`risk: docs` 只适用于 README、文档入口和静态资源等安全说明修改；如果实际差异触及 Feature、Design、Standards、测试或工程配置，CLI 会要求提高 Plan 风险和必需证据，而不是留下一个无法完成的低风险 Plan。

### 证据等级

结构检查、行为测试、真实数据库集成、浏览器旅程和真实外部走查是不同证据。源码中存在按钮、mock 请求成功或类型检查通过，不能替代用户操作和外部 provider 的真实证据。`done` 只在 Plan 元数据引用当前输入、允许运行时、真实 commit 的 `passed` manifest 后成立。

每条 Feature 验收标准使用稳定 `AC-*` ID，并在覆盖它的测试标题中写成 `[AC-*]`。Plan 的 `acceptance` 字段必须把 AC 映射到包含该标记的具体测试文件；文档检查会拒绝断链、重复 ID 或不存在的 Design 契约。新 Release coverage v2 还要逐个分配目标、REQ、AC 和负责 Plan；部分实现时，剩余 AC 必须显式延期或获授权排除。

静态标记只能证明关联；空回调即使带有 `AC-*` 也不算可运行的验收测试。Vitest 与 Playwright 在运行结束后还必须检查实际结果：带 AC 标记的测试若跳过、未完成、预期失败或重试后才通过，均不能作为通过证据。统一检查入口会传入当前 Plan，并要求本层适用的每条 AC 在所声明文件中实际通过；只运行其他测试不能补足缺失的验收结果。非空回调仍不保证断言正确，关键行为需按需求例子审查。

CI 是合并门槛，本次改动的 schema 2 Plan 必须达到终态；整个 Release 可继续包含未来任务，不因本次独立 Plan 合并而被错误宣布完成。未改动的未来草稿不阻塞本次交付。CI 用本次差异派生待交付 Plan 的验收集合，核对实际运行的测试，并确认每个非状态文件都落在本次完成 Plan 的 `write_scope` 内。只有 `minimumLevel` 认定的安全文案/资产可不建业务 Plan，它们仍经过 CI 文档与格式检查；Feature、Design、Standards、代码和执行规则不能使用此豁免。开发中可以提交分支进度，但在合并前必须完成证据闭环并刷新生成状态。

执行结果由 runner 的本地运行记录与完整日志核对后才发布摘要；仓库中的 manifest 不是不可伪造的证明。独立 CI 应在指定提交重跑验收，不能用手写 receipt 代替执行。Plan 的 `file::用例名` 映射按完整测试标题精确匹配，`.test.ts` 与 `.test.tsx` 均在 Vitest 发现范围内。命令输出将工程门禁、Plan 行为验收、Release 最终验收分开；Plan green 不代表 Plan done，Plan done 也不代表 Release 已验收。

行为、权限、缓存或输入契约变化必须更新对应测试；不能用 typecheck、lint 或 build
代替行为测试。

## 固定维护方法

先读本节必需条款与技能正文。在项目使用契约指定的 WSL/Linux Node，运行 `node scripts/ignite.mjs skill read --for docs/standards/testing.md --list`；这个入口无需安装依赖；每次调用只读一个目录的清单，首次清单输出容量至少 8192 tokens。清单只返回固定职责和必需方法，不代表正文已经读取。按各项 `tool_options.max_output_tokens` 设置宿主及外层封装的输出上限，再逐份运行 `node scripts/ignite.mjs skill read <name>`，每次工具调用只读取一份正文；也可逐份读取真源文件，截断时分段补齐。

涉及本类文档时，先读取以下必需方法：[tdd](../../.ai/pstack/skills/tdd/SKILL.md)、[principle-test-behavior-not-implementation](../../.ai/pstack/skills/principle-test-behavior-not-implementation/SKILL.md)、[principle-prove-it-works](../../.ai/pstack/skills/principle-prove-it-works/SKILL.md)。必须按下面的顺序处理，不能由 AI 自行省略；未触及本类文档时不强制执行。

1. 从对应 Feature AC 确认需要证明的实际行为和层级；选择能区分错误原因的断言，不能以测试数、结构检查或模拟数据库冒充真实行为。
2. 新 Plan 按原生 tdd red 契约保存真实行为失败，再在同一测试文件上实现并验证；环境失败、占位失败或事后补写不算红灯。
3. 按 Plan 检查选择执行必要验收，复用相同输入的有效运行；全局生产构建和 E2E 由最终 Release 承担。结果进入原生证据，不另建技能跑分表。

### 条件方法

已有验证技能需要同步时使用 [maintain-verification-skill](../../.ai/pstack/skills/maintain-verification-skill/SKILL.md)；确实缺少项目行为入口时才使用 [create-verification-skill](../../.ai/pstack/skills/create-verification-skill/SKILL.md)。纯重构的既有绿灯可保护行为，却不豁免新 Plan 的真实红灯；找不到真实待改行为时保留契约缺口，不能制造失败。用户暂不测试时保留待验证状态。

## 检查选择与断言尺度

排查和验收有不同目的：排查要区分可能原因、帮助选择行动；验收要证明已承诺的行为及边界。两者都围绕原始目标，局部排查结束不代表正式验收可以省略。

- 原因未明时，选能区分原因的最小充分检查，说明待回答的问题、观察对象及不同结果对应的下一步。若结果既不改变行动，也不承担必需验收，就停止该排查。
- 从原始承诺制定 AC，再选择能直接观察结果的层级；不从已实现的代码反推验收。单个 AC 应能独立判断通过或失败；共同构成一个结果的保存与刷新可以是同一旅程，权限等独立边界另行断言。不按函数数、文件数或测试数量衡量充分性。
- 关键断言说明它能抓住哪种错误。POST 成功不能证明持久化：相关承诺需要真实写入、重新读取及适用的浏览器行为。缺少必要层级时补该行为，重复单元测试不能替代它。
- 根据实际影响覆盖相关失败、权限、数据和兼容性，不要求每条 AC 在所有层级重复同一断言。关键权限及数据隔离按前述故障注入规则检验；不为每次改动机械增加全量变异测试。
- 输入未变且已有匹配的活动或通过运行时复用；失败的新信息已足以支持下一步时结束排查。环境错误先定位环境，不改行为断言，不把启动失败记作 TDD 红灯。重复失败按 [运行恢复](../others/evidence/README.md#运行恢复) 处理。

尺度示例：只改已确定的删除确认文案，验证文案和受影响交互；不重新论证数据库或删除产品规则。保存后刷新不可见，应观察真实写入、读取与界面结果以区分原因；每次都跑全仓测试可能增加耗时却没有缩小原因。正式门禁仍按 AC 层级、实际差异与风险执行，影响未知时扩大验证，不手动降低等级。

证据既要匹配规格，也要支持用户实际需要，参考 [NASA 的 verification 与 validation](https://www.nasa.gov/reference/2-0-fundamentals-of-systems-engineering/)。本文件定义各层证明什么，具体交付按 [Plan 完成条件](../plans/README.md#完成与证据) 和 [Release 完成条件](../plans/releases/README.md#完成与证据) 回查原始目标。

## 测试先行

新增持久化模块可直接完善脚手架的浏览器测试。它使用 `E2E_DATABASE_URL` 创建 PrismaClient；该地址由 `pnpm test:e2e` 的原生启动器生成，只指向本次隔离数据库。不要退回开发数据库，不把模拟 API 当成真实保存。

通过页面完成保存，再用 `database.<model>.findFirst(...)` 读取同一隔离数据库，刷新页面检查内容仍存在。将这条测试同时映射到适用 AC 的 database 和 browser 检查。失败提示可用真实字段校验或 `page.context().setOffline(true)` 观察，并在恢复联网后检查已填内容。持久化验收文件不能用 `page.route()` 替换业务 API。

- 新 Plan 先提交真实行为测试，再运行 `pnpm ignite tdd red --plan <ID> --ac <AC-ID>`。只有目标行为断言失败才记录红灯；模块加载失败、浏览器未启动、配置错误和脚手架的 `expect.fail` / `throw` 不能作为 TDD 证据。
- 用 `expect(actual, '[AC-ID] target').matcher(...)` 标记本条 AC 的目标断言。准备步骤的断言不加该标记；即使准备步骤位于同一测试函数内，它的失败也不能生成红灯。原生入口要求失败位置落在已标记的目标断言上。
- 红灯与绿灯之间保持目标测试、适用的初始化 hook 和所调用测试辅助函数不变；辅助函数默认放在测试目录的 `test-support/`、`test-helpers/`、`test-utils/`、`fixtures/` 或 `helpers/`。业务实现仍可正常修改。回执保存失败摘要和摘要哈希，完整输出留在本地诊断目录。
- 红灯记录提交后保持同一测试内容，完成实现；实施任务与当前 Plan 校验会比较工作区中的对应断言，发生变化时立即拒绝推进。完成后的历史 Plan 仍按其已验证提交追溯。Plan integration 运行映射的各层验收并验证同一测试已通过。
- 实现后先跑最小目标测试，再跑 Plan integration 与适用的 Release 最终验收。
- 开发排查使用 `pnpm ignite check --plan <ID> --feedback --ac <AC-ID>`；预览命令加 `--dry-run`。它只运行映射用例，不写 Plan/Release 证据或完成状态。原生 `check --level auto` 仍执行正式门禁，局部反馈不能代替它。用户暂不测试时这两个入口都不执行。
- 测试不能只断言成功路径；按风险覆盖未登录、非法输入、无权/不存在和缓存更新。
- UI 需求先在 `docs/others/test-cases/` 写用户路径，再把稳定路径固化为 E2E。
- 页面交互在 Plan integration 中运行真实浏览器验收；基础模板需覆盖 1440px、768px、390px 和 360px 常见宽度，Playwright 在失败时保留截图与 trace。
- 视觉、动画或 Canvas 等无法可靠通过 DOM 断言的场景使用截图或人工验证，并在 Plan 记录。

### 测试修正后重新取得证据

先区分实现错误和测试错误。实现错误保持原断言；测试存在竞态或错误预期时，在原 Plan 说明修正理由，保持用户要求和验收层级。当前绿灯不能证明修正后的测试曾在实现前失败。

1. 提交当前可恢复的工作。对未完成 Plan 运行 `pnpm ignite tdd restart --plan <ID> --ac <AC-ID> --reason "实际修正原因"`。绑定的红灯仍有效时返回 `restarted=false`，保持证明和任务，直接接续当前工作。只有绑定失效才保留旧回执和当前测试、业务代码，撤销该 AC 的旧红灯绑定、相关任务完成状态及 Plan 验收绑定，并记录原因。它不会产生新证明；下列恢复步骤只在 `restarted=true` 时执行。
2. 将该 AC 对应实现恢复为真实实现前的行为，保留其他独立成果和数据。不能删断言、添加占位失败、切换数据库或制造环境错误；不能修改基线或旧回执。回退可能影响真实数据或跨团队交付时按原授权边界处理。
3. 在这个未实现的版本提交修正后的测试和 Plan，运行原生 `tdd red`。这是新的修正循环，不是补写过去的红灯。若测试已通过，先核对预期和实际行为，不能伪造失败。
4. 提交新回执，再按原生任务命令进入实施，重做或重新应用该 AC 的实现。保持这次用例不变，重新完成 Plan integration、Design 与 Release 验收。旧绿灯不能拼成新通过。

为保留活跃实现，可在第 1 步后使用 `pnpm ignite tdd recover --plan <ID> --ac <AC-ID> --from <40位实现前commit> --restore <仓库相对路径,...>`。入口只创建隔离工作树，将指定实施范围恢复为明确的历史版本，保留当前规格和测试并提交快照；不运行测试或生成证明。历史来源和范围必须由实际缺失行为确定，不能用占位错误制造失败。

首次红灯前，新 Plan 的实施范围必须仍是基线。如果此前按授权先完成实现而没有任何红灯绑定，隔离恢复允许显式指定该 Plan 各实施切片的路径，输出 `first_red_baseline=true`；只恢复指定范围，不改活跃目录。取得第一条有效证明后，恢复重新限于该 AC 对应的实施范围。

在输出工作目录按项目运行时安装该副本自己的依赖，执行输出的原生 `tdd red` 并提交实际回执。再从活跃目录运行 `pnpm ignite tdd recover --plan <ID> --ac <AC-ID> --import <恢复工作树>`。导入核对当前测试、Plan 契约及实际提交的原生记录，并用保留当前树内容的 Git 合并连接真实红灯祖先；不会覆盖活跃实现。恢复工作树保留供审查，旧回执不删除。未知、过期或没有新红灯的工作树不能补凭证。

浏览器准备先完成隔离数据库、服务健康检查、首页和未登录工作台跳转，再进入业务用例计时。本地启动日志与 CI 一样可见；准备失败和没有报告均属于执行失败，不能算目标行为红灯。注册与 session 请求已成功而页面请求未完成时，先读取页面请求和编译 trace，不修改认证规则或增加自动重试来掩盖原因。

重复重启正在等待红灯的同一 AC 不重复回写。已完成 Plan 不能用这个入口修改历史，后续改动按存量 Plan 处理。没有新有效红灯时，实施和完成仍被拒绝。

测试路径的编写与维护见 [验收用例规则](../others/test-cases/README.md)，运行记录的恢复、复用与有效性见 [验收证据](../others/evidence/README.md)。目标反馈与正式门禁分别承担排查和交付职责，不为重复收口另建检查或 Plan。

手动使用 Vitest 的 testNamePattern 时，未绑定 Plan、CI 或验收结果文件的运行只判断被选择的案例。被选择但跳过的案例仍失败。绑定运行保持完整验收范围；局部通过不能代替 Plan 或 Release 证据。

浏览器启动器默认使用开发服务器。已完成构建的本地副本可通过 `E2E_SERVER_MODE=production` 选择生产服务器，或对 `pnpm test:e2e` 添加 `--production`。原生检查保留显式模式，开发与生产模式使用不同环境指纹，不能互相复用通过记录。生产服务器测试仍是本地验收，不代表部署完成，也不证明开发服务器故障已解决。
