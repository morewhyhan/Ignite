export type TaskFilter = 'all' | 'pending' | 'completed'

interface TaskFiltersProps {
  filter: TaskFilter
  totalCount: number
  pendingCount: number
  completedCount: number
  onFilterChange: (filter: TaskFilter) => void
}

const filters: Array<{ value: TaskFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待办' },
  { value: 'completed', label: '已完成' },
]

export function TaskFilters({
  filter,
  totalCount,
  pendingCount,
  completedCount,
  onFilterChange,
}: TaskFiltersProps) {
  const counts: Record<TaskFilter, number> = {
    all: totalCount,
    pending: pendingCount,
    completed: completedCount,
  }

  return (
    <div className="flex gap-2" role="group" aria-label="筛选任务">
      {filters.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={filter === item.value}
          onClick={() => onFilterChange(item.value)}
          className={`
            px-4 py-2 text-sm font-medium rounded-xl transition-all
            ${
              filter === item.value
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }
          `}
        >
          {item.label}
          <span className="ml-2 opacity-60">{counts[item.value]}</span>
        </button>
      ))}
    </div>
  )
}
