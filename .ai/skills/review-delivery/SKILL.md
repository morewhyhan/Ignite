---
name: review-delivery
description: Independently audit an Ignite delivery against its original goals, actual changes, current run evidence and Design before declaring the Plan complete. Use at the delivery gate; passing structure alone is insufficient.
---

# 独立交付审查

本方法改编自 AGE 的 closure-audit-prompt，来源见 [许可与来源](../AGE-LICENSE.md)。固定触发、记录和准出条件归 [Plan 规则](../../../docs/plans/README.md)。结论留在原 Plan，不新增日志或完成状态。

## 输入与角色

运行 `pnpm ignite review context <ID> delivery`，读取原始请求、Feature、完整 Plan、当前 Design、实际差异和对应运行证据。独立查看被测版本及测试结果，不只接受实施者摘要。由未参与该对象实施的实际子 Agent 或独立读者执行；作者自查不能替代。

## 从承诺回查产物

- 逐条对照原始结果与约束、REQ/AC、真实实现和测试，确认没有在过程中缩小目标或把未完成事项移出范围。
- 核对行为层级和运行范围。模拟持久化不证明真实保存，API 返回不证明浏览器显示，局部测试不证明全局生产态验收。
- 读取真实失败、跳过和未运行项，以及证据对应输入和 commit；不能拼接不同版本的绿灯，不把开工审查当作交付证明。
- 核对任务实际产出、依赖和交接，确认方法职责匹配真实工作；标记 done 或引用技能不等于做到了。
- 核对 Feature、实现和当前 Design 是否一致，受影响事实是否回写；原始材料与临时研究不能成为平行真源。
- 逐项处理 remaining_work、延期、外部条件和用户授权边界。缺条件就保留缺口，不通过排除或改文案隐藏失败。
- 区分工程检查、Plan 完成、Release 组合验收，以及推送/部署。准备完成或局部集成通过不能冒充其它阶段完成。

审查可读取已有有效运行，无新输入或新疑点不重复全套检查。审查者发现证据不足，指出需要补的真实行为与范围，而不是凑更多测试数。

## 输出与记录

先按影响列具体发现和缺失证明，引用真实文件、REQ/AC、运行与被测版本。结论使用 PASS、ISSUES 或 BLOCKED；明确未覆盖范围和剩余影响。PASS 仅表示受审对象无已知阻断，不替代原生 Plan/Release 验收，也不保证每个模型会遵守方法。

PASS 对应记录中的 approved；ISSUES 和 BLOCKED 对应 needs-revision，并保留具体未解决发现。缺少实际独立角色时在原 Plan 保留阻塞原因，不编造 reviewer 补齐记录。

按 context 准备记录，由协调者执行 `pnpm ignite review record <ID> delivery --file <review.json>` 写入原 Plan。来源必须对应真实委派或独立读者；工具只校验声明和对象一致性。未解决阻断不能批准，修正实现或规格后重新审查当前对象。发现回到同一 Plan，禁止另建“收口”计划或用作者自评替代重审。
