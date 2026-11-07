# 从零走到完成：一份可以照着做的示例

这份文档只做一件事：让你从新建计划一路走到 `done`，中途不需要查别的文档。
顺序按真实跑过的来；遇到报错，按后面的"接着跑什么"处理。

## 0. 准备

```bash
export PATH=$HOME/node24/bin:/usr/bin:/bin
cd /home/why/ignite
```

先确认底子是绿的：

```bash
node scripts/ignite.mjs validate
node scripts/check-docs.mjs
```

两条都要输出 passed。不通过先修，不要往下走。

## 1. 新建计划

```bash
node scripts/create-change.mjs my-change --authorization "说明这次改动的授权来源"
```

会生成 `docs/plans/<日期>-my-change.md` 和 `docs/plans/releases/my-change-v1.json`，并打印计划编号（形如 `IGT-1794...`）。

**接着跑什么**：记下这个编号，后面所有命令都要用。

## 2. 补需求与验收

在 `docs/features/` 里找到或新建对应规格，写清：

- 一条 `REQ-*` 规则
- 一条或多条 `AC-*`，每条写明 Given / When / Then

然后在计划里填 `requirements`、`acceptance`（`fill-plan.mjs` 可以代劳）：

```bash
node scripts/fill-plan.mjs --plan docs/plans/<日期>-my-change.md --req REQ-XXX-001 --ac AC-XXX-001
```

**常见报错**：`acceptance AC-... must declare the module path`
**接着跑什么**：给每条验收补 `module` 字段（写它所属的目录，例如 `src/modules/my-change` 或 `docs/standards`）。

## 3. 填发布范围

打开 `docs/plans/releases/my-change-v1.json`，把 `scope[0]` 里的占位文字换掉：

- `text`：这次要达成什么
- `source`：来自哪里
- `requirements` / `acceptance`：与计划一致
- `plan_ids`：计划编号

**常见报错**：`ready Release scope cannot retain placeholder text`
**接着跑什么**：把"待填写"全部替换成真实内容。

## 4. 记录 draft 审查

```bash
node scripts/ignite.mjs review context <IGT-ID> draft > /tmp/ctx.json
```

用 `/tmp/ctx.json` 里的 `subject_fingerprint` 写一份审查记录（reviewer、executor、source、stage、verdict、findings），然后：

```bash
node scripts/ignite.mjs review record <IGT-ID> draft --file /tmp/review.json
```

**常见报错**：`draft review fingerprint is stale`
**接着跑什么**：重新跑 `review context`，再 `review record`。改过计划或 Feature 就要重记一次。

## 5. 置 ready、active，取红灯

```bash
node scripts/ignite.mjs plan validate <IGT-ID> --prepare   # 先看 ready 是不是 true
node scripts/ignite.mjs plan set-status <IGT-ID> ready
node scripts/ignite.mjs plan set-status <IGT-ID> active
node scripts/ignite.mjs task set-status <IGT-ID> T1 done
node scripts/ignite.mjs task set-status <IGT-ID> T2 doing
node scripts/ignite.mjs tdd red --plan <IGT-ID> --ac AC-XXX-001
```

红灯要求：目标断言先失败，且失败信息里带 `[AC-XXX-001] target`。

**常见报错**：`implementation changed before the first valid red`
**接着跑什么**：先把实现改动提交或暂存，让工作区只剩测试；再取红灯。

**常见报错**：`has no target assertion`
**接着跑什么**：在断言上写 `expect(actual, '[AC-XXX-001] target ...')`。

## 6. 写实现，跑计划检查

```bash
node scripts/ignite.mjs check --plan <IGT-ID> --level auto
```

**常见报错**：`is outside Plan write_scope`
**接着跑什么**：把该路径加进计划的 `write_scope`，或在计划里去掉不相关的改动。

**常见报错**：`Plan progress block is stale`
**接着跑什么**：`node scripts/ignite.mjs plan refresh <IGT-ID>`，再提交后重跑检查。

## 7. 记录交付审查

```bash
node scripts/ignite.mjs review context <IGT-ID> delivery > /tmp/dctx.json
node scripts/ignite.mjs review record <IGT-ID> delivery --file /tmp/dreview.json
```

**注意**：交付审查记录之后不要再改计划涉及的文件，否则指纹会失效。

## 8. 置 done

```bash
node scripts/ignite.mjs plan set-status <IGT-ID> verifying
node scripts/ignite.mjs plan set-status <IGT-ID> done
```

**常见报错**：`integrated_commit must descend from base_commit`
**接着跑什么**：把 `integrated_commit` 指向最近一次通过检查的那个提交。

**常见报错**：`done Plan still has unverified work`
**接着跑什么**：清空计划里的 `remaining_work` 占位。

## 9. 跑发布验证

```bash
node scripts/ignite.mjs release verify my-change-v1 --plan <IGT-ID>
```

通过后提交验证产出的文件：

```bash
git add -A docs && git commit -m "release: verify my-change-v1"
```

**注意**：之后再改计划或证据文件，发布状态会回到 `verifying`，需要重跑一次。

## 一路上的顺序规则

| 你改了什么                 | 什么会失效         | 跑什么恢复                                                   |
| -------------------------- | ------------------ | ------------------------------------------------------------ |
| 计划的 `base_commit`       | 范围判定、审查指纹 | 重记 draft 审查，再重跑检查                                  |
| 计划的 `integrated_commit` | 证据时点校验       | 指向最近一次通过的检查提交                                   |
| 计划正文或 Feature         | 审查指纹           | `review context` + `review record`（draft 与 delivery 都要） |
| 代码或测试                 | 检查证据、红灯     | 重跑 `check --plan`；改过测试要重取红灯                      |
| 什么都没改却报过期         | 进度块             | `plan refresh <IGT-ID>`                                      |
