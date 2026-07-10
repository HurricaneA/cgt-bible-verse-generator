import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type ColorScheme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'tamil-bible-color-scheme'

interface Ctx {
  scheme: ColorScheme
  /** What's actually on screen once `system` is resolved. */
  resolved: 'light' | 'dark'
  setScheme: (s: ColorScheme) => void
}

const ColorSchemeContext = createContext<Ctx | null>(null)

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function read(): ColorScheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    /* storage unavailable (private mode, embedded) */
  }
  return 'system'
}

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorScheme>(read)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  // Track the OS preference so `system` stays live without a reload.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved: 'light' | 'dark' =
    scheme === 'system' ? (systemDark ? 'dark' : 'light') : scheme

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
  }, [resolved])

  const setScheme = useCallback((s: ColorScheme) => {
    setSchemeState(s)
    try {
      localStorage.setItem(STORAGE_KEY, s)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <ColorSchemeContext.Provider value={{ scheme, resolved, setScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  )
}

export function useColorScheme(): Ctx {
  const ctx = useContext(ColorSchemeContext)
  if (!ctx) throw new Error('useColorScheme must be used inside <ColorSchemeProvider>')
  return ctx
}
