import { useState, useCallback } from 'react'
import { tamilBookNames } from '../lib/bible-data'
import { lookupVerses } from '../lib/lookup-verses'
import { createPages } from '../lib/canvas'
import type { BookInfo, GenerateState } from '../types'

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

  const generate = useCallback(async (input: string) => {
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

    const tamilBook = tamilBookNames[englishBook]!
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
    await document.fonts.ready

    const pages = createPages(verses, bookInfo)
    setState({ status: 'done', error: null, pages, bookInfo })
  }, [])

  const reset = useCallback(() => setState(IDLE), [])

  return { state, generate, reset }
}
