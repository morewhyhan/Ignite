# 目标树（开发前的必读根源）

> 这份文件不是项目说明书，也不解释系统全貌。它只声明：目标是什么、由哪几个领域承担、每个领域必须成立哪些规则、每条规则怎么验收。
> 每次开工前先读它；项目现状与实现细节从 [文档入口](docs/README.md) 和 [设计事实](docs/designs/) 进入。
> 写法与约束见 [目标树标准](docs/standards/goal-tree.md)。

## 目标

> 让一个人从一个想法开始，直接用一套能跑、能验、能继续改的代码做出自己的应用。

允许模糊。精确性由下面的领域与规则承担。

## 领域

| 领域 | 管什么                     | 不管什么   | 类型   | 模块                                             |
| ---- | -------------------------- | ---------- | ------ | ------------------------------------------------ |
| 认证 | 注册、登录、会话           | 业务数据   | 通用   | `src/modules/auth`                               |
| 任务 | 任务清单（参考业务）       | 账号、主题 | 支撑   | `src/modules/tasks`                              |
| 外壳 | 落地页、工作台、设置、主题 | 业务规则   | 非领域 | `src/modules/{landing,dashboard,settings,theme}` |

细节：[认证规格](docs/features/auth.md)、[任务规格](docs/features/tasks.md)、[领域模型](docs/designs/domain.md)。

## 规则与验收

### 认证

**REQ-AUTH-001 只有本人能访问自己的数据**

- AC-AUTH-001 未登录访问受保护接口，返回 401 → [细节](docs/features/auth.md)
- AC-AUTH-002 访问他人资源，返回 404 → [设计](docs/designs/auth.md)
- 验证：`tests/e2e/auth.spec.ts`

**REQ-AUTH-002 会话过期后必须重新登录**

- AC-AUTH-003 过期会话访问接口，返回 401 → [细节](docs/features/auth.md)
- 验证：`tests/e2e/auth.spec.ts`

### 任务

**REQ-TASK-001 任务只属于创建者**

- AC-TASK-001 看不到他人的任务 → [细节](docs/features/tasks.md)
- AC-TASK-002 删除他人任务返回 404 → [细节](docs/features/tasks.md)
- 验证：`tests/e2e/tasks.spec.ts`

**REQ-TASK-002 任务状态只能按 待办 → 进行中 → 完成 流转**

- AC-TASK-003 完成的任务不能再改回进行中 → [细节](docs/features/tasks.md)
- 验证：`tests/contracts/tasks.test.ts`

### 外壳

外壳不是领域，只写一句约束：

- 工作台只组合认证、任务与设置，不自己承载业务规则 → [设计](docs/designs/domain.md)

## 术语

| 编号      | 术语 | 定义                             |
| --------- | ---- | -------------------------------- |
| TERM-USER | 用户 | 有账号的人，数据归属的唯一依据   |
| TERM-TASK | 任务 | 用户创建的一条待办，有状态与归属 |

## 关系

```text
任务  依赖  认证（任务归属用户）
外壳  组合  认证、任务
```

## 当前不覆盖

```
1. 团队/多租户
2. 消息通知
3. 文件上传
4. 审计日志
```

补进来时新增 REQ，不改上面已有的规则。

## 完成判定

```
某条 REQ 完成 = 它下面所有 AC 有通过记录 + 演示动作能跑一遍
整体完成     = 三个领域的必要条件满足（不宣称绝对做完）
```
