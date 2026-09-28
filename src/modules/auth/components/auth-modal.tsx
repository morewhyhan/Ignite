'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight, LoaderCircle, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { authConfig } from '@/config/auth'
import { siteConfig } from '@/config/site'
import { toast } from 'sonner'
import { useSignIn, useSignUp } from '../hooks/use-auth'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

const inputClassName =
  'h-11 rounded-lg border-input bg-background px-3.5 text-sm shadow-none placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-primary/20'

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
      <DialogContent className="grid max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-4xl grid-cols-1 gap-0 overflow-y-auto rounded-2xl border border-border bg-card p-0 shadow-2xl md:grid-cols-[0.88fr_1.12fr]">
        <aside className="hidden flex-col bg-foreground p-9 text-background md:flex lg:p-11">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">{siteConfig.name}</p>
              <p className="mt-0.5 text-[11px] text-background/60">AI-ready full-stack starter</p>
            </div>
          </div>

          <div className="mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-background/60">
              Build with clarity
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
              把重复的工程准备好，
              <br />
              把注意力留给问题本身。
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-6 text-background/70">
              从清晰的目标开始，让 AI 沿着规格、任务和验收路径，把每一轮开发继续做下去。
            </p>
          </div>

          <div className="mt-auto border-t border-background/15 pt-5">
            <p className="text-xs font-medium text-background/60">一轮开发</p>
            <p className="mt-2 text-sm font-medium tracking-wide text-background">
              Feature <span className="px-1 text-background/40">→</span> Plan{' '}
              <span className="px-1 text-background/40">→</span> Test{' '}
              <span className="px-1 text-background/40">→</span> Verify
            </p>
          </div>
        </aside>

        <section className="px-6 py-8 sm:px-10 sm:py-10 md:px-10 md:py-12 lg:px-14">
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">{siteConfig.name}</span>
          </div>

          <DialogHeader className="mb-7 space-y-2 text-left sm:text-left">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {mode === 'login' ? '欢迎回来' : '创建账户'}
            </DialogTitle>
            <DialogDescription className="max-w-sm leading-6">
              {mode === 'login'
                ? '登录后继续使用你的项目工作台。'
                : `创建账户，开始使用 ${siteConfig.name}。`}
            </DialogDescription>
          </DialogHeader>

          <div
            className="mb-7 grid grid-cols-2 border-b border-border"
            role="group"
            aria-label="登录或注册"
          >
            <button
              type="button"
              aria-pressed={mode === 'login'}
              onClick={() => switchMode('login')}
              className={`-mb-px border-b-2 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                mode === 'login'
                  ? 'border-primary font-semibold text-foreground'
                  : 'border-transparent font-medium text-muted-foreground hover:text-foreground'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              aria-pressed={mode === 'register'}
              onClick={() => switchMode('register')}
              className={`-mb-px border-b-2 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                mode === 'register'
                  ? 'border-primary font-semibold text-foreground'
                  : 'border-transparent font-medium text-muted-foreground hover:text-foreground'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="auth-name" className="text-sm font-medium">
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
                  className={inputClassName}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="auth-email" className="text-sm font-medium">
                邮箱
              </label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="auth-password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="auth-password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="输入密码"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={authConfig.minPasswordLength}
                maxLength={authConfig.maxPasswordLength}
                className={inputClassName}
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="auth-confirm-password" className="text-sm font-medium">
                  确认密码
                </label>
                <Input
                  id="auth-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={authConfig.minPasswordLength}
                  maxLength={authConfig.maxPasswordLength}
                  className={inputClassName}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              aria-live="polite"
              className="mt-2 h-11 w-full gap-2 font-medium shadow-none"
            >
              {isLoading ? (
                <>
                  <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  {mode === 'login' ? '登录' : '创建账户'}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </section>
      </DialogContent>
    </Dialog>
  )
}
