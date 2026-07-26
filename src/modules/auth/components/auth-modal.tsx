'use client'

import { useState, type FormEvent } from 'react'
import { Lock, Mail, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { authConfig } from '@/config/auth'
import { siteConfig } from '@/config/site'
import { toast } from 'sonner'
import { useSignIn, useSignUp } from '../hooks/use-auth'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const signIn = useSignIn()
  const signUp = useSignUp()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (mode === 'register' && password !== confirmPassword) {
      toast.error('密码不匹配')
      return
    }

    if (mode === 'login') {
      signIn.mutate({ email, password })
    } else {
      signUp.mutate({ email, password, name })
    }
  }

  const isLoading = signIn.isPending || signUp.isPending

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-[2rem] border-0 bg-card p-0 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
        />

        <div aria-hidden="true" className="relative overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
        </div>

        <div className="relative px-10 py-8">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Sparkles aria-hidden="true" className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold">{siteConfig.name}</span>
          </div>

          <div
            className="mb-6 flex rounded-xl bg-muted/60 p-1 backdrop-blur-sm"
            role="group"
            aria-label="认证方式"
          >
            <button
              type="button"
              aria-pressed={mode === 'login'}
              onClick={() => switchMode('login')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              aria-pressed={mode === 'register'}
              onClick={() => switchMode('register')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              注册
            </button>
          </div>

          <div>
            <DialogHeader className="mb-6 text-center sm:text-center">
              <DialogTitle className="text-xl">
                {mode === 'login' ? '欢迎回来' : '创建账户'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'login' ? '登录到你的账户继续使用' : `开始你的 ${siteConfig.name} 之旅`}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-name"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
                    用户名
                  </label>
                  <Input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    placeholder="你的用户名"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="h-auto rounded-lg border-2 border-transparent bg-muted/50 px-4 py-2.5 text-sm focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
                  邮箱
                </label>
                <Input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-auto rounded-lg border-2 border-transparent bg-muted/50 px-4 py-2.5 text-sm focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="auth-password"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Lock aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
                  密码
                </label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="•••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={authConfig.minPasswordLength}
                  maxLength={authConfig.maxPasswordLength}
                  className="h-auto rounded-lg border-2 border-transparent bg-muted/50 px-4 py-2.5 text-sm focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-confirm-password"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
                    确认密码
                  </label>
                  <Input
                    id="auth-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="•••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={authConfig.minPasswordLength}
                    maxLength={authConfig.maxPasswordLength}
                    className="h-auto rounded-lg border-2 border-transparent bg-muted/50 px-4 py-2.5 text-sm focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                aria-live="polite"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent py-3 font-medium text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    />
                    处理中...
                  </>
                ) : (
                  <>
                    {mode === 'login' ? '登录' : '创建账户'}
                    <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
