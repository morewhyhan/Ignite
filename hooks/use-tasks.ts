import { client } from '@/lib/api-client'
import { InferRequestType, InferResponseType } from 'hono/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

const $get = client.api.tasks.$get
type GetResponseType = InferResponseType<typeof $get>

const $post = client.api.tasks.$post
type PostRequestType = InferRequestType<typeof $post>['json']
type PostResponseType = InferResponseType<typeof $post>

const $put = client.api.tasks[':id'].$put
type PutRequestType = InferRequestType<typeof $put>['json'] & { id: string }
type PutResponseType = InferResponseType<typeof $put>

const $delete = client.api.tasks[':id'].$delete
type DeleteResponseType = InferResponseType<typeof $delete>

export function useTasks() {
  return useQuery<GetResponseType, Error>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await $get()
      return res.json()
    },
  })
}

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

export function useUpdateTask() {
  return useMutation<PutResponseType, Error, PutRequestType>({
    mutationFn: async ({ id, ...json }) => {
      const res = await $put({ param: { id }, json })
      return res.json()
    },
    onSuccess: () => {
      toast.success('任务更新成功')
    },
    onError: (error) => {
      toast.error('更新失败：' + error.message)
    },
  })
}

export function useDeleteTask() {
  return useMutation<DeleteResponseType, Error, string>({
    mutationFn: async (id) => {
      const res = await $delete({ param: { id } })
      return res.json()
    },
    onSuccess: () => {
      toast.success('任务删除成功')
    },
    onError: (error) => {
      toast.error('删除失败：' + error.message)
    },
  })
}
