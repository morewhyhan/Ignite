import { Check, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TaskItem } from '../hooks/use-tasks'

interface TaskRowProps {
  task: TaskItem
  isUpdating: boolean
  isDeleting: boolean
  onToggle: (task: TaskItem) => void
  onEdit: (task: TaskItem) => void
  onDelete: (task: TaskItem) => void
}

export function TaskRow({
  task,
  isUpdating,
  isDeleting,
  onToggle,
  onEdit,
  onDelete,
}: TaskRowProps) {
  return (
    <li
      className={cn(
        'group flex items-center gap-4 rounded-2xl p-4 transition-all',
        task.completed ? 'bg-muted/30' : 'border border-border/20 bg-card hover:border-border/40',
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`${task.completed ? '恢复' : '完成'}任务：${task.title}`}
        aria-pressed={task.completed}
        onClick={() => onToggle(task)}
        disabled={isUpdating}
        className={cn(
          'h-6 w-6 flex-shrink-0 rounded-xl border-2 p-0',
          task.completed
            ? 'border-primary bg-primary/10 hover:bg-primary/20'
            : 'border-border/40 hover:border-primary/60 hover:bg-primary/5',
        )}
      >
        <Check
          aria-hidden="true"
          className={cn(
            'h-3.5 w-3.5 text-primary',
            !task.completed && 'opacity-0 transition-opacity group-hover:opacity-40',
          )}
        />
      </Button>

      <span
        className={cn('flex-1 text-base', task.completed && 'text-muted-foreground line-through')}
      >
        {task.title}
      </span>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`编辑任务：${task.title}`}
          onClick={() => onEdit(task)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`删除任务：${task.title}`}
          onClick={() => onDelete(task)}
          disabled={isDeleting}
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </li>
  )
}
