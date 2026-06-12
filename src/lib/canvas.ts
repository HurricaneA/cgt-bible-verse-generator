import {
  CONFIG,
  VERSE_PX,
  TITLE_PX,
  SEP_Y,
  VERSE_Y,
  VERSE_AREA_H,
} from './config'
import type { VerseData, BookInfo, GeneratedPage } from '../types'

const MIN_VERSE_PX = 36
const TAMIL_FONT = `'Tharmini', sans-serif`
const ENGLISH_FONT = `'Roboto', sans-serif`

function wrapText(
  text: string,
  maxWidth: number,
  ctx: CanvasRenderingContext2D,
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = words[0]
  for (let i = 1; i < words.length; i++) {
    const test = current + ' ' + words[i]
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(current)
      current = words[i]
    } else {
      current = test
    }
  }
  lines.push(current)
  return lines
}

function paginateVerses(
  verses: VerseData[],
  ctx: CanvasRenderingContext2D,
  maxTextWidth: number,
): VerseData[][] {
  ctx.font = `bold ${VERSE_PX}px ${TAMIL_FONT}`
  const lineH = Math.round(VERSE_PX * 1.5)
  const verseGap = Math.round(VERSE_PX * 0.5)
  const pages: VerseData[][] = []
  let page: VerseData[] = []
  let y = 0

  for (const v of verses) {
    const lines = wrapText(`${v.verse}. ${v.text}`, maxTextWidth, ctx)
    const h = lines.length * lineH + verseGap
    if (y + h > VERSE_AREA_H && page.length > 0) {
      pages.push(page)
      page = []
      y = 0
    }
    page.push(v)
    y += h
  }
  if (page.length > 0) pages.push(page)
  return pages
}

// Returns the largest font size at which all verses on a page fit within VERSE_AREA_H.
// Handles the case where a single long verse won't fit at VERSE_PX by scaling down.
function computePageFontPx(
  verses: VerseData[],
  ctx: CanvasRenderingContext2D,
  maxW: number,
): number {
  for (let fontPx = VERSE_PX; fontPx >= MIN_VERSE_PX; fontPx -= 2) {
    const lineH = Math.round(fontPx * 1.5)
    const verseGap = Math.round(fontPx * 0.5)
    ctx.font = `bold ${fontPx}px ${TAMIL_FONT}`
    let h = 0
    for (const v of verses) {
      h += wrapText(`${v.verse}. ${v.text}`, maxW, ctx).length * lineH + verseGap
    }
    h -= verseGap
    if (h <= VERSE_AREA_H) return fontPx
  }
  return MIN_VERSE_PX
}

function renderCanvas(
  canvas: HTMLCanvasElement,
  verses: VerseData[],
  page: number,
  totalPages: number,
  bookInfo: BookInfo,
  fontPx: number,
): void {
  const ctx = canvas.getContext('2d')!
  const { canvasWidth, canvasHeight } = CONFIG
  const maxW = canvasWidth - CONFIG.marginLeft - CONFIG.marginRight
  const centerX = Math.round(canvasWidth / 2)
  const lineH = Math.round(fontPx * 1.5)
  const verseGap = Math.round(fontPx * 0.5)

  // Per-page verse range: show only the verses actually on this page
  const pageStart = verses[0].verse
  const pageEnd = verses[verses.length - 1].verse
  const verseRange = pageStart === pageEnd ? `${pageStart}` : `${pageStart}-${pageEnd}`

  // Background
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Separator — spans the verse text area width
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(CONFIG.marginLeft, SEP_Y)
  ctx.lineTo(canvasWidth - CONFIG.marginRight, SEP_Y)
  ctx.stroke()

  // Title: Tamil left, English right — inset further than verse text
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.wordSpacing = '6px'
  ctx.font = `bold ${TITLE_PX}px ${TAMIL_FONT}`
  ctx.fillText(
    `${bookInfo.tamilBook} ${bookInfo.chapter}:${verseRange}`,
    CONFIG.titleMarginLeft,
    CONFIG.titleBaselineY,
  )
  ctx.font = `bold ${TITLE_PX}px ${ENGLISH_FONT}`
  const engTitle = `${bookInfo.englishBook} ${bookInfo.chapter}:${verseRange}`
  ctx.fillText(
    engTitle,
    canvasWidth - CONFIG.titleMarginRight - ctx.measureText(engTitle).width,
    CONFIG.titleBaselineY,
  )

  // Measure verse block height for vertical centering
  ctx.font = `bold ${fontPx}px ${TAMIL_FONT}`
  let blockH = 0
  for (const v of verses) {
    blockH += wrapText(`${v.verse}. ${v.text}`, maxW, ctx).length * lineH + verseGap
  }
  blockH -= verseGap

  let y = VERSE_Y + Math.max(0, Math.floor((VERSE_AREA_H - blockH) / 2))

  // Draw verses — bold, centered
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.wordSpacing = '8px'
  for (const v of verses) {
    const lines = wrapText(`${v.verse}. ${v.text}`, maxW, ctx)
    for (const line of lines) {
      ctx.fillText(line, centerX, y)
      y += lineH
    }
    y += verseGap
  }

  // Page indicator
  if (totalPages > 1) {
    ctx.textAlign = 'right'
    ctx.wordSpacing = '0px'
    ctx.font = `bold ${TITLE_PX}px ${ENGLISH_FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText(
      `${page} / ${totalPages}`,
      canvasWidth - CONFIG.titleMarginRight,
      canvasHeight - 40,
    )
  }
}

export function createPages(verses: VerseData[], bookInfo: BookInfo): GeneratedPage[] {
  const tmp = document.createElement('canvas')
  tmp.width = CONFIG.canvasWidth
  tmp.height = CONFIG.canvasHeight
  const tmpCtx = tmp.getContext('2d')!

  const maxW = CONFIG.canvasWidth - CONFIG.marginLeft - CONFIG.marginRight
  const pages = paginateVerses(verses, tmpCtx, maxW)

  return pages.map((pageVerses, i) => {
    const fontPx = computePageFontPx(pageVerses, tmpCtx, maxW)
    const canvas = document.createElement('canvas')
    canvas.width = CONFIG.canvasWidth
    canvas.height = CONFIG.canvasHeight
    renderCanvas(canvas, pageVerses, i + 1, pages.length, bookInfo, fontPx)
    return { canvas, dataUrl: canvas.toDataURL('image/png') }
  })
}
