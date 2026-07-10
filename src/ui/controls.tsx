import { useId, useRef, useState } from 'react'
import type { CSSProperties, DragEvent, ReactNode } from 'react'
import { IconChevronRight, IconPhotoUp, IconX } from '@tabler/icons-react'
import { IconButton } from './Button'

/* ---- Slider -------------------------------------------------------------
 * Native <input type=range>: keyboard, ARIA and screen-reader support for
 * free. Only the skin is ours. `--pct` drives the filled portion of the track.
 */

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  /** Rendered readout; defaults to `${value}${unit}`. */
  format?: (v: number) => string
  unit?: string
  disabled?: boolean
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  unit = '',
  disabled,
}: SliderProps) {
  const id = useId()
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0
  const readout = format ? format(value) : `${value}${unit}`

  return (
    <div>
      <div className="slider__head">
        <label className="slider__label" htmlFor={id}>
          {label}
        </label>
        <span className="slider__value" aria-hidden="true">
          {readout}
        </span>
      </div>
      <input
        id={id}
        className="slider__input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={readout}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` } as CSSProperties}
      />
    </div>
  )
}

/* ---- ColorField --------------------------------------------------------- */

const HEX = /^#[0-9a-f]{6}$/i

interface ColorFieldProps {
  label: string
  value: string
  onChange: (hex: string) => void
  swatches?: string[]
}

export function ColorField({ label, value, onChange, swatches = [] }: ColorFieldProps) {
  const id = useId()
  // Free text can be mid-edit ("#ff"), so the input keeps its own draft and
  // only publishes once the value is a complete hex.
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? value

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="colorfield">
        <span className="colorfield__swatch">
          <input
            type="color"
            value={HEX.test(value) ? value : '#000000'}
            onChange={(e) => {
              setDraft(null)
              onChange(e.target.value)
            }}
            aria-label={`${label} — colour picker`}
          />
        </span>
        <input
          id={id}
          className="input colorfield__hex"
          type="text"
          spellCheck={false}
          value={shown}
          aria-invalid={!HEX.test(shown) || undefined}
          onChange={(e) => {
            const next = e.target.value
            setDraft(next)
            if (HEX.test(next)) onChange(next)
          }}
          onBlur={() => setDraft(null)}
        />
      </div>
      {swatches.length > 0 && (
        <div className="swatches">
          {swatches.map((s) => (
            <button
              key={s}
              type="button"
              className="swatches__item"
              style={{ background: s }}
              aria-label={`Use ${s}`}
              aria-pressed={s.toLowerCase() === value.toLowerCase()}
              onClick={() => {
                setDraft(null)
                onChange(s)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- FileDrop ----------------------------------------------------------- */

interface FileDropProps {
  label: string
  hint: string
  fileName: string | null
  onPick: (file: File | null) => void
  accept?: string
}

export function FileDrop({ label, hint, fileName, onPick, accept = 'image/*' }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onPick(file)
  }

  if (fileName) {
    return (
      <div className="filepill">
        <span className="filepill__name" title={fileName}>
          {fileName}
        </span>
        <IconButton
          label="Remove border image"
          onClick={() => {
            onPick(null)
            if (inputRef.current) inputRef.current.value = ''
          }}
        >
          <IconX size={16} />
        </IconButton>
      </div>
    )
  }

  return (
    <>
      {/* The label *is* the drop target, so click and keyboard both reach the
          input without a redundant tabbable wrapper. */}
      <label
        className="filedrop"
        data-dragging={dragging}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <IconPhotoUp size={22} aria-hidden="true" />
        <span className="filedrop__title">{label}</span>
        <span className="filedrop__hint">{hint}</span>
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept={accept}
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
      </label>
    </>
  )
}

/* ---- Segmented (radiogroup) ---------------------------------------------
 * Real radios under the skin: arrow keys, roving focus and grouping all come
 * from the platform.
 */

interface SegmentedProps<T extends string> {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}

export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: SegmentedProps<T>) {
  const name = useId()
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o.value} className="segmented__option">
          <input
            className="visually-hidden"
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}

/* ---- Disclosure --------------------------------------------------------- */

export function Disclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className="disclosure">
      <button
        type="button"
        className="disclosure__trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{title}</span>
        <IconChevronRight size={16} className="disclosure__chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="disclosure__panel" id={id}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ---- Skeleton ----------------------------------------------------------- */

export function Skeleton({ height, width = '100%' }: { height: string; width?: string }) {
  return <div className="skeleton" style={{ height, width }} aria-hidden="true" />
}
