# React Query 状态管理入门

> 了解如何在前端管理服务器数据

## 什么是 React Query？

React Query（也叫 TanStack Query）是一个数据管理库，专门用来处理从服务器获取的数据。

**为什么需要 React Query？**

不用 React Query 时，你需要手动管理：
- 数据加载状态
- 错误处理
- 缓存管理
- 重新获取数据
- 乐观更新

用了 React Query 后，这些都可以自动处理。

**核心价值**：
- **自动缓存** - 获取过的数据会缓存，减少重复请求
- **自动更新** - 数据过期时自动重新获取
- **简化状态管理** - 不用写一堆 useState 和 useEffect
- **类型安全** - 配合 Hono 实现完全类型推导

---

## Hook 在哪里？

```
hooks/
├── use-tasks.ts       # 任务相关 Hook
├── use-auth.ts        # 认证相关 Hook
└── (其他功能 Hook)
```

**工作流程**：
1. 在 Hook 中定义 API 调用
2. 在页面中调用 Hook
3. React Query 自动管理数据状态

---

## 核心概念

### useQuery vs useMutation

| useQuery | useMutation |
|----------|-------------|
| 获取数据（GET） | 修改数据（POST/PUT/DELETE） |
| 自动重新获取 | 手动触发 |
| 只读操作 | 写操作 |

**简单理解**：
- `useQuery` - 查（我要看数据）
- `useMutation` - 改（我要改数据）

---

## useQuery - 获取数据

### 基础用法

```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['tasks'],
  queryFn: async () => {
    const res = await fetch('/api/tasks')
    return res.json()
  }
})
```

**返回值说明**：
- `data` - 服务器返回的数据
- `isLoading` - 是否正在加载（true 时显示 loading）
- `error` - 错误信息（有错误时处理）
- `isError` - 是否有错误
- `isPending` - 是否正在进行（加载 + 重新获取）

### queryKey 的作用

```typescript
useQuery({
  queryKey: ['tasks'],  // 这个 key 很重要！
  queryFn: () => fetchTasks()
})
```

**为什么需要 queryKey？**
- 作为缓存的唯一标识
- 用于手动刷新缓存
- 用于依赖查询

**当 queryKey 变化时，自动重新获取**：

```typescript
const [taskId, setTaskId] = useState('1')

const { data } = useQuery({
  queryKey: ['task', taskId],  // taskId 变化时重新获取
  queryFn: () => fetchTask(taskId)
})

setTaskId('2')  // 自动重新获取 task/2 的数据
```

---

## useMutation - 修改数据

### 基础用法

```typescript
import { useMutation } from '@tanstack/react-query'

const createTask = useMutation({
  mutationFn: async (newTask) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(newTask)
    })
    return res.json()
  },
  onSuccess: () => {
    console.log('创建成功！')
  },
  onError: (error) => {
    console.error('创建失败：', error.message)
  }
})

// 调用
createTask.mutate({ title: '新任务' })
```

**状态说明**：
- `isPending` - 是否正在执行
- `isSuccess` - 是否成功
- `isError` - 是否失败

### 为什么需要 onSuccess/onError？

```typescript
onSuccess: () => {
  toast.success('创建成功')      // 显示提示
  queryClient.invalidateQueries({ queryKey: ['tasks'] })  // 刷新列表
}
```

**作用**：
- `onSuccess` - 成功后做什么（提示、刷新数据）
- `onError` - 失败后做什么（显示错误）
- `onSettled` - 无论成功失败都执行

---

## 项目中的完整实现

### 步骤 1：定义 API 调用

```typescript
import { client } from '@/lib/api-client'
import { InferRequestType, InferResponseType } from 'hono/client'

// 定义 API 调用
const $get = client.api.tasks.$get
const $post = client.api.tasks.$post
const $put = client.api.tasks[':id'].$put
const $delete = client.api.tasks[':id'].$delete

// 推导类型
type GetResponseType = InferResponseType<typeof $get>
type PostRequestType = InferRequestType<typeof $post>['json']
type PostResponseType = InferResponseType<typeof $post>
```

**为什么这样写？**
- `client.api.tasks.$get` - 类型安全的 API 调用
- `InferResponseType` - 自动推导返回类型
- `InferRequestType` - 自动推导请求类型
- API 改变时，类型自动更新

### 步骤 2：编写 useQuery Hook

```typescript
export function useTasks() {
  return useQuery<GetResponseType, Error>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await $get()
      return res.json()
    },
  })
}
```

**为什么这样写？**
- `queryKey: ['tasks']` - 缓存标识
- `queryFn` - 如何获取数据
- `<GetResponseType, Error>` - 类型定义
- `res.json()` - 解析响应

