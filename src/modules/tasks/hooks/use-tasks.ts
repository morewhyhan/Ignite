import { client, readApiJson } from '@/lib/api-client'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const $get = client.api.tasks.$get
type GetResponseType = InferResponseType<typeof $get, 200>['data']
export type TaskItem = GetResponseType[number]

const $post = client.api.tasks.$post
type PostRequestType = InferRequestType<typeof $post>['json']
type PostResponseType = InferResponseType<typeof $post, 200>['data']

const $put = client.api.tasks[':id'].$put
type PutRequestType = InferRequestType<typeof $put>['json'] & { id: string }
type PutResponseType = InferResponseType<typeof $put, 200>['data']

const $delete = client.api.tasks[':id'].$delete
type DeleteResponseType = InferResponseType<typeof $delete, 200>['data']

export const taskKeys = {
  all: ['tasks'] as const,
  list: (userId: string) => ['tasks', userId] as const,
}

export function useTasks(userId?: string) {
  return useQuery<GetResponseType, Error>({
    queryKey: taskKeys.list(userId ?? 'anonymous'),
    enabled: Boolean(userId),
    queryFn: async () => {
      const res = await $get()
      const payload = await readApiJson<{ data: GetResponseType }>(res)
      return payload.data
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation<PostResponseType, Error, PostRequestType>({
    mutationFn: async (json) => {
      const res = await $post({ json })
      const payload = await readApiJson<{ data: PostResponseType }>(res)
      return payload.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('任务创建成功')
    },
    onError: (error) => {
      toast.error('创建失败：' + error.message)
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation<PutResponseType, Error, PutRequestType>({
    mutationFn: async ({ id, ...json }) => {
      const res = await $put({ param: { id }, json })
      const payload = await readApiJson<{ data: PutResponseType }>(res)
      return payload.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('任务更新成功')
    },
    onError: (error) => {
      toast.error('更新失败：' + error.message)
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation<DeleteResponseType, Error, string>({
    mutationFn: async (id) => {
      const res = await $delete({ param: { id } })
      const payload = await readApiJson<{ data: DeleteResponseType }>(res)
      return payload.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('任务删除成功')
    },
    onError: (error) => {
      toast.error('删除失败：' + error.message)
    },
  })
}
