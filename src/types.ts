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
}

export type GenerateStatus = 'idle' | 'fetching' | 'rendering' | 'done' | 'error'

export interface GenerateState {
  status: GenerateStatus
  error: string | null
  pages: GeneratedPage[]
  bookInfo: BookInfo | null
}
