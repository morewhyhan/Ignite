import { Calendar } from 'lucide-react'
import type { TaskItem } from '../hooks/use-tasks'
import type { TaskFilter } from './task-filters'
import { TaskRow } from './task-row'

interface TaskListProps {
  tasks: TaskItem[]
  filter: TaskFilter
  isUpdating: boolean
  isDeleting: boolean
  onToggle: (task: TaskItem) => void
  onEdit: (task: TaskItem) => void
  onDelete: (task: TaskItem) => void
}

const emptyMessages: Record<TaskFilter, string> = {
  all: '还没有任务',
  pending: '没有待办任务',
  completed: '没有已完成任务',
}

export function TaskList({
  tasks,
  filter,
  isUpdating,
  isDeleting,
  onToggle,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-32 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/50">
          <Calendar aria-hidden="true" className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <p className="mb-2 text-base text-muted-foreground">{emptyMessages[filter]}</p>
        {filter === 'all' && (
          <p className="text-sm text-muted-foreground/60">点击右上角按钮创建第一个任务</p>
        )}
      </div>
    )
  }

  const pendingTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <>
      {pendingTasks.length > 0 && (
        <section className="space-y-6" aria-labelledby="pending-tasks-heading">
          <h2
            id="pending-tasks-heading"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            待办
          </h2>
          <ul className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </section>
      )}

      {completedTasks.length > 0 && (
        <section className="space-y-6" aria-labelledby="completed-tasks-heading">
          <h2
            id="completed-tasks-heading"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            已完成
          </h2>
          <ul className="space-y-3">
            {completedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
