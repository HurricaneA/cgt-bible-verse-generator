export const CONFIG = {
  canvasWidth: 1920,
  canvasHeight: 1080,
  canvasDPI: 300,        // Photoshop document DPI for pt→px conversion
  sepY: 170,             // separator line — title + verses both sit below this
  titleBaselineY: 250,   // title text baseline (80px below separator)
  verseStartY: 320,      // first verse line — clearance below title descenders
  marginBottom: 80,
  marginLeft: 180,
  marginRight: 180,
  titleMarginLeft: 280,   // title sits more inward than verse text
  titleMarginRight: 280,
  titleFontPt: 12,       // 300 DPI → ~50px
  verseFontPt: 19,       // 300 DPI → ~79px
  lineSpacingPt: 18,     // verse line height
  textColor: '#ffffff',  // title + verse colour
  bgColor: '#000000',    // background colour
} as const

export function ptToPx(pt: number): number {
  return Math.round((pt * CONFIG.canvasDPI) / 72)
}

/** User-tunable render options (persisted in the browser; see useRenderSettings). */
export interface RenderSettings {
  /** horizontal inset of the title from each edge, px */
  titleInset: number
  /** title font size in points (on the 300-DPI canvas) */
  titleFontPt: number
  /** title baseline Y position, px */
  titleY: number
  /** verse line height in points (on the 300-DPI canvas) */
  lineSpacingPt: number
  /** verse font size in points (on the 300-DPI canvas) — auto-shrinks if a page overflows */
  verseFontPt: number
  /** text colour for title + verses, hex (#rrggbb) */
  textColor: string
  /** background colour, hex (#rrggbb) */
  bgColor: string
}

export const DEFAULT_SETTINGS: RenderSettings = {
  titleInset: CONFIG.titleMarginLeft,
  titleFontPt: CONFIG.titleFontPt,
  titleY: CONFIG.titleBaselineY,
  lineSpacingPt: CONFIG.lineSpacingPt,
  verseFontPt: CONFIG.verseFontPt,
  textColor: CONFIG.textColor,
  bgColor: CONFIG.bgColor,
}

/** Slider bounds for the title controls. */
export const TITLE_LIMITS = {
  titleInset: { min: 80, max: 600, step: 10 },
  titleFontPt: { min: 6, max: 28, step: 1 },
  // keep the title baseline below the separator line (CONFIG.sepY = 170)
  titleY: { min: 190, max: 340, step: 5 },
  lineSpacingPt: { min: 12, max: 48, step: 1 },
  verseFontPt: { min: 10, max: 40, step: 1 },
} as const

export const TITLE_PX = ptToPx(CONFIG.titleFontPt)
export const SEP_Y = CONFIG.sepY
export const VERSE_Y = CONFIG.verseStartY
export const VERSE_AREA_H = CONFIG.canvasHeight - CONFIG.marginBottom - VERSE_Y
