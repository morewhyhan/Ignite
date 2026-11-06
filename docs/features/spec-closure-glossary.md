# 规格闭环：术语与状态词

## 背景与目标

同一件事在仓库里有多种叫法（原始目标 / goal、矛盾 / 整体判断、绑定 / evidence binding），
Plan、证据、Release 三套状态词也常被混用。本模块把这些说法固定下来，并给出两条历史延期项的处置。

## 业务规则

- R1（REQ-SPEC-014）：仓库必须有一份术语对照，覆盖目标、整体判断、证据绑定三组说法。
- R2（REQ-SPEC-015）：必须给出 Plan、证据、Release 三套状态词及对应关系，且说明不能互相冒充。
- R3（REQ-SPEC-016）：两条历史延期项（文档定稿状态机、领域事件）必须各有处置结论。

## 验收标准

- AC-SPEC-014（REQ-SPEC-014）：Given docs/others/glossary.md When 检查 Then 含三组术语对照表，且每组有旧说法与新叫法两列。
- AC-SPEC-015（REQ-SPEC-015）：Given 同一文件 When 检查 Then 含 Plan / 证据 / Release 三张状态表，并出现"不能互相冒充"的约束说明。
- AC-SPEC-016（REQ-SPEC-016）：Given 同一文件 When 检查 Then 对两条延期项各给出实现、非目标或延期触发条件之一。

## 模块边界

只新增与校验术语文档，不改动代码、测试运行器与发布流程。
