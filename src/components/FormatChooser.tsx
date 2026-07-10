import { useId } from 'react'
import type { OutputMode } from '../types'

interface Props {
  value: OutputMode
  onChange: (v: OutputMode) => void
}

/** Miniature of a full 16:9 slide: title rule, then verse lines. */
function SlideThumb() {
  return (
    <div className="format__thumb format__thumb--slide" aria-hidden="true">
      <span className="format__bar" style={{ width: '46%', opacity: 0.75 }} />
      <span className="format__bar" style={{ width: '100%', marginTop: 6 }} />
      <span className="format__bar" style={{ width: '92%' }} />
      <span className="format__bar" style={{ width: '68%' }} />
    </div>
  )
}

/** Miniature of the overlay: checkerboard = transparent, box pinned bottom. */
function LowerThirdThumb() {
  return (
    <div className="format__thumb format__thumb--lt" aria-hidden="true">
      <div className="format__ltbox">
        <span className="format__bar" style={{ width: '100%' }} />
        <span className="format__bar" style={{ width: '72%' }} />
      </div>
    </div>
  )
}

const FORMATS: {
  value: OutputMode
  name: string
  desc: string
  thumb: () => React.JSX.Element
}[] = [
  {
    value: 'slide',
    name: 'Full slide',
    desc: '1920×1080 PNG with a solid background. Tamil and English reference. Drops straight into a ProPresenter slide.',
    thumb: SlideThumb,
  },
  {
    value: 'lowerThird',
    name: 'Lower third',
    desc: 'Transparent PNG overlay, one verse per image. Sits over live video in OBS or vMix.',
    thumb: LowerThirdThumb,
  },
]

export default function FormatChooser({ value, onChange }: Props) {
  const name = useId()
  return (
    <div className="formats" role="radiogroup" aria-label="Output format">
      {FORMATS.map((f) => {
        const Thumb = f.thumb
        return (
          <label key={f.value} className="format">
            <input
              className="visually-hidden"
              type="radio"
              name={name}
              value={f.value}
              checked={value === f.value}
              onChange={() => onChange(f.value)}
            />
            <Thumb />
            <span>
              <span className="format__name">{f.name}</span>
              <span className="format__desc">{f.desc}</span>
            </span>
          </label>
        )
      })}
    </div>
  )
}
