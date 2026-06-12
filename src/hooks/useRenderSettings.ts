import { useState, useCallback, useEffect } from 'react'
import { DEFAULT_SETTINGS, type RenderSettings } from '../lib/config'

const STORAGE_KEY = 'tamil-bible-render-settings'

function load(): RenderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    /* ignore malformed/unavailable storage */
  }
  return DEFAULT_SETTINGS
}

/** Render settings persisted in localStorage, with a reset-to-default. */
export function useRenderSettings() {
  const [settings, setSettings] = useState<RenderSettings>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* ignore */
    }
  }, [settings])

  const update = useCallback(
    <K extends keyof RenderSettings>(key: K, value: RenderSettings[K]) =>
      setSettings((s) => ({ ...s, [key]: value })),
    [],
  )

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  return { settings, update, reset }
}
