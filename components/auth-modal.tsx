'use client'

import { useState } from 'react'
import { Mail, Lock, Sparkles } from 'lucide-react'
import { useSignIn, useSignUp } from '@/hooks/use-auth'
import { toast } from 'sonner'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')

  const signIn = useSignIn()
  const signUp = useSignUp()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      {/* 背景 */}
      <div className="absolute inset-0 bg-black/50 transition-opacity animate-in fade-in-0 duration-200" />

      {/* 弹窗内容 */}
      <div
        className="relative bg-card rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* 顶部装饰 */}
        <div className="relative overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
        </div>

        {/* 表单 */}
        <div className="relative px-10 py-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold">HonoNext</span>
          </div>

          {/* 选项卡 */}
          <div className="flex mb-6 p-1 bg-muted/60 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              注册
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-1.5 text-center">
            {mode === 'login' ? '欢迎回来' : '创建账户'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            {mode === 'login' ? '登录到你的账户继续使用' : '开始你的 HonoNext 之旅'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                  用户名
                </label>
                <input
                  type="text"
                  placeholder="你的用户名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 border-2 border-transparent transition-all text-sm"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                邮箱
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 border-2 border-transparent transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                密码
              </label>
              <input
                type="password"
                placeholder="•••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 border-2 border-transparent transition-all text-sm"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  确认密码
                </label>
                <input
                  type="password"
                  placeholder="•••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 border-2 border-transparent transition-all text-sm"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-border/40" />
                  <span className="text-muted-foreground">记住我</span>
                </label>
                <button type="button" className="text-primary hover:opacity-80 transition-opacity">
                  忘记密码？
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  {mode === 'login' ? '登录' : '创建账户'}
                  <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* 第三方登录 */}
          {mode === 'login' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">或使用以下方式继续</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-border/40 rounded-lg hover:bg-muted/30 hover:border-border/60 transition-all text-sm font-medium shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 bg-[#24292e] text-white rounded-lg hover:bg-[#32383f] transition-all text-sm font-medium shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.09.682-.218.682-.484 0-.237-.009-.866-.014-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.748-1.026 2.748-1.026.545 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .269.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
