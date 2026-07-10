import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { IconPhoto, IconLanguage } from '@tabler/icons-react'
import { useGenerateImages } from './hooks/useGenerateImages'
import { useRenderSettings } from './hooks/useRenderSettings'
import { TabList, TabPanel } from './ui/Tabs'
import Step, { type StepState } from './components/Step'
import FormatChooser from './components/FormatChooser'
import PassagePicker from './components/PassagePicker'
import ExportStage from './components/ExportStage'
import Converter from './components/Converter'
import ThemeToggle from './components/ThemeToggle'
import type { OutputMode, PassageSelection } from './types'

type Tab = 'images' | 'converter'

const TABS = [
  { value: 'images' as const, label: 'Verse images', icon: <IconPhoto size={16} /> },
  { value: 'converter' as const, label: 'Tamil converter', icon: <IconLanguage size={16} /> },
]

export default function App() {
  const { state, generate, rerender, reset: clearResult } = useGenerateImages()
  const { settings, update, reset: resetSettings } = useRenderSettings()

  const [tab, setTab] = useState<Tab>('images')
  const [outputMode, setOutputMode] = useState<OutputMode>('slide')
  const [selection, setSelection] = useState<PassageSelection | null>(null)
  const [frame, setFrame] = useState<HTMLImageElement | null>(null)
  const [frameName, setFrameName] = useState<string | null>(null)

  const tabsId = useId()
  const exportRef = useRef<HTMLDivElement>(null)

  const busy = state.status === 'fetching' || state.status === 'rendering'
  const hasPages = state.status === 'done' && state.pages.length > 0

  // Exactly one step is "active" — the one you're standing on. A format is
  // always selected, but ticking step 1 before the user has touched anything
  // would be a lie, so it only completes once a passage exists.
  const current = hasPages || state.status === 'error' ? 3 : selection ? 2 : 1
  const stepState = (n: number): StepState =>
    n < current ? 'done' : n === current ? 'active' : 'locked'

  const handleFramePick = useCallback((file: File | null) => {
    if (!file) {
      setFrame(null)
      setFrameName(null)
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setFrame(img)
      URL.revokeObjectURL(url)
    }
    img.src = url
    setFrameName(file.name)
  }, [])

  // Live re-render the current images when a setting/mode/frame changes. No
  // re-fetch: the verses are already in hand.
  useEffect(() => {
    if (state.status === 'done') rerender(settings, { outputMode, frame })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, outputMode, frame])

  // Bring the results into view once they exist. Honours reduced-motion.
  useEffect(() => {
    if (!hasPages) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    exportRef.current?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [hasPages])

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand">
            <span className="brand__mark tamil" aria-hidden="true">
              த
            </span>
            <span className="brand__name">Tamil Bible Verse Generator</span>
          </div>
          <TabList id={tabsId} label="Sections" value={tab} onChange={setTab} tabs={TABS} />
          <ThemeToggle />
        </div>
      </header>

      <main className="main">
        {tab === 'images' ? (
          <TabPanel id={tabsId} value="images">
            <Step
              number={1}
              title="Choose the output format"
              description="This decides what each image looks like, and how many you get."
              state={stepState(1)}
            >
              <FormatChooser value={outputMode} onChange={setOutputMode} />
            </Step>

            <Step
              number={2}
              title="Pick the passage"
              description="Choose a book, a chapter, and the verses you need. Only verses that exist are offered."
              state={stepState(2)}
            >
              <PassagePicker
                busy={busy}
                onSelectionChange={setSelection}
                onGenerate={(sel) => generate(sel, settings, { outputMode, frame })}
              />
            </Step>

            <div ref={exportRef} style={{ scrollMarginTop: '5rem' }}>
              <Step
                number={3}
                title="Preview and export"
                description="Adjust anything on the right; the preview updates as you go. Then download the PNGs."
                state={stepState(3)}
                last
              >
                <ExportStage
                  state={state}
                  mode={outputMode}
                  selection={selection}
                  settings={settings}
                  update={update}
                  resetSettings={resetSettings}
                  dismissError={clearResult}
                  frameName={frameName}
                  onFramePick={handleFramePick}
                />
              </Step>
            </div>
          </TabPanel>
        ) : (
          <TabPanel id={tabsId} value="converter">
            <Converter />
          </TabPanel>
        )}
      </main>
    </>
  )
}
