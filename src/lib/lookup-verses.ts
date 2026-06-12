import type { VerseData } from '../types'

interface BibleBookJson {
  book: { english: string; tamil: string }
  count: string
  chapters: Array<{
    chapter: string
    verses: Array<{ verse: string; text: string }>
  }>
}

// Vite statically analyzes this and bundles each book as a separate lazy chunk
const bookModules = import.meta.glob('../bible_legacy/*.json') as Record<
  string,
  () => Promise<{ default: BibleBookJson }>
>

export async function getBookChapterNums(bookName: string): Promise<number[]> {
  const key = `../bible_legacy/${bookName}.json`
  const loader = bookModules[key]
  if (!loader) return []
  const { default: data } = await loader()
  return data.chapters.map((c) => parseInt(c.chapter))
}

export async function getChapterVerseNums(
  bookName: string,
  chapter: string,
): Promise<number[]> {
  const key = `../bible_legacy/${bookName}.json`
  const loader = bookModules[key]
  if (!loader) return []
  const { default: data } = await loader()
  const chapterData = data.chapters.find((c) => c.chapter === chapter)
  if (!chapterData) return []
  return chapterData.verses.map((v) => parseInt(v.verse))
}

export async function lookupVerses(
  bookName: string,
  chapter: string,
  startVerse: number,
  endVerse: number,
): Promise<VerseData[]> {
  const key = `../bible_legacy/${bookName}.json`
  const loader = bookModules[key]
  if (!loader) throw new Error(`"${bookName}" not found in local Bible data.`)

  const { default: data } = await loader()

  const chapterData = data.chapters.find((c) => c.chapter === chapter)
  if (!chapterData)
    throw new Error(`${bookName} does not have a chapter ${chapter}.`)

  return chapterData.verses
    .filter((v) => {
      const n = parseInt(v.verse)
      return n >= startVerse && n <= endVerse
    })
    .map((v) => {
      const num = parseInt(v.verse)
      // Some books embed the verse number at the start of the text — strip it
      const text = v.text.trim().replace(new RegExp(`^${num}\\s+`), '')
      return { verse: num, text }
    })
}