### 步骤 3：编写 useMutation Hook

```typescript
export function useCreateTask() {
  return useMutation<PostResponseType, Error, PostRequestType>({
    mutationFn: async (json) => {
      const res = await $post({ json })
      return res.json()
    },
    onSuccess: () => {
      toast.success('任务创建成功')
    },
    onError: (error) => {
      toast.error('创建失败：' + error.message)
    },
  })
}
```

**为什么需要泛型？**
- `PostResponseType` - 返回数据类型
- `Error` - 错误类型
- `PostRequestType` - 请求参数类型
- 完全类型安全，编辑器会自动补全

---

## 在页面中使用

### 完整示例

```typescript
'use client'

import { useState } from 'react'
import { useTasks, useCreateTask } from '@/hooks/use-tasks'

export default function TasksPage() {
  const [title, setTitle] = useState('')

  // 获取任务列表
  const { data, isLoading } = useTasks()

  // 创建任务
  const createTask = useCreateTask()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    createTask.mutate(
      { title },
      {
        onSuccess: () => {
          setTitle('')  // 成功后清空输入框
        }
      }
    )
  }

  if (isLoading) return <div>加载中...</div>

  const tasks = data?.data || []

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={createTask.isPending}
        />
        <button disabled={createTask.isPending}>
          {createTask.isPending ? '创建中...' : '创建'}
        </button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 缓存管理

### 使缓存失效

修改数据后，需要刷新列表：

```typescript
const queryClient = useQueryClient()

export function useCreateTask() {
  return useMutation({
    mutationFn: (data) => createTaskAPI(data),
    onSuccess: () => {
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}
```

**为什么需要刷新？**
- 创建任务后，列表需要显示新任务
- `invalidateQueries` 让 React Query 重新获取数据

### 直接更新缓存（乐观更新）

```typescript
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => deleteTaskAPI(id),
    onMutate: async (id) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // 保存旧数据
      const previousTasks = queryClient.getQueryData(['tasks'])

      // 立即更新界面
      queryClient.setQueryData(['tasks'], (old) => ({
        ...old,
        data: old.data.filter((t) => t.id !== id)
      }))

      return { previousTasks }
    },
    onError: (err, id, context) => {
      // 失败时恢复
      queryClient.setQueryData(['tasks'], context.previousTasks)
    },
    onSettled: () => {
      // 无论成功失败都重新获取
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}
```

**为什么这样做？**
- 用户点击删除后立即看到效果（体验好）
- 如果删除失败，自动恢复数据
- 最终以服务器数据为准

---

## 依赖查询

一个查询依赖另一个查询的结果：

```typescript
// 先获取用户
const { data: user } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser
})

// 再根据用户 ID 获取任务
const { data: tasks } = useQuery({
  queryKey: ['tasks', user?.id],
  queryFn: () => fetchTasks(user.id),
  enabled: !!user  // 只有 user 存在时才执行
})
```

**为什么需要 enabled？**
- 防止在没有 user 时执行查询
- `enabled: false` 时，查询不会执行
- `enabled: true` 时，查询开始执行

---

## 常见问题

**Q: useQuery 和 useState 的区别？**

| useQuery | useState |
|----------|----------|
| 用于服务器数据 | 用于本地状态 |
| 自动缓存和更新 | 需要手动管理 |
| 自动重新获取 | 不会自动获取 |
| 有加载和错误状态 | 需要自己实现 |

**Q: 什么时候用 useQuery，什么时候用 useMutation？**
- `useQuery` - 获取数据（GET 请求）
- `useMutation` - 修改数据（POST、PUT、DELETE 请求）

**Q: 为什么需要 queryKey？**
- 作为缓存的唯一标识
- 用于手动刷新缓存
- 用于依赖查询

**Q: 如何显示加载状态？**
```typescript
const { data, isLoading } = useQuery({ ... })

if (isLoading) return <div>加载中...</div>
```

**Q: 如何处理错误？**
```typescript
const { data, error } = useQuery({ ... })

if (error) return <div>错误：{error.message}</div>
```

---

## 总结

**React Query 的核心价值**：
1. **自动缓存** - 减少重复请求，提升性能
2. **自动更新** - 数据过期时自动重新获取
3. **简化代码** - 不用手写 useState 和 useEffect
4. **类型安全** - 配合 Hono 完全类型推导

**记住这几点**：
- `useQuery` - 获取数据
- `useMutation` - 修改数据
- `queryKey` - 缓存标识，变化时重新获取
- `invalidateQueries` - 修改数据后刷新缓存
- 类型推导 - `InferRequestType` 和 `InferResponseType`
