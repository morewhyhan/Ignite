'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowDown, ArrowRight, Boxes, Layers3, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { AuthModal, useAuthSession } from '@/modules/auth'
import { ColorSchemeSelector } from '@/modules/theme'

export function LandingScreen() {
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { data: session, isPending: sessionLoading } = useAuthSession()
  const isLoggedIn = Boolean(session?.user)

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      setAuthModalOpen(true)
    }
  }

  return (
    <>
      <main className="min-h-screen">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md text-foreground"
            aria-label={`${siteConfig.name} 首页`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">{siteConfig.name}</span>
          </Link>
          <ColorSchemeSelector />
        </header>

        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pt-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              可扩展的全栈项目起点
            </div>
            <h1 className="text-5xl font-semibold tracking-[-0.045em] text-foreground sm:text-6xl md:text-7xl">
              {siteConfig.name}
            </h1>
            <p className="mt-5 max-w-xl text-xl font-medium leading-8 text-foreground sm:text-2xl sm:leading-9">
              {siteConfig.tagline}
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              {siteConfig.description} 从清晰的模块边界开始，把精力留给真正要解决的问题。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleGetStarted}
                disabled={sessionLoading}
                aria-busy={sessionLoading}
                size="lg"
              >
                开始使用
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
              <a
                href="#foundation"
                className="inline-flex h-12 items-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                了解项目基础
                <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Layers3 aria-hidden="true" className="h-4 w-4 text-primary" />
                规格驱动
              </span>
              <span className="inline-flex items-center gap-2">
                <Boxes aria-hidden="true" className="h-4 w-4 text-primary" />
                模块化全栈
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-primary" />
                可验证交付
              </span>
            </div>
          </div>

          <section
            id="foundation"
            aria-labelledby="foundation-title"
            className="rounded-2xl border border-border bg-card p-5 shadow-[0_14px_40px_-28px_rgba(23,34,53,0.35)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Project foundation
                </p>
                <h2 id="foundation-title" className="mt-2 text-lg font-semibold tracking-tight">
                  从界面到数据，边界清楚
                </h2>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Boxes aria-hidden="true" className="h-5 w-5" />
              </div>
            </div>
            <div className="divide-y divide-border">
              <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <span className="text-sm font-medium text-muted-foreground">Web</span>
                <span className="text-sm font-medium">Next.js · React · TypeScript</span>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <span className="text-sm font-medium text-muted-foreground">业务请求</span>
                <span className="text-sm font-medium">Module Hook → Hono Typed RPC</span>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <span className="text-sm font-medium text-muted-foreground">数据</span>
                <span className="text-sm font-medium">Hono route → Prisma</span>
              </div>
              <div className="grid gap-1 pt-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <span className="text-sm font-medium text-muted-foreground">开发循环</span>
                <span className="text-sm font-medium">Feature → Plan → Test → Verify</span>
              </div>
            </div>
            <p className="mt-5 rounded-lg bg-muted/50 px-3.5 py-3 text-xs leading-5 text-muted-foreground">
              页面和数据层可逐步替换，模板基线不会替代具体项目的验收。
            </p>
          </section>
        </section>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
