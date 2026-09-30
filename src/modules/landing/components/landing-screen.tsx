'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Layers3,
  Quote,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { AuthModal, useAuthSession } from '@/modules/auth'
import { ColorSchemeSelector } from '@/modules/theme'
import { DocumentSystemMap } from './document-system-map'
import { LandingValueStory } from './landing-value-story'

export function LandingScreen() {
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { data: session, isPending: sessionLoading } = useAuthSession()
  const isLoggedIn = Boolean(session?.user)

  const handlePreviewApp = () => {
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

        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pt-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              面向 AI 协作的全栈开发模板
            </div>
            <h1 className="text-5xl font-semibold tracking-[-0.045em] text-foreground sm:text-6xl md:text-7xl">
              {siteConfig.name}
            </h1>
            <p className="mt-5 max-w-xl text-xl font-medium leading-8 text-foreground sm:text-2xl sm:leading-9">
              {siteConfig.tagline}
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
                  开始使用
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviewApp}
                disabled={sessionLoading}
                aria-busy={sessionLoading}
                size="lg"
              >
                预览应用
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
              <a
                href="#why-ignite"
                className="inline-flex h-12 items-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                了解它能做什么
                <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              开始使用：前往 GitHub 克隆模板。预览应用：注册或登录后进入工作台。
            </p>
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

        <section
          id="why-ignite"
          aria-labelledby="why-ignite-title"
          className="border-y border-border bg-card/60"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Why Ignite
              </p>
              <h2
                id="why-ignite-title"
                className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                把一个问题，做成能用、能验证、还能继续改的产品
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                适合有具体问题、想尽快开始验证的个人开发者和小团队。Ignite 把可运行的全栈起点和 AI
                协作规则准备好：你说明目标与取舍，AI
                负责实现并验证；你更早拿到可体验的版本，也能有依据地继续修改。
              </p>
            </div>

            <LandingValueStory />
          </div>
        </section>

        <section
          aria-labelledby="documents-title"
          className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Project docs
            </p>
            <h2
              id="documents-title"
              className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              让 AI 看得懂项目，也让每次修改都有据可循
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              标准定规则，Feature 说清要解决什么，Plan 记录这一轮，Design 留下验收后的系统现状；AI
              按目录找到需要的上下文。
            </p>
          </div>

          <DocumentSystemMap />
        </section>

        <section className="border-t border-border bg-card/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">先从你想解决的问题开始。</h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                把目标说清楚，剩下的工作交给一套有边界、能验收的开发流程。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
                  开始使用
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviewApp}
                disabled={sessionLoading}
                aria-busy={sessionLoading}
                size="lg"
              >
                预览应用
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="ignite-manifesto-title"
          className="border-t border-border bg-foreground text-background"
        >
          <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-5 py-16 sm:px-8 sm:pt-24 sm:pb-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div className="max-w-lg">
              <h2
                id="ignite-manifesto-title"
                className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.08]"
              >
                <span className="block">好想法死在脑子里，</span>
                <span className="block text-background/70">是最可惜的。</span>
              </h2>
            </div>

            <div className="max-w-2xl pt-1 text-lg leading-9 text-background/75">
              <p className="text-xl font-medium tracking-wide text-background sm:text-2xl">
                想法是火种，不是烟花。
              </p>

              <p className="mt-4 border-l-2 border-background/70 bg-background/5 py-2 pl-4 text-xl font-semibold leading-8 text-background sm:text-2xl">
                烟花亮一瞬，火种是要燎原的。
              </p>

              <p className="mt-6">
                火种钻进炉火，烈火淬过，杂质褪去，
                <br />
                直至它有了可以被举起的形状。
              </p>

              <p className="mt-5">
                那是火炬。
                <br />
                那是“我想做”，变成了“我做成了”。
              </p>

              <p className="mt-5">
                举起来。
                <br />
                让人看见，让人借光，让人取暖。
                <br />
                从一双手，到另一双手。
              </p>

              <div className="mt-7 border-t border-background/20 pt-6">
                <p className="text-xl font-semibold tracking-tight text-background sm:text-2xl">
                  Ignite your idea.
                </p>
                <p className="mt-1 text-sm leading-6 text-background/65 sm:text-base">
                  从一念想法，到万家灯火。
                </p>
                <p className="mt-7 flex items-center gap-3 text-xl font-bold leading-tight tracking-tight text-background sm:text-3xl">
                  <span aria-hidden="true" className="text-background/55">
                    ✦
                  </span>
                  让星星之火得以燎原。
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-neutral-950 text-white">
          <div className="mx-auto flex max-w-6xl items-start gap-5 px-5 py-8 sm:gap-8 sm:px-8 sm:py-10">
            <Quote
              aria-hidden="true"
              className="mt-1 h-8 w-8 shrink-0 text-white/35 sm:h-10 sm:w-10"
            />
            <div>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                别让想法卡在技术准备上。
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
                AI
                可以很快帮你做出一个能展示的样子；难的是让它真正解决问题、稳定好用，出了问题能修，需求变了也能接着改。Ignite
                会先帮你理清想解决什么问题、谁会需要它，再用清楚严谨的方法一步步实现和检查，让每次修改都对准最初的目标。哪怕你不懂技术、不懂商业，想法也只是雏形，也能从一粒火种开始，把它做成经得起真实使用的产品，让那束光不止亮在屏幕上，更照进真实生活。
              </p>
            </div>
          </div>
        </footer>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="register"
      />
    </>
  )
}
