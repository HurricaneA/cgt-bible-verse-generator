export const CONFIG = {
  canvasWidth: 1920,
  canvasHeight: 1080,
  canvasDPI: 300,        // Photoshop document DPI for pt→px conversion
  sepY: 170,             // separator line — title + verses both sit below this
  titleBaselineY: 250,   // title text baseline (80px below separator)
  verseStartY: 370,      // first verse line — enough clearance below title descenders
  marginBottom: 80,
  marginLeft: 180,
  marginRight: 180,
  titleFontPt: 12,       // 300 DPI → ~50px
  verseFontPt: 17,       // 300 DPI → ~71px (slightly reduced to fit 8 lines)
} as const

function ptToPx(pt: number): number {
  return Math.round((pt * CONFIG.canvasDPI) / 72)
}

export const VERSE_PX = ptToPx(CONFIG.verseFontPt)
export const TITLE_PX = ptToPx(CONFIG.titleFontPt)
export const SEP_Y = CONFIG.sepY
export const VERSE_Y = CONFIG.verseStartY
export const VERSE_AREA_H = CONFIG.canvasHeight - CONFIG.marginBottom - VERSE_Y
