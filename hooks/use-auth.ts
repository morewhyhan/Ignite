import { signIn, signUp, signOut, useSession } from '@/lib/auth-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useAuthSession() {
  return useSession()
}

export function useSignIn() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await signIn.email({ email, password })
      if (response.error) {
        throw new Error(response.error.message || '登录失败')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] })
      toast.success('登录成功')
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast.error(error.message || '登录失败，请检查邮箱和密码')
    },
  })
}

export function useSignUp() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name?: string }) => {
      const signUpData: any = { email, password }
      if (name) {
        signUpData.name = name
      }
      const response = await signUp.email(signUpData)
      if (response.error) {
        throw new Error(response.error.message || '注册失败')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] })
      toast.success('注册成功')
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast.error(error.message || '注册失败，请稍后再试')
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const response = await signOut()
      if (response.error) {
        throw new Error(response.error.message || '登出失败')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] })
      toast.success('已登出')
      router.push('/')
    },
    onError: (error: Error) => {
      toast.error(error.message || '登出失败')
    },
  })
}
