# 文档体系

## 入口：`docs/GOAL.md`（目标树）

整套文档只有一个入口：[GOAL.md](./GOAL.md)。它是需求真源，也是一张实时看板。

```
目标      这套软件最终让人完成什么
 └ 领域   一块业务边界：管什么、不管什么
    └ REQ 这个边界里一条必须成立的规则
       └ AC 用户做什么、看到什么
          └ 测试 怎么证明
```

打开它，顶部三样东西直接告诉你现状：

```
goal-status   每条 AC 的测试、状态、验证说明
goal-current  正在做第几步、哪条 REQ、哪条 AC
合计          已验证几条、缺证据几条
```

状态含义：

| 状态       | 意思                                     |
| ---------- | ---------------------------------------- |
| 缺测试     | 还没有测试文件提到这条 AC                |
| 测试缺编号 | 文件在，但测试标题里没有 `[AC-编号]`     |
| 有测试     | 有测试，但还没跑过或没有证据             |
| 已验证     | 测试通过（非浏览器）或已有截图（浏览器） |
| 缺证据     | 有测试，但没有运行日志或截图             |
| 缺截图     | 浏览器类 AC 只有日志，没有截图           |
| 失败       | 最近一次运行失败                         |

## 五层文档各管什么

| 层   | 位置                                                    | 回答的问题           | 和 GOAL 的关系                                    |
| ---- | ------------------------------------------------------- | -------------------- | ------------------------------------------------- |
| 需求 | [GOAL.md](./GOAL.md) + [features](./features/README.md) | 要什么、怎样算做到   | GOAL 放目录与 AC，Feature 放细节；AC 文本两处一致 |
| 事实 | [designs](./designs/README.md)                          | 系统现在实际怎样工作 | 每份设计开头写“关联需求：REQ-…”                   |
| 规则 | [standards](./standards/README.md)                      | 长期遵守的工程约定   | 不重复需求，只写怎么做                            |
| 决策 | [others/adr](./others/adr/README.md)                    | 为什么这样选         | 写清影响了哪些 REQ                                |
| 证据 | [others/evidence](./others/evidence/README.md)          | 怎么证明做到         | 运行日志与截图，被 GOAL 引用                      |

[plans](./plans/README.md) 是可选的施工单：跨多天、多人、数据迁移、权限、金额计算才建，交付后归档。

## 怎么读、怎么写

```
开工：读 GOAL → 找到本次的 REQ 与 AC → 点开它链接的 Feature 与 Design
改动：只改本次范围；测试标题带 [AC-编号]；说明写四段（场景/通过/不过/未覆盖）
收尾：pnpm goal:status --run；浏览器类 AC 另存截图并登记
需求变了：先改 GOAL，再 pnpm goal:audit --record "结论"，旧记录自动作废
```

## 按任务找文档

| 我要做的事                       | 先读                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| 知道现在做到哪                   | [GOAL.md](./GOAL.md) 顶部的状态表                             |
| 加一条需求                       | [GOAL.md](./GOAL.md) + [目标树标准](./standards/goal-tree.md) |
| 写某个领域的需求细节             | [features](./features/README.md)                              |
| 查某个字段、接口、页面现在是什么 | [designs](./designs/README.md)                                |
| 查该用哪层测试、怎么写说明       | [测试标准](./standards/testing.md)                            |
| 查目录、错误格式、鉴权规则       | [standards](./standards/README.md)                            |
| 查某个决定为什么这样做           | [ADR](./others/adr/README.md)                                 |
| 查一次交付的证据                 | [evidence](./others/evidence/README.md)                       |
| 查模板怎么采用、怎么替换品牌     | [采用规范](./standards/adoption.md)                           |

## 文档和代码不一致时

```
1. 先看 GOAL：这条 AC 是否存在、是否已验证
2. 再看 designs：当前事实是否已经更新
3. 都不一致：以代码行为为准，补 designs，再判断是改实现还是改需求
```

需求要改，回 GOAL；事实要改，回 designs；规则要改，回 standards。不要在三处各写一版。

---

[返回项目介绍](../README.md) · [目标树](./GOAL.md) · [工程标准](./standards/README.md) · [当前设计](./designs/README.md) · [版本更新](../CHANGELOG.md)
