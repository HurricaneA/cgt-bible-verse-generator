import { useState } from 'react'
import { IconAlertCircle, IconPhoto } from '@tabler/icons-react'
import { Skeleton, Segmented } from '../ui/controls'
import { Button } from '../ui/Button'
import ImageCard from './ImageCard'
import BulkDownload from './BulkDownload'
import RenderControls from './RenderControls'
import { pageFileName } from '../lib/filename'
import type { RenderSettings } from '../lib/config'
import type { Backdrop, GenerateState, OutputMode, PassageSelection } from '../types'

interface Props {
  state: GenerateState
  mode: OutputMode
  selection: PassageSelection | null
  settings: RenderSettings
  update: <K extends keyof RenderSettings>(key: K, value: RenderSettings[K]) => void
  resetSettings: () => void
  dismissError: () => void
  frameName: string | null
  onFramePick: (file: File | null) => void
}

/** Two placeholder sheets while the canvases rasterise. Skeletons, not spinners. */
function LoadingSheets() {
  return (
    <div className="stage" aria-busy="true">
      <span className="stage__count">Rendering…</span>
      {[0, 1].map((i) => (
        <div className="sheet" key={i}>
          <div className="sheet__head">
            <Skeleton height="1.75rem" width="14rem" />
          </div>
          <div className="sheet__canvas">
            <div className="skeleton" style={{ aspectRatio: '16 / 9' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * The empty state teaches the interface: it names what you'll get, and what the
 * files will be called, because the next step is always an import elsewhere.
 */
function EmptyState({ mode, selection }: { mode: OutputMode; selection: PassageSelection | null }) {
  const isLT = mode === 'lowerThird'

  // Illustrative only: the real page count isn't known until the text is laid
  // out, so show the first two names the current selection would produce.
  let example: string[] = []
  if (selection && selection.endVerse > selection.startVerse) {
    const { englishBook, chapter, startVerse, endVerse } = selection
    const total = isLT ? endVerse - startVerse + 1 : 2
    const second = isLT
      ? { startVerse: startVerse + 1, endVerse: startVerse + 1 }
      : { startVerse: startVerse + 1, endVerse }
    example = [
      pageFileName({ englishBook, chapter }, { startVerse, endVerse: startVerse }, 0, total),
      pageFileName({ englishBook, chapter }, second, 1, total),
    ]
  }

  return (
    <div className="empty">
      <IconPhoto size={28} className="empty__icon" aria-hidden="true" />
      <p className="empty__title">Your images will appear here</p>
      <p className="empty__body">
        {isLT
          ? 'You’ll get one transparent PNG per verse, ready to drop over live video in OBS or vMix.'
          : 'You’ll get one 1920×1080 PNG per screenful of text, split wherever a verse no longer fits.'}
      </p>
      {example.length > 0 && (
        <ul className="empty__list">
          <li>
            <code>{example[0]}</code>
          </li>
          <li>
            <code>{example[1]}</code>
          </li>
          <li>Numbered so they sort in reading order when you import them.</li>
        </ul>
      )}
    </div>
  )
}

export default function ExportStage({
  state,
  mode,
  selection,
  settings,
  update,
  resetSettings,
  dismissError,
  frameName,
  onFramePick,
}: Props) {
  // Declared before the early returns below — hook order must not vary.
  const [backdrop, setBackdrop] = useState<Backdrop>('dark')

  if (state.status === 'error' && state.error) {
    return (
      <div className="alert" role="alert">
        <IconAlertCircle size={18} className="alert__icon" aria-hidden="true" />
        <div style={{ flex: 1 }}>
          <p className="alert__title">That passage didn’t load</p>
          <p>{state.error}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={dismissError}>
          Dismiss
        </Button>
      </div>
    )
  }

  if (state.status === 'fetching' || state.status === 'rendering') return <LoadingSheets />

  if (state.status !== 'done' || state.pages.length === 0 || !state.bookInfo) {
    return <EmptyState mode={mode} selection={selection} />
  }

  const { pages, bookInfo } = state
  const isLT = mode === 'lowerThird'

  return (
    <div className="export">
      <div className="stage">
        <div className="stage__toolbar">
          <span className="stage__count">
            {pages.length} {pages.length === 1 ? 'image' : 'images'}
          </span>
          <div className="stage__tools">
            {isLT && (
              <Segmented
                label="Preview the overlay against"
                value={backdrop}
                onChange={setBackdrop}
                options={[
                  { value: 'dark', label: 'Dark' },
                  { value: 'light', label: 'Light' },
                  { value: 'checker', label: 'Checker' },
                ]}
              />
            )}
            {pages.length > 1 && <BulkDownload pages={pages} bookInfo={bookInfo} />}
          </div>
        </div>

        {isLT && (
          <p className="stage__note">
            The overlay is transparent. This backing shows how it will read over your
            video — it isn’t saved into the PNG.
          </p>
        )}

        {pages.map((page, i) => (
          <ImageCard
            key={`${page.startVerse}-${i}`}
            page={page}
            bookInfo={bookInfo}
            index={i}
            total={pages.length}
            backdrop={isLT ? backdrop : 'plain'}
          />
        ))}
      </div>

      <RenderControls
        settings={settings}
        update={update}
        reset={resetSettings}
        mode={mode}
        frameName={frameName}
        onFramePick={onFramePick}
      />
    </div>
  )
}
