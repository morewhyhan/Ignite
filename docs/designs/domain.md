# 当前领域模型

Ignite 当前提供一个认证域和一个任务域。认证域由 Better Auth 的四张基础表组成，
任务域由用户和任务关系组成。

```text
user
├─ session[]
├─ account[]
└─ task[]

verification  （Better Auth 兼容性预留的临时凭证表；模板默认不发送邮件）
```

## 领域不变量

- `user.email` 唯一。
- `task.userId` 必须指向现有用户。
- 用户只能读取、更新和删除自己的任务。
- `task.title` 创建时非空，长度 1–200 个字符。
- 任务更新至少包含 `title` 或 `completed` 其中一个字段。
- 删除用户时级联删除其 session、account 和 task。
