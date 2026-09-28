'use client'

import { useState, type FormEvent } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/modules/auth'
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
  type TaskItem,
} from '../hooks/use-tasks'
import { TaskEditorDialog } from './task-editor-dialog'
import { TaskFilters, type TaskFilter } from './task-filters'
import { TaskList } from './task-list'

interface TaskEditorState {
  taskId: string | null
  title: string
}

export function TasksScreen() {
  const router = useRouter()
  const [editor, setEditor] = useState<TaskEditorState | null>(null)
  const [filter, setFilter] = useState<TaskFilter>('all')
  const { data: session, isPending: sessionLoading } = useAuthSession()
  const tasksQuery = useTasks(session?.user?.id)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const tasks = tasksQuery.data ?? []
  const pendingCount = tasks.filter((task) => !task.completed).length
  const completedCount = tasks.length - pendingCount
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const openCreateDialog = () => {
    setEditor({ taskId: null, title: '' })
  }

  const openEditDialog = (task: TaskItem) => {
    setEditor({ taskId: task.id, title: task.title })
  }

  const closeEditor = () => {
    setEditor(null)
  }

  const handleEditorSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editor) return

    const title = editor.title.trim()
    if (!title) return

    if (editor.taskId) {
      updateTask.mutate(
        { id: editor.taskId, title },
        {
          onSuccess: () => {
            toast.success('任务更新成功')
            closeEditor()
          },
          onError: (error) => toast.error(`更新失败：${error.message}`),
        },
      )
    } else {
      createTask.mutate(
        { title },
        {
          onSuccess: () => {
            toast.success('任务创建成功')
            closeEditor()
          },
          onError: (error) => toast.error(`创建失败：${error.message}`),
        },
      )
    }
  }

  if (sessionLoading || (Boolean(session?.user) && tasksQuery.isLoading)) {
    return (
      <div className="min-h-screen py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-14">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-7 text-center shadow-sm sm:p-9">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Calendar aria-hidden="true" className="h-5 w-5 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">请先登录</h2>
          <p className="mb-6 text-sm text-muted-foreground">登录后可以管理你的任务清单</p>
          <Button type="button" onClick={() => router.push('/')}>
            返回首页登录
          </Button>
        </div>
      </div>
    )
  }

  if (tasksQuery.isError) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-14">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-7 text-center shadow-sm sm:p-9">
          <h2 className="mb-2 text-xl font-semibold">任务加载失败</h2>
          <p className="mb-6 text-sm text-muted-foreground">{tasksQuery.error.message}</p>
          <Button type="button" onClick={() => void tasksQuery.refetch()}>
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 py-9 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="space-y-8 sm:space-y-10">
          <header className="flex flex-col items-start justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:gap-8">
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-primary">我的事项</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">任务清单</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {pendingCount} 项待办 · {completedCount} 项已完成
              </p>
            </div>
            <Button type="button" onClick={openCreateDialog} disabled={createTask.isPending}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              新建任务
            </Button>
          </header>

          <TaskFilters
            filter={filter}
            totalCount={tasks.length}
            pendingCount={pendingCount}
            completedCount={completedCount}
            onFilterChange={setFilter}
          />

          <TaskList
            tasks={visibleTasks}
            filter={filter}
            isUpdating={updateTask.isPending}
            isDeleting={deleteTask.isPending}
            onToggle={(task) =>
              updateTask.mutate(
                { id: task.id, completed: !task.completed },
                {
                  onSuccess: () => toast.success('任务更新成功'),
                  onError: (error) => toast.error(`更新失败：${error.message}`),
                },
              )
            }
            onEdit={openEditDialog}
            onDelete={(task) =>
              deleteTask.mutate(task.id, {
                onSuccess: () => toast.success('任务删除成功'),
                onError: (error) => toast.error(`删除失败：${error.message}`),
              })
            }
          />
        </div>
      </div>

      <TaskEditorDialog
        open={editor !== null}
        isEditing={Boolean(editor?.taskId)}
        title={editor?.title ?? ''}
        isPending={createTask.isPending || updateTask.isPending}
        onOpenChange={(open) => {
          if (!open) closeEditor()
        }}
        onTitleChange={(title) =>
          setEditor((current) => (current ? { ...current, title } : current))
        }
        onSubmit={handleEditorSubmit}
      />
    </div>
  )
}
