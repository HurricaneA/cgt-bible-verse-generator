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
  titleMarginLeft: 280,   // title sits more inward than verse text
  titleMarginRight: 280,
  titleFontPt: 12,       // 300 DPI → ~50px
  verseFontPt: 17,       // 300 DPI → ~71px (slightly reduced to fit 8 lines)
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
  /** text colour for title + verses, hex (#rrggbb) */
  textColor: string
  /** background colour, hex (#rrggbb) */
  bgColor: string
}

export const DEFAULT_SETTINGS: RenderSettings = {
  titleInset: CONFIG.titleMarginLeft,
  titleFontPt: CONFIG.titleFontPt,
  titleY: CONFIG.titleBaselineY,
  textColor: '#ffffff',
  bgColor: '#000000',
}

/** Slider bounds for the title controls. */
export const TITLE_LIMITS = {
  titleInset: { min: 80, max: 600, step: 10 },
  titleFontPt: { min: 6, max: 28, step: 1 },
  // keep the title baseline below the separator line (CONFIG.sepY = 170)
  titleY: { min: 190, max: 340, step: 5 },
} as const

export const VERSE_PX = ptToPx(CONFIG.verseFontPt)
export const TITLE_PX = ptToPx(CONFIG.titleFontPt)
export const SEP_Y = CONFIG.sepY
export const VERSE_Y = CONFIG.verseStartY
export const VERSE_AREA_H = CONFIG.canvasHeight - CONFIG.marginBottom - VERSE_Y
