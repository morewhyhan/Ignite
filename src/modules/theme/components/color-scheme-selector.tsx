'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type StudioColor =
  'studio-blue' | 'studio-teal' | 'studio-violet' | 'studio-coral' | 'studio-amber' | 'studio-slate'
type ColorScheme = StudioColor | `${StudioColor}-dark`

interface ColorConfig {
  name: string
  color: string
}

const lightSchemes: StudioColor[] = [
  'studio-blue',
  'studio-teal',
  'studio-violet',
  'studio-coral',
  'studio-amber',
  'studio-slate',
]

const colorConfigs: Record<StudioColor, ColorConfig> = {
  'studio-blue': { name: '海军蓝', color: '#315ee8' },
  'studio-teal': { name: '青石绿', color: '#087e78' },
  'studio-violet': { name: '深紫', color: '#7047c8' },
  'studio-coral': { name: '砖红', color: '#c84d4d' },
  'studio-amber': { name: '琥珀', color: '#a66308' },
  'studio-slate': { name: '石墨灰', color: '#475569' },
}

const legacySchemes: Record<string, StudioColor> = {
  'macaron-pink': 'studio-coral',
  'macaron-blue': 'studio-blue',
  'macaron-green': 'studio-teal',
  'macaron-purple': 'studio-violet',
  'macaron-yellow': 'studio-amber',
  'macaron-orange': 'studio-coral',
}

const allSchemes: ColorScheme[] = [
  ...lightSchemes,
  ...lightSchemes.map((scheme) => `${scheme}-dark` as ColorScheme),
]

function applySchemeClass(scheme: ColorScheme) {
  const root = document.documentElement
  allSchemes.forEach((item) => root.classList.remove(`scheme-${item}`))
  root.classList.add(`scheme-${scheme}`)
}

function readStoredScheme(stored: string | null): ColorScheme {
  if (stored && allSchemes.includes(stored as ColorScheme)) return stored as ColorScheme
  if (stored) {
    const legacyDark = stored.endsWith('-dark')
    const legacyName = legacyDark ? stored.slice(0, -5) : stored
    const migrated = legacySchemes[legacyName]
    if (migrated) return legacyDark ? `${migrated}-dark` : migrated
  }
  return 'studio-blue'
}

function baseScheme(scheme: ColorScheme): StudioColor {
  return scheme.replace(/-dark$/, '') as StudioColor
}

export function ColorSchemeSelector() {
  const { setTheme } = useTheme()
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>('studio-blue')

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = readStoredScheme(localStorage.getItem('color-scheme'))
      setCurrentScheme(stored)
      setTheme(stored.endsWith('-dark') ? 'dark' : 'light')
      applySchemeClass(stored)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [setTheme])

  function setScheme(scheme: ColorScheme) {
    applySchemeClass(scheme)
    localStorage.setItem('color-scheme', scheme)
    setCurrentScheme(scheme)
    setTheme(scheme.endsWith('-dark') ? 'dark' : 'light')
  }

  function toggleMode() {
    const nextScheme = currentScheme.endsWith('-dark')
      ? baseScheme(currentScheme)
      : (`${baseScheme(currentScheme)}-dark` as ColorScheme)
    setScheme(nextScheme)
  }

  const isDark = currentScheme.endsWith('-dark')
  const currentColor = colorConfigs[baseScheme(currentScheme)]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="选择主题"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50"
        >
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: currentColor.color }}
          />
          <span>主题</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>主题颜色</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={currentScheme}
          onValueChange={(value) => setScheme(value as ColorScheme)}
        >
          {lightSchemes.map((scheme) => {
            const value = isDark ? `${scheme}-dark` : scheme
            return (
              <DropdownMenuRadioItem key={scheme} value={value}>
                <span
                  aria-hidden="true"
                  className="mr-1 h-3 w-3 rounded-full"
                  style={{ backgroundColor: colorConfigs[scheme].color }}
                />
                {colorConfigs[scheme].name}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={toggleMode}>
          {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          {isDark ? '切换到浅色模式' : '切换到深色模式'}
          <span className="sr-only">，当前配色：{currentColor.name}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
