import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface TaskEditorDialogProps {
  open: boolean
  isEditing: boolean
  title: string
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onTitleChange: (title: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function TaskEditorDialog({
  open,
  isEditing,
  title,
  isPending,
  onOpenChange,
  onTitleChange,
  onSubmit,
}: TaskEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border-0 bg-card p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑任务' : '新建任务'}</DialogTitle>
          <DialogDescription>{isEditing ? '修改任务内容' : '输入任务名称'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-8">
          <div>
            <label htmlFor="task-title" className="sr-only">
              任务名称
            </label>
            <Input
              id="task-title"
              type="text"
              placeholder={isEditing ? '任务名称' : '要做什么...'}
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              autoFocus
              className="h-auto rounded-2xl border-0 bg-muted/50 px-5 py-4 text-base focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                取消
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isEditing ? '保存修改' : '创建任务'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
