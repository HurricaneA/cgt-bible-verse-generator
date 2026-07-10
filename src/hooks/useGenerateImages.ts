import { useState, useCallback, useRef } from 'react'
import { tamilBookNames, tamilBookNamesLegacy } from '../lib/bible-data'
import { lookupVerses } from '../lib/lookup-verses'
import { createPages } from '../lib/canvas'
import { createLowerThirdPages } from '../lib/lower-third'
import { DEFAULT_SETTINGS, type RenderSettings } from '../lib/config'
import type { BookInfo, VerseData, GenerateState, RenderOptions } from '../types'

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

function parseReference(input: string) {
  const match = input.replace(/\./g, ':').match(/([a-zA-Z0-9 ]+) (\d+):(\d+)(?:-(\d+))?/)
  if (!match) return null
  const startVerse = parseInt(match[3])
  return {
    englishBook: match[1].trim(),
    chapter: match[2],
    startVerse,
    endVerse: match[4] ? parseInt(match[4]) : startVerse,
  }
}

function validateReference(
  englishBook: string,
  startVerse: number,
  endVerse: number,
): string | null {
  if (startVerse < 1 || endVerse < 1) return 'Verse numbers must be greater than 0.'
  if (startVerse > endVerse) return 'Start verse must be ≤ end verse.'
  if (!tamilBookNames[englishBook])
    return `"${englishBook}" is not a valid book name. Check the spelling.`
  return null
}

const IDLE: GenerateState = { status: 'idle', error: null, pages: [], bookInfo: null }

export function useGenerateImages() {
  const [state, setState] = useState<GenerateState>(IDLE)
  // Last successfully fetched verses, kept so settings tweaks can re-render
  // the images without re-fetching.
  const lastRef = useRef<{ verses: VerseData[]; bookInfo: BookInfo } | null>(null)

  const generate = useCallback(
    async (input: string, settings?: RenderSettings, opts: RenderOptions = DEFAULT_OPTS) => {
    const trimmed = input.trim()
    if (!trimmed) return

    const parsed = parseReference(trimmed)
    if (!parsed) {
      setState({
        ...IDLE,
        status: 'error',
        error: 'Invalid format. Use "Book chapter:verse" or "Book chapter:start-end", e.g. Genesis 2:3 or Luke 2:1-13',
      })
      return
    }

    const { englishBook, chapter, startVerse, endVerse } = parsed
    const validationError = validateReference(englishBook, startVerse, endVerse)
    if (validationError) {
      setState({ ...IDLE, status: 'error', error: validationError })
      return
    }

    // Legacy (Tharmini-encoded) name for the canvas title, which renders in
    // the Tharmini font. The Unicode tamilBookNames map is still used for the
    // dropdown UI and validation above.
    const tamilBook = tamilBookNamesLegacy[englishBook]!
    const bookInfo: BookInfo = { englishBook, tamilBook, chapter, startVerse, endVerse }

    setState({ status: 'fetching', error: null, pages: [], bookInfo: null })

    let verses
    try {
      verses = await lookupVerses(englishBook, chapter, startVerse, endVerse)
    } catch (e) {
      setState({ ...IDLE, status: 'error', error: (e as Error).message })
      return
    }

    // Completeness check
    const found = new Set(verses.map((v) => v.verse))
    const missing: number[] = []
    for (let i = startVerse; i <= endVerse; i++) {
      if (!found.has(i)) missing.push(i)
    }
    if (missing.length === endVerse - startVerse + 1) {
      setState({
        ...IDLE,
        status: 'error',
        error: `No verses found. Chapter ${chapter} of ${englishBook} may not have verses ${startVerse}–${endVerse}.`,
      })
      return
    }
    if (missing.length > 0) {
      setState({
        ...IDLE,
        status: 'error',
        error: `Verses ${missing.join(', ')} were not found. ${englishBook} ${chapter} likely ends before verse ${endVerse}.`,
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
  }, [])

  // Re-render the current verses with new settings/options (no re-fetch). Fonts
  // are already loaded from the initial generate, so this is synchronous.
  const rerender = useCallback(
    (settings: RenderSettings, opts: RenderOptions = DEFAULT_OPTS) => {
      const last = lastRef.current
      if (!last) return
      const pages = renderPages(last.verses, last.bookInfo, settings, opts)
      setState((s) => (s.status === 'done' ? { ...s, pages } : s))
    },
    [],
  )

  const reset = useCallback(() => setState(IDLE), [])

  return { state, generate, rerender, reset }
}
