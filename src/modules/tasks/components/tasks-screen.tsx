'use client'

import { useState, type FormEvent } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
      updateTask.mutate({ id: editor.taskId, title }, { onSuccess: closeEditor })
    } else {
      createTask.mutate({ title }, { onSuccess: closeEditor })
    }
  }

  if (sessionLoading || (Boolean(session?.user) && tasksQuery.isLoading)) {
    return (
      <div className="min-h-screen py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/50">
            <Calendar aria-hidden="true" className="h-10 w-10 text-muted-foreground/40" />
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
      <div className="flex min-h-screen items-center justify-center py-20">
        <div className="max-w-sm px-6 text-center">
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
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="space-y-16">
          <header className="flex items-end justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-semibold tracking-tight">任务清单</h1>
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
            onToggle={(task) => updateTask.mutate({ id: task.id, completed: !task.completed })}
            onEdit={openEditDialog}
            onDelete={(task) => deleteTask.mutate(task.id)}
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
