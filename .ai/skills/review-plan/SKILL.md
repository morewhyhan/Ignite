---
name: review-plan
description: Independently audit an Ignite Plan before implementation against the original request, task outcomes, dependencies and real acceptance coverage. Use at the draft review gate; this is not delivery verification.
---

# 独立计划审查

本方法改编自 AGE 的 plan-audit-prompt，来源见 [许可与来源](../AGE-LICENSE.md)。固定触发、记录结构及开工条件归 [Plan 规则](../../../docs/plans/README.md)。不创建第二份计划或批准账本。

## 输入与角色

读取原始请求或其保存来源、AGENTS、相关 Feature、当前 Design 和完整 Plan。运行 `pnpm ignite review context <ID> draft` 取得当前审查对象；核对完整正文，不只看协调者摘要。缺输入明确列为缺口。

由未参与该对象实施的实际子 Agent 或独立读者审查。作者重新阅读有助于修正草稿，但不能冒充第二位审查者。使用当前宿主的真实委派能力，不能靠角色文件或编造名字声称已派发；权限边界继续按 AGENTS。

## 逐项核对

- 基线是否存在、范围是否诚实，原始目标和必须保留的能力是否逐条进入 REQ、AC、任务及 Release；未实现事项是否仍在范围内。
- 每项任务是否有可观察结果、局部写入范围、真实负责人及合法依赖；拆分是否源于不同结果、风险或验收，能否独立判断，不是命令清单。
- 准备、真实红灯、实现、验证和 Design 回写的顺序是否可执行；红灯是否针对同一行为，验收是否覆盖所有 AC 的适用真实层级。
- 跨任务或跨 Plan 的接口、共享写入和交接是否明确；缺依赖、数据授权或关键产品决定是否被空的问题列表掩盖。
- 文档与实现的矛盾是否按所属规则分类；是否悄悄放宽规格、排除失败或修改真源让实现过关。
- 技能与职责是否匹配，方法应用是否体现在产出；读过名字或引用过技能不能证明方法已应用。
- 兼容、采用边界、回退和失败恢复是否可检查；未执行的测试、模拟数据库或局部检查是否被说成完整验收。

判断基于真实对象，不能从标签齐全、任务数量或自评分数推断语义完整。不要求为了写计划重新调查无关模块。

## 输出与记录

先按影响列具体发现，指出文件或段落、遗漏会导致什么结果、需要如何修正。结论使用 PASS、ISSUES 或 BLOCKED。PASS 表示未发现阻断；ISSUES 表示对象需修正；BLOCKED 表示缺少关键输入或独立审查条件。保留非阻断风险及其边界，不用赞美替代判断。

PASS 对应记录中的 approved；ISSUES 和 BLOCKED 对应 needs-revision，并保留具体未解决发现。没有实际独立角色时只在原 Plan 保留阻塞原因，不能编造 reviewer 来补记录。

按 context 给出的字段准备真实来源记录，由协调者执行 `pnpm ignite review record <ID> draft --file <review.json>` 写入原 Plan。未解决阻断发现不能批准。记录只检查声明独立性，不认证任意宿主身份；协调者核对实际派发或独立读者来源。修正受审语义后重新取得 context 并审查，不能沿用旧对象结论。
