# 规格闭环：免 Plan 通道与纯文档计划

## 背景与目标

规则有两条口子曾经只写在别处：免 Plan 的边界，以及纯文档改动如何取证。
使用者在 `docs/plans/README.md` 里找不到它们，只能靠猜或问人。本模块把它们写进计划规则，并让检查器认这条通道。

## 业务规则

- R1（REQ-SPEC-017）：计划规则必须写明免 Plan 的两类范围与纯文档计划的取证方式。
- R2（REQ-SPEC-018）：规格闭环标准里的每条要求，都要有唯一出处、可在文件里指出来，并能被检查器或测试验证。

## 验收标准

- AC-SPEC-017（REQ-SPEC-017）：Given `docs/plans/README.md` When 检查 Then 含"免 Plan 通道与纯文档计划"一节，且同时出现 `check-docs` 与 `write_scope` 字样。
- AC-SPEC-018（REQ-SPEC-018）：Given 需求模板与计划规则 When 阅读 Then 模板先写现实后写术语，且计划规则列出七类来源与不适用理由。
- AC-SPEC-019（REQ-SPEC-018）：Given 标准正文 When 阅读 Then 回写、失败回流、ADR 重绑与模块交接各有唯一出处。
- AC-SPEC-020（REQ-SPEC-018）：Given 四个文档模块说明文件 When 阅读 Then 逐条回答 §8.1 的模块目标与交接十项。
- AC-SPEC-021（REQ-SPEC-018）：Given 标准正文 When 阅读 Then 定稿状态、模块编号与设计承载规则三者表述一致。
- AC-SPEC-022（REQ-SPEC-018）：Given 设计文档 When 阅读 Then 含"事件与命令"章节，按 §9.3 的六步顺序记录。
- AC-SPEC-023（REQ-SPEC-018）：Given 计划模板 When 阅读 Then 验收标准带 module 字段，且新计划缺该字段时检查报错。

## 模块边界

只改计划规则文档与对应说明，不改检查器行为（检查器已在 state.mjs 支持该通道）。
