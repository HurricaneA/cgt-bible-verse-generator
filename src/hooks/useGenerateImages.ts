import { useState, useCallback, useRef } from 'react'
import { tamilBookNamesLegacy } from '../lib/bible-data'
import { lookupVerses } from '../lib/lookup-verses'
import { createPages } from '../lib/canvas'
import { createLowerThirdPages } from '../lib/lower-third'
import { DEFAULT_SETTINGS, type RenderSettings } from '../lib/config'
import type {
  BookInfo,
  VerseData,
  GenerateState,
  RenderOptions,
  PassageSelection,
} from '../types'

const DEFAULT_OPTS: RenderOptions = { outputMode: 'slide', frame: null }

function renderPages(
  verses: VerseData[],
  bookInfo: BookInfo,
  settings: RenderSettings,
  opts: RenderOptions,
) {
  return opts.outputMode === 'lowerThird'
    ? createLowerThirdPages(verses, bookInfo, settings, opts.frame)
    : createPages(verses, bookInfo, settings)
}

const IDLE: GenerateState = { status: 'idle', error: null, pages: [], bookInfo: null }

export function useGenerateImages() {
  const [state, setState] = useState<GenerateState>(IDLE)
  // Last successfully fetched verses, kept so settings tweaks can re-render
  // the images without re-fetching.
  const lastRef = useRef<{ verses: VerseData[]; bookInfo: BookInfo } | null>(null)

  const generate = useCallback(
    async (
      selection: PassageSelection,
      settings?: RenderSettings,
      opts: RenderOptions = DEFAULT_OPTS,
    ) => {
      const { englishBook, chapter, startVerse, endVerse } = selection

      // Legacy (Tharmini-encoded) name for the canvas title, which renders in
      // the Tharmini font. The Unicode tamilBookNames map drives the picker.
      const tamilBook = tamilBookNamesLegacy[englishBook]
      if (!tamilBook) {
        setState({
          ...IDLE,
          status: 'error',
          error: `We don't have a Tamil name on file for "${englishBook}". Pick another book.`,
        })
        return
      }

      const bookInfo: BookInfo = { englishBook, tamilBook, chapter, startVerse, endVerse }
      setState({ status: 'fetching', error: null, pages: [], bookInfo: null })

      let verses: VerseData[]
      try {
        verses = await lookupVerses(englishBook, chapter, startVerse, endVerse)
      } catch (e) {
        setState({ ...IDLE, status: 'error', error: (e as Error).message })
        return
      }

      // Completeness check — the picker only offers verses that exist, so this
      // catches data problems rather than user mistakes.
      const found = new Set(verses.map((v) => v.verse))
      const missing: number[] = []
      for (let i = startVerse; i <= endVerse; i++) if (!found.has(i)) missing.push(i)

      if (missing.length === endVerse - startVerse + 1) {
        setState({
          ...IDLE,
          status: 'error',
          error: `No verses came back for ${englishBook} ${chapter}:${startVerse}–${endVerse}. Try a different passage.`,
        })
        return
      }
      if (missing.length > 0) {
        setState({
          ...IDLE,
          status: 'error',
          error: `Verses ${missing.join(', ')} are missing from our copy of ${englishBook} ${chapter}. Try a shorter range.`,
        })
        return
      }

      setState((s) => ({ ...s, status: 'rendering' }))

      // Explicitly load Tharmini — document.fonts.ready only waits for fonts
      // already used in the DOM; since Tharmini never appears in HTML we must
      // trigger the fetch manually before the canvas tries to use it.
      await Promise.all([
        document.fonts.load(`bold 71px 'Tharmini'`),
        document.fonts.load(`bold 50px 'Tharmini'`),
      ])

      lastRef.current = { verses, bookInfo }
      const pages = renderPages(verses, bookInfo, settings ?? DEFAULT_SETTINGS, opts)
      setState({ status: 'done', error: null, pages, bookInfo })
    },
    [],
  )

  // Re-render the current verses with new settings/options (no re-fetch). Fonts
  // are already loaded from the initial generate, so this is synchronous.
  const rerender = useCallback((settings: RenderSettings, opts: RenderOptions = DEFAULT_OPTS) => {
    const last = lastRef.current
    if (!last) return
    const pages = renderPages(last.verses, last.bookInfo, settings, opts)
    setState((s) => (s.status === 'done' ? { ...s, pages } : s))
  }, [])

  const reset = useCallback(() => setState(IDLE), [])

  return { state, generate, rerender, reset }
}
