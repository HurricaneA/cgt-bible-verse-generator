import { CONFIG, ptToPx, type RenderSettings } from './config'
import { TAMIL_FONT, withAlpha, wrapText } from './canvas'
import type { VerseData, BookInfo, GeneratedPage } from '../types'

const { canvasWidth, canvasHeight } = CONFIG

// Title tab sits dark so the (white) reference reads over any frame art.
const TITLE_BG = 'rgba(20, 16, 14, 0.92)'
const TITLE_PAD_X = 20
const TITLE_OVERHANG_X = 29 // tab extends this far left of the box (19px @720 ×1.5)

/** Geometry derived from the user-tunable lower-third settings. */
function layout(s: RenderSettings) {
  const boxX = s.ltSideMargin
  const boxW = canvasWidth - 2 * s.ltSideMargin
  const boxH = s.ltBoxHeight
  const boxY = canvasHeight - s.ltBottomMargin - boxH
  const padL = s.ltBorderSide + s.ltPadding
  const padT = s.ltBorderTop + s.ltPadding
  const padB = s.ltBorderBottom + s.ltPadding
  return {
    boxX,
    boxY,
    boxW,
    boxH,
    innerX: boxX + padL,
    innerY: boxY + padT,
    innerW: boxW - 2 * padL,
    innerH: boxH - padT - padB,
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** Draw `img` to cover the dest rect (center-cropped, preserves aspect). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
): void {
  const ir = img.width / img.height
  const dr = dw / dh
  let sw = img.width
  let sh = img.height
  if (ir > dr) {
    sw = sh * dr
  } else {
    sh = sw / dr
  }
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

function renderLowerThird(
  canvas: HTMLCanvasElement,
  lines: string[],
  verse: number,
  bookInfo: BookInfo,
  settings: RenderSettings,
  frame: HTMLImageElement | null,
  isVerseEnd: boolean,
): void {
  const ctx = canvas.getContext('2d')!
  const { boxX, boxY, boxW, boxH, innerX, innerY, innerW } = layout(settings)
  const r = settings.ltCornerRadius
  const side = settings.ltBorderSide
  const top = settings.ltBorderTop
  const bottom = settings.ltBorderBottom

  // Transparent overlay — never fill the whole canvas.
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Optional inner fill for readability over busy video.
  if (settings.ltInnerOpacity > 0) {
    ctx.beginPath()
    roundRectPath(ctx, boxX, boxY, boxW, boxH, r)
    ctx.fillStyle = withAlpha(settings.bgColor, settings.ltInnerOpacity)
    ctx.fill()
  }

  // Border ring: clip to outer-minus-inner rounded rect, then paint. The ring
  // is thicker on the sides than top/bottom, matching the design.
  if (side > 0 || top > 0 || bottom > 0) {
    ctx.save()
    ctx.beginPath()
    roundRectPath(ctx, boxX, boxY, boxW, boxH, r)
    roundRectPath(
      ctx,
      boxX + side,
      boxY + top,
      boxW - 2 * side,
      boxH - top - bottom,
      Math.max(0, r - Math.max(side, top)),
    )
    ctx.clip('evenodd')
    if (frame) {
      drawCover(ctx, frame, boxX, boxY, boxW, boxH)
    } else {
      // No image yet — show a subtle placeholder ring so the layout reads.
      ctx.fillStyle = withAlpha(settings.textColor, 0.3)
      ctx.fillRect(boxX, boxY, boxW, boxH)
    }
    ctx.restore()
  }

  // Verse text — Tamil only, justified to the inner width.
  const fontPx = ptToPx(settings.ltVerseFontPt)
  const lineH = ptToPx(settings.ltLineSpacingPt)
  ctx.fillStyle = settings.textColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `bold ${fontPx}px ${TAMIL_FONT}`
  let y = innerY + fontPx
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const words = line.split(' ')
    // Justify every line except the one that ends the verse. A line that ends a
    // page mid-verse is still full-width, so it stays justified.
    const isLast = isVerseEnd && i === lines.length - 1
    if (!isLast && words.length > 1) {
      ctx.wordSpacing = '0px'
      const extra = innerW - ctx.measureText(line).width
      ctx.wordSpacing = `${Math.max(0, extra / (words.length - 1))}px`
    } else {
      ctx.wordSpacing = '0px'
    }
    ctx.fillText(line, innerX, y)
    y += lineH
  }
  ctx.wordSpacing = '0px'

  // Title tab — fixed size from the design, straddling the top-left border and
  // overhanging slightly to the left. Grows only if the reference is too wide.
  const titlePx = ptToPx(CONFIG.ltTitleFontPt)
  ctx.font = `bold ${titlePx}px ${TAMIL_FONT}`
  const titleText = `${bookInfo.tamilBook} ${bookInfo.chapter}:${verse}`
  const tabH = CONFIG.ltTitleHeight
  const tabW = Math.max(
    CONFIG.ltTitleWidth,
    ctx.measureText(titleText).width + 2 * TITLE_PAD_X,
  )
  const tabX = boxX - TITLE_OVERHANG_X
  const tabY = boxY + top - tabH // tab bottom overlaps the top border
  ctx.beginPath()
  roundRectPath(ctx, tabX, tabY, tabW, tabH, Math.min(r, tabH / 2))
  ctx.fillStyle = TITLE_BG
  ctx.fill()
  ctx.fillStyle = settings.textColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(titleText, tabX + TITLE_PAD_X, tabY + tabH / 2 + 1)
}

/**
 * Render the selected verses as transparent lower-third overlays — one verse per
 * canvas, so a new verse never starts partway down a slide. A verse too tall for
 * the box spills onto continuation canvases, each repeating its title tab.
 */
export function createLowerThirdPages(
  verses: VerseData[],
  bookInfo: BookInfo,
  settings: RenderSettings,
  frame: HTMLImageElement | null,
): GeneratedPage[] {
  const { innerW, innerH } = layout(settings)
  const fontPx = ptToPx(settings.ltVerseFontPt)
  const lineH = ptToPx(settings.ltLineSpacingPt)

  const tmp = document.createElement('canvas')
  tmp.width = canvasWidth
  tmp.height = canvasHeight
  const tmpCtx = tmp.getContext('2d')!
  tmpCtx.font = `bold ${fontPx}px ${TAMIL_FONT}`
  tmpCtx.wordSpacing = '0px'

  // First line's ascender + (n-1) line-heights must fit innerH.
  const perPage = Math.max(1, Math.floor((innerH - fontPx) / lineH) + 1)

  const chunks: { lines: string[]; verse: number; isVerseEnd: boolean }[] = []
  for (const v of verses) {
    const lines = v.text.trim() ? wrapText(v.text, innerW, tmpCtx) : ['']
    for (let i = 0; i < lines.length; i += perPage) {
      const slice = lines.slice(i, i + perPage)
      chunks.push({ lines: slice, verse: v.verse, isVerseEnd: i + perPage >= lines.length })
    }
  }
  if (chunks.length === 0) {
    chunks.push({ lines: [''], verse: bookInfo.startVerse, isVerseEnd: true })
  }

  return chunks.map(({ lines, verse, isVerseEnd }) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    renderLowerThird(canvas, lines, verse, bookInfo, settings, frame, isVerseEnd)
    return {
      canvas,
      dataUrl: canvas.toDataURL('image/png'),
      startVerse: verse,
      endVerse: verse,
    }
  })
}
