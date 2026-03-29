'use client'

import { useState } from 'react'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import { Plus, Check, Pencil, Trash2, Calendar } from 'lucide-react'
import { useAuthSession } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

type Filter = 'all' | 'pending' | 'completed'

export default function TasksPage() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const { data: session, isPending: sessionLoading } = useAuthSession()

  const { data: tasksData, isLoading: tasksLoading } = useTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const openCreateModal = () => {
    setEditingId(null)
    setTaskTitle('')
    setModalOpen(true)
  }

  const openEditModal = (id: string, title: string) => {
    setEditingId(id)
    setTaskTitle(title)
    setModalOpen(true)
  }

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    if (editingId) {
      updateTask.mutate({ id: editingId, title: taskTitle })
    } else {
      createTask.mutate({ title: taskTitle })
    }

    setTaskTitle('')
    setModalOpen(false)
  }

  const tasks = tasksData?.data || []
  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const filteredPending = filteredTasks.filter(t => !t.completed)
  const filteredCompleted = filteredTasks.filter(t => t.completed)

  // Show loading state while checking session
  if (sessionLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-muted/50 mb-6">
            <Calendar className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-xl font-semibold mb-2">请先登录</h2>
          <p className="text-sm text-muted-foreground mb-6">登录后可以管理你的任务清单</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
          >
            返回首页登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="space-y-16">
          {/* 标题区域 */}
          <div className="flex items-end justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-semibold tracking-tight">
                任务清单
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {pendingTasks.length} 项待办 · {completedTasks.length} 项已完成
              </p>
            </div>
            <button
              onClick={openCreateModal}
              disabled={createTask.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              新建任务
            </button>
          </div>

          {/* 筛选选项卡 */}
          <div className="flex gap-2">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-xl transition-all
                  ${filter === f
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                {f === 'all' ? '全部' : f === 'pending' ? '待办' : '已完成'}
                <span className="ml-2 opacity-60">
                  {f === 'all' ? tasks.length : f === 'pending' ? pendingTasks.length : completedTasks.length}
                </span>
              </button>
            ))}
          </div>

          {/* 待办任务 */}
          {filteredPending.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                待办
              </h2>
              <div className="space-y-3">
                {filteredPending.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/20 hover:border-border/40 transition-all"
                  >
                    <button
                      onClick={() => updateTask.mutate({ id: task.id, completed: !task.completed })}
                      disabled={updateTask.isPending}
                      className="flex-shrink-0 w-6 h-6 border-2 border-border/40 rounded-xl flex items-center justify-center hover:border-primary/60 hover:bg-primary/5 transition-all disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-40 transition-opacity" />
                    </button>

                    <span className="flex-1 text-base">
                      {task.title}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => openEditModal(task.id, task.title)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTask.mutate(task.id)}
                        disabled={deleteTask.isPending}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 已完成任务 */}
          {filteredCompleted.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                已完成
              </h2>
              <div className="space-y-3">
                {filteredCompleted.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-4 p-4 bg-muted/30 rounded-2xl transition-all"
                  >
                    <button
                      onClick={() => updateTask.mutate({ id: task.id, completed: !task.completed })}
                      disabled={updateTask.isPending}
                      className="flex-shrink-0 w-6 h-6 border-2 border-primary bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-all disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </button>

                    <span className="flex-1 text-base text-muted-foreground line-through">
                      {task.title}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => openEditModal(task.id, task.title)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTask.mutate(task.id)}
                        disabled={deleteTask.isPending}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {filteredTasks.length === 0 && (
            <div className="py-32 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-muted/50 mb-6">
                <Calendar className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-base text-muted-foreground mb-2">
                {filter === 'all' ? '还没有任务' : filter === 'pending' ? '没有待办任务' : '没有已完成任务'}
              </p>
              <p className="text-sm text-muted-foreground/60">
                {filter === 'all' && '点击右上角按钮创建第一个任务'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 弹窗 */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={() => setModalOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
          <div
            className="relative bg-card rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-2">
              {editingId ? '编辑任务' : '新建任务'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {editingId ? '修改任务内容' : '输入任务名称'}
            </p>

            <form onSubmit={handleModalSubmit}>
              <input
                type="text"
                placeholder={editingId ? '任务名称' : '要做什么...'}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                autoFocus
                className="w-full px-5 py-4 bg-muted/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/30 transition-all mb-8 text-base"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={createTask.isPending || updateTask.isPending}
                  className="px-6 py-3 text-sm bg-primary text-white rounded-2xl hover:opacity-90 transition-opacity font-medium shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {editingId ? '保存修改' : '创建任务'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
