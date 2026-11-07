# 规格闭环：免 Plan 通道与纯文档计划

## 背景与目标

规则有两条口子曾经只写在别处：免 Plan 的边界，以及纯文档改动如何取证。
使用者在 `docs/plans/README.md` 里找不到它们，只能靠猜或问人。本模块把它们写进计划规则，并让检查器认这条通道。

## 业务规则

- R1（REQ-SPEC-017）：计划规则必须写明免 Plan 的两类范围与纯文档计划的取证方式。
- R2（REQ-SPEC-018）：规格闭环标准里的每条要求，都要有唯一出处、可在文件里指出来，并能被检查器或测试验证。
- R3（REQ-SPEC-019）：设计文档要记录真实业务事件，四个目录说明要写各自职责，关键段落要标来源，检查要能拦住空壳。

## 验收标准

- AC-SPEC-017（REQ-SPEC-017）：Given `docs/plans/README.md` When 检查 Then 含"免 Plan 通道与纯文档计划"一节，且同时出现 `check-docs` 与 `write_scope` 字样。
- AC-SPEC-018（REQ-SPEC-018）：Given 需求模板与计划规则 When 阅读 Then 模板先写现实后写术语，且计划规则列出七类来源与不适用理由。
- AC-SPEC-019（REQ-SPEC-018）：Given 标准正文 When 阅读 Then 回写、失败回流、ADR 重绑与模块交接各有唯一出处。
- AC-SPEC-020（REQ-SPEC-018）：Given 四个文档模块说明文件 When 阅读 Then 逐条回答 §8.1 的模块目标与交接十项。
- AC-SPEC-021（REQ-SPEC-018）：Given 标准正文 When 阅读 Then 定稿状态、模块编号与设计承载规则三者表述一致。
- AC-SPEC-022（REQ-SPEC-018）：Given 设计文档 When 阅读 Then 含"事件与命令"章节，按 §9.3 的六步顺序记录。
- AC-SPEC-023（REQ-SPEC-018）：Given 计划模板 When 阅读 Then 验收标准带 module 字段，且新计划缺该字段时检查报错。
- AC-SPEC-024（REQ-SPEC-018）：Given 一个只包含文档计划的发布 When 运行 release verify Then 接受 check-docs 级运行记录，不再要求 check-release。
- AC-SPEC-025（REQ-SPEC-019）：Given 八份设计文档 When 阅读事件章节 Then 每份都有至少一条真实业务事件，且没有未填写的占位行。
- AC-SPEC-026（REQ-SPEC-019）：Given 四个目录说明 When 阅读模块说明 Then 四份内容互不相同，且各自说明本目录职责。
- AC-SPEC-027（REQ-SPEC-019）：Given 设计文档 When 阅读关键断言 Then 至少五份带来源标记。
- AC-SPEC-028（REQ-SPEC-019）：Given 结构检查 When 文档缺状态、留占位或四份说明雷同 Then 检查报错。

## 模块边界

只改计划规则文档与对应说明，不改检查器行为（检查器已在 state.mjs 支持该通道）。
