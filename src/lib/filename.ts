import type { BookInfo, GeneratedPage } from '../types'

/** Just the verse span — so a not-yet-rendered page can be named too. */
export type PageRange = Pick<GeneratedPage, 'startVerse' | 'endVerse'>

/** Only the parts of BookInfo a filename needs, so a bare selection works too. */
export type NamedBook = Pick<BookInfo, 'englishBook' | 'chapter'>

function verseRange(page: PageRange): string {
  return page.startVerse === page.endVerse
    ? `${page.startVerse}`
    : `${page.startVerse}-${page.endVerse}`
}

/** Reference for the verses on this page, e.g. `Psalms_119_1` or `Psalms_119_1-4`. */
export function pageReference(book: NamedBook, page: PageRange): string {
  return `${book.englishBook.replace(/ /g, '_')}_${book.chapter}_${verseRange(page)}`
}

/**
 * `01_Psalms_119_1.png` — the index prefix keeps files in reading order and stays
 * unique when one long verse spans several pages. Dropped when there's one page.
 */
export function pageFileName(
  book: NamedBook,
  page: PageRange,
  index: number,
  total: number,
): string {
  const ref = pageReference(book, page)
  if (total === 1) return `${ref}.png`
  const width = Math.max(2, String(total).length)
  return `${String(index + 1).padStart(width, '0')}_${ref}.png`
}

/** Human-readable reference for a page, e.g. `Psalms 119:1-4`. */
export function pageLabel(book: NamedBook, page: PageRange): string {
  return `${book.englishBook} ${book.chapter}:${verseRange(page)}`
}
