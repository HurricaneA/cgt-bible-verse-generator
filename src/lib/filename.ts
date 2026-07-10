import type { BookInfo, GeneratedPage } from '../types'

function verseRange(page: GeneratedPage): string {
  return page.startVerse === page.endVerse
    ? `${page.startVerse}`
    : `${page.startVerse}-${page.endVerse}`
}

/** Reference for the verses on this page, e.g. `Psalms_119_1` or `Psalms_119_1-4`. */
export function pageReference(bookInfo: BookInfo, page: GeneratedPage): string {
  const book = bookInfo.englishBook.replace(/ /g, '_')
  return `${book}_${bookInfo.chapter}_${verseRange(page)}`
}

/**
 * `01_Psalms_119_1.png` — the index prefix keeps files in reading order and stays
 * unique when one long verse spans several pages. Dropped when there's one page.
 */
export function pageFileName(
  bookInfo: BookInfo,
  page: GeneratedPage,
  index: number,
  total: number,
): string {
  const ref = pageReference(bookInfo, page)
  if (total === 1) return `${ref}.png`
  const width = Math.max(2, String(total).length)
  return `${String(index + 1).padStart(width, '0')}_${ref}.png`
}
