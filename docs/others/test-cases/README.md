# 测试用例规范

这里负责验收路径的编写、维护与可执行映射；真正的测试位于 `tests/`。检查范围、断言尺度和证明层级由 [测试标准](../../standards/testing.md) 定义，本页不另定门禁。

## 固定维护方法

先读本节必需条款与技能正文。在项目使用契约指定的 WSL/Linux Node，运行 `node scripts/ignite.mjs skill read --for docs/others/test-cases/README.md --list`；这个入口无需安装依赖；每次调用只读一个目录的清单，首次清单输出容量至少 8192 tokens。清单只返回固定职责和必需方法，不代表正文已经读取。按各项 `tool_options.max_output_tokens` 设置宿主及外层封装的输出上限，再逐份运行 `node scripts/ignite.mjs skill read <name>`，每次工具调用只读取一份正文；也可逐份读取真源文件，截断时分段补齐。

涉及本类文档时，先读取以下必需方法：[tdd](../../../.ai/pstack/skills/tdd/SKILL.md)、[principle-test-behavior-not-implementation](../../../.ai/pstack/skills/principle-test-behavior-not-implementation/SKILL.md)。必须按下面的顺序处理，不能由 AI 自行省略；未触及本类文档时不强制执行。

1. 从用户行为和 Feature AC 写明要证明的结果、前提、失败边界与必要层级；测试意图与实际可执行检查建立对应关系。
2. 维护受影响的案例，区分程序行为、规则内容复核和真实模型效果；不把技能链接可用当成 AI 已正确调用。
3. 运行结果写入原生证据，案例只保存验收意图与尺度，不复制 Plan tasks、Release scope 或运行状态。

### 条件方法

新增实际应用验收入口时才使用 [create-verification-skill](../../../.ai/pstack/skills/create-verification-skill/SKILL.md)；修改现有入口时使用 [maintain-verification-skill](../../../.ai/pstack/skills/maintain-verification-skill/SKILL.md)。技能方法移植本身不启动模型评估；明确评估模型效果时才按既定案例固定输入和判定。

## 写到可以复验

从 Feature 的 AC 写使用者、前置条件、动作、可观察结果及相关失败或权限边界。列出对应 REQ/AC、所需层级、测试文件与用例名，说明断言能发现哪种错误；不用“功能正常”或测试数量代替行为。

UI 先明确用户路径与原型依据；没有外部原型时引用当前设计系统。再探索真实入口、输入、提交，以及适用的 loading/error/empty/success 和结果恢复状态。探索记录说明版本、视口、步骤和实际结果；稳定路径固化为 E2E，临时点击不能替代正式验收。视觉、动画或 Canvas 等 DOM 难以证明的结果补截图或人工观察，并引用到当前 Plan。

需求或接口改变时，在原用例更新受影响的路径和自动化映射，保留仍适用的权限与失败断言；未实现、跳过或缺外部条件的路径明确未完成。测试意图、执行结果与当前 Design 各自维护，不手写第二份通过状态。

## 当前用例

- [`auth.md`](./auth.md)：认证、会话和路由守卫
- [`tasks.md`](./tasks.md)：任务 API 和用户流程
- [`product.md`](./product.md)：模板采用、AI 执行、证据和发布状态
- [`execution.md`](./execution.md)：脚手架、命令入口、历史清理和失败恢复
- [`ai-execution-trust.md`](./ai-execution-trust.md)：验收分层、范围追踪、响应式 Web 与 Release 证据
- [`execution-focus.md`](./execution-focus.md)：主要问题、尺度、纠偏、沟通与规则维护的行为评估

## 自动化映射

| 用例                                  | 实现位置                      |
| ------------------------------------- | ----------------------------- |
| 任务 API 鉴权、校验、跨用户隔离、CRUD | `tests/api/tasks.test.ts`     |
| 环境和 Better Auth schema 规则        | `tests/contracts/`            |
| 注册、登录、登出和路由守卫            | `tests/e2e/auth.spec.ts`      |
| 任务页面完整流程                      | `tests/e2e/tasks.spec.ts`     |
| Migration 干净部署与 drift            | `scripts/test-migrations.mjs` |
