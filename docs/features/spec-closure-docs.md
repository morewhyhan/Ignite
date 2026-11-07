# 规格闭环：免 Plan 通道与纯文档计划

## 背景与目标

规则有两条口子曾经只写在别处：免 Plan 的边界，以及纯文档改动如何取证。
使用者在 `docs/plans/README.md` 里找不到它们，只能靠猜或问人。本模块把它们写进计划规则，并让检查器认这条通道。

## 业务规则

- R1（REQ-SPEC-017）：计划规则必须写明免 Plan 的两类范围与纯文档计划的取证方式。

## 验收标准

- AC-SPEC-017（REQ-SPEC-017）：Given `docs/plans/README.md` When 检查 Then 含"免 Plan 通道与纯文档计划"一节，且同时出现 `check-docs` 与 `write_scope` 字样。

## 模块边界

只改计划规则文档与对应说明，不改检查器行为（检查器已在 state.mjs 支持该通道）。
