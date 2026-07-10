export interface VerseData {
  verse: number
  text: string
}

export interface BookInfo {
  englishBook: string
  tamilBook: string
  chapter: string
  startVerse: number
  endVerse: number
}

export interface GeneratedPage {
  canvas: HTMLCanvasElement
  dataUrl: string
  /** Verses actually shown on this page — drives the title and the filename. */
  startVerse: number
  endVerse: number
}

/** Output format: full 16:9 slide, or a transparent lower-third overlay. */
export type OutputMode = 'slide' | 'lowerThird'

/** Extra render inputs that aren't part of the persisted RenderSettings. */
export interface RenderOptions {
  outputMode: OutputMode
  /** uploaded border image for lower-third mode (not persisted) */
  frame: HTMLImageElement | null
}

export type GenerateStatus = 'idle' | 'fetching' | 'rendering' | 'done' | 'error'

export interface GenerateState {
  status: GenerateStatus
  error: string | null
  pages: GeneratedPage[]
  bookInfo: BookInfo | null
}
