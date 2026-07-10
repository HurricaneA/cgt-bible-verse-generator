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

  // Lower-third overlay (transparent canvas for live-stream overlays).
  // Box sits in the lower region; the uploaded image fills a border ring
  // around the (Tamil-only) verse text. All px on the 1920×1080 canvas.
  // Defaults come from the design mockup, measured at 1280×720 and scaled ×1.5.
  ltSideMargin: 99,        // box inset from left/right edges (66 @720)
  ltBottomMargin: 63,      // box inset from bottom edge (42 @720)
  ltBoxHeight: 222,        // box height (148 @720)
  ltCornerRadius: 30,      // box corner radius (not measured — estimated)
  ltBorderSide: 17,        // ring thickness, left/right (11 @720)
  ltBorderTop: 11,         // ring thickness, top (7 @720)
  ltBorderBottom: 5,       // ring thickness, bottom (3 @720)
  ltPadding: 10,           // gap between the ring and the text (estimated)
  ltInnerOpacity: 0,       // inner fill opacity (0 = transparent overlay)
  ltVerseFontPt: 10,       // lower-third verse text (estimated to fit ~4 lines)
  ltLineSpacingPt: 11,     // lower-third line height (estimated)
  ltTitleFontPt: 10,       // title-tab font size (estimated)
  ltTitleWidth: 395,       // title tab width (263 @720)
  ltTitleHeight: 71,       // title tab height (47 @720)
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

  // --- Lower-third overlay (only used in 'lowerThird' output mode) ---
  /** box inset from the left/right canvas edges, px */
  ltSideMargin: number
  /** box inset from the bottom canvas edge, px */
  ltBottomMargin: number
  /** box height, px */
  ltBoxHeight: number
  /** ring thickness on the left/right edges, px */
  ltBorderSide: number
  /** ring thickness on the top edge, px */
  ltBorderTop: number
  /** ring thickness on the bottom edge, px */
  ltBorderBottom: number
  /** box corner radius, px */
  ltCornerRadius: number
  /** gap between the border ring and the text, px */
  ltPadding: number
  /** inner fill opacity behind the text, 0–1 (0 = fully transparent) */
  ltInnerOpacity: number
  /** lower-third verse font size in points */
  ltVerseFontPt: number
  /** lower-third line height in points */
  ltLineSpacingPt: number
}

export const DEFAULT_SETTINGS: RenderSettings = {
  titleInset: CONFIG.titleMarginLeft,
  titleFontPt: CONFIG.titleFontPt,
  titleY: CONFIG.titleBaselineY,
  lineSpacingPt: CONFIG.lineSpacingPt,
  verseFontPt: CONFIG.verseFontPt,
  textColor: CONFIG.textColor,
  bgColor: CONFIG.bgColor,
  ltSideMargin: CONFIG.ltSideMargin,
  ltBottomMargin: CONFIG.ltBottomMargin,
  ltBoxHeight: CONFIG.ltBoxHeight,
  ltBorderSide: CONFIG.ltBorderSide,
  ltBorderTop: CONFIG.ltBorderTop,
  ltBorderBottom: CONFIG.ltBorderBottom,
  ltCornerRadius: CONFIG.ltCornerRadius,
  ltPadding: CONFIG.ltPadding,
  ltInnerOpacity: CONFIG.ltInnerOpacity,
  ltVerseFontPt: CONFIG.ltVerseFontPt,
  ltLineSpacingPt: CONFIG.ltLineSpacingPt,
}

/** Slider bounds for the customization controls. */
export const LIMITS = {
  titleInset: { min: 80, max: 600, step: 10 },
  titleFontPt: { min: 6, max: 28, step: 1 },
  // keep the title baseline below the separator line (CONFIG.sepY = 170)
  titleY: { min: 190, max: 340, step: 5 },
  lineSpacingPt: { min: 12, max: 48, step: 1 },
  verseFontPt: { min: 10, max: 40, step: 1 },
  ltSideMargin: { min: 0, max: 400, step: 1 },
  ltBottomMargin: { min: 0, max: 400, step: 1 },
  ltBoxHeight: { min: 80, max: 760, step: 2 },
  ltBorderSide: { min: 0, max: 80, step: 1 },
  ltBorderTop: { min: 0, max: 80, step: 1 },
  ltBorderBottom: { min: 0, max: 80, step: 1 },
  ltCornerRadius: { min: 0, max: 100, step: 1 },
  ltPadding: { min: 0, max: 140, step: 1 },
  ltInnerOpacity: { min: 0, max: 1, step: 0.05 },
  ltVerseFontPt: { min: 6, max: 30, step: 1 },
  ltLineSpacingPt: { min: 6, max: 36, step: 1 },
} as const

export const TITLE_PX = ptToPx(CONFIG.titleFontPt)
export const SEP_Y = CONFIG.sepY
export const VERSE_Y = CONFIG.verseStartY
export const VERSE_AREA_H = CONFIG.canvasHeight - CONFIG.marginBottom - VERSE_Y
