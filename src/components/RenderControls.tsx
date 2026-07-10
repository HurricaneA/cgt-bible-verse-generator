import { IconRestore } from '@tabler/icons-react'
import { Button } from '../ui/Button'
import { Slider, ColorField, FileDrop, Disclosure } from '../ui/controls'
import { LIMITS, type RenderSettings } from '../lib/config'
import type { OutputMode } from '../types'

interface Props {
  settings: RenderSettings
  update: <K extends keyof RenderSettings>(key: K, value: RenderSettings[K]) => void
  reset: () => void
  mode: OutputMode
  frameName: string | null
  onFramePick: (file: File | null) => void
}

const TEXT_SWATCHES = ['#ffffff', '#000000', '#ffd43b', '#ff6b6b', '#4dabf7', '#69db7c']
const BG_SWATCHES = ['#000000', '#ffffff', '#1a1b1e', '#2b2d42', '#0b3d2e', '#3b0d11']

export default function RenderControls({
  settings,
  update,
  reset,
  mode,
  frameName,
  onFramePick,
}: Props) {
  const isLowerThird = mode === 'lowerThird'

  return (
    <aside className="panel" aria-label="Customise the rendered image">
      <div className="panel__head">
        <h3 className="panel__title">Customise</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          leftSection={<IconRestore size={14} aria-hidden="true" />}
        >
          Reset
        </Button>
      </div>

      <div className="panel__body">
        {isLowerThird ? (
          <>
            <Disclosure title="Border image" defaultOpen>
              <FileDrop
                label="Drop an image, or click to browse"
                hint="Fills the ring around the verse. PNG or JPG."
                fileName={frameName}
                onPick={onFramePick}
              />
            </Disclosure>

            <Disclosure title="Box & ring">
              <Slider
                label="Side margin"
                unit="px"
                value={settings.ltSideMargin}
                {...LIMITS.ltSideMargin}
                onChange={(v) => update('ltSideMargin', v)}
              />
              <Slider
                label="Bottom margin"
                unit="px"
                value={settings.ltBottomMargin}
                {...LIMITS.ltBottomMargin}
                onChange={(v) => update('ltBottomMargin', v)}
              />
              <Slider
                label="Box height"
                unit="px"
                value={settings.ltBoxHeight}
                {...LIMITS.ltBoxHeight}
                onChange={(v) => update('ltBoxHeight', v)}
              />
              <Slider
                label="Ring — sides"
                unit="px"
                value={settings.ltBorderSide}
                {...LIMITS.ltBorderSide}
                onChange={(v) => update('ltBorderSide', v)}
              />
              <Slider
                label="Ring — top"
                unit="px"
                value={settings.ltBorderTop}
                {...LIMITS.ltBorderTop}
                onChange={(v) => update('ltBorderTop', v)}
              />
              <Slider
                label="Ring — bottom"
                unit="px"
                value={settings.ltBorderBottom}
                {...LIMITS.ltBorderBottom}
                onChange={(v) => update('ltBorderBottom', v)}
              />
              <Slider
                label="Corner radius"
                unit="px"
                value={settings.ltCornerRadius}
                {...LIMITS.ltCornerRadius}
                onChange={(v) => update('ltCornerRadius', v)}
              />
              <Slider
                label="Inner padding"
                unit="px"
                value={settings.ltPadding}
                {...LIMITS.ltPadding}
                onChange={(v) => update('ltPadding', v)}
              />
              <Slider
                label="Inner fill opacity"
                value={settings.ltInnerOpacity}
                {...LIMITS.ltInnerOpacity}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => update('ltInnerOpacity', Math.round(v * 20) / 20)}
              />
            </Disclosure>

            <Disclosure title="Verse text">
              <Slider
                label="Font size"
                unit="pt"
                value={settings.ltVerseFontPt}
                {...LIMITS.ltVerseFontPt}
                onChange={(v) => update('ltVerseFontPt', v)}
              />
              <Slider
                label="Line spacing"
                unit="pt"
                value={settings.ltLineSpacingPt}
                {...LIMITS.ltLineSpacingPt}
                onChange={(v) => update('ltLineSpacingPt', v)}
              />
            </Disclosure>
          </>
        ) : (
          <>
            <Disclosure title="Title" defaultOpen>
              <Slider
                label="Inset from edges"
                unit="px"
                value={settings.titleInset}
                {...LIMITS.titleInset}
                onChange={(v) => update('titleInset', v)}
              />
              <Slider
                label="Font size"
                unit="pt"
                value={settings.titleFontPt}
                {...LIMITS.titleFontPt}
                onChange={(v) => update('titleFontPt', v)}
              />
              <Slider
                label="Vertical position"
                unit="px"
                value={settings.titleY}
                {...LIMITS.titleY}
                onChange={(v) => update('titleY', v)}
              />
            </Disclosure>

            <Disclosure title="Verse text" defaultOpen>
              <Slider
                label="Font size"
                unit="pt"
                value={settings.verseFontPt}
                {...LIMITS.verseFontPt}
                onChange={(v) => update('verseFontPt', v)}
              />
              <Slider
                label="Line spacing"
                unit="pt"
                value={settings.lineSpacingPt}
                {...LIMITS.lineSpacingPt}
                onChange={(v) => update('lineSpacingPt', v)}
              />
            </Disclosure>
          </>
        )}

        <Disclosure title="Colours">
          <ColorField
            label="Text colour"
            value={settings.textColor}
            onChange={(v) => update('textColor', v)}
            swatches={TEXT_SWATCHES}
          />
          <ColorField
            label={isLowerThird ? 'Inner fill colour' : 'Background colour'}
            value={settings.bgColor}
            onChange={(v) => update('bgColor', v)}
            swatches={BG_SWATCHES}
          />
        </Disclosure>
      </div>
    </aside>
  )
}
