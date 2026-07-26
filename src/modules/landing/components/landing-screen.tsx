'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl">
          <div className="space-y-16">
            <div>
              <h1 className="text-6xl md:text-8xl font-semibold tracking-tight mb-4 text-primary">
                {siteConfig.name}
              </h1>
              <p className="text-xl text-muted-foreground">{siteConfig.tagline}</p>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-baseline gap-3">
                <span className="w-16">Frontend</span>
                <span>Next.js · React · TypeScript</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="w-16">Backend</span>
                <span>Hono · Typed API</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-8">
              <button
                type="button"
                onClick={handleGetStarted}
                disabled={sessionLoading}
                aria-busy={sessionLoading}
                className="text-lg hover:opacity-80 transition-opacity inline-block border-b border-primary pb-0.5 text-primary disabled:cursor-wait disabled:opacity-50"
              >
                开始使用 →
              </button>

              <ColorSchemeSelector />
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
