import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { IconChevronDown, IconCheck } from '@tabler/icons-react'

export interface Option {
  value: string
  label: string
  /** Optional trailing detail, e.g. the English book name. */
  sub?: string
}

interface Props {
  label: string
  value: string | null
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
  /** Show a filter input behaviour; off for short numeric lists. */
  searchable?: boolean
  hint?: string
  error?: string | null
  loading?: boolean
  /** Tamil labels need the Tamil face. */
  optionClassName?: string
}

/**
 * ARIA 1.2 editable combobox. The input doubles as the filter; the listbox is
 * absolutely positioned and every ancestor keeps `overflow: visible` so it is
 * never clipped.
 */
export function Combobox({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  searchable = false,
  hint,
  error,
  loading,
  optionClassName,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const id = useId()
  const listId = `${id}-list`
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const selected = options.find((o) => o.value === value) ?? null

  const filtered = useMemo(() => {
    if (!open || !query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sub?.toLowerCase().includes(q),
    )
  }, [options, query, open])

  // Keep the active option in view as the user arrows through.
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  // Open onto the current selection rather than the top of the list.
  useEffect(() => {
    if (!open) return
    const i = filtered.findIndex((o) => o.value === value)
    setActiveIndex(i >= 0 ? i : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function close() {
    setOpen(false)
    setQuery('')
  }

  function commit(option: Option) {
    onChange(option.value)
    close()
    inputRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault()
        if (!open) {
          setOpen(true)
          return
        }
        if (filtered.length === 0) return
        const dir = e.key === 'ArrowDown' ? 1 : -1
        setActiveIndex((i) => (i + dir + filtered.length) % filtered.length)
        break
      }
      case 'Home':
        if (open) {
          e.preventDefault()
          setActiveIndex(0)
        }
        break
      case 'End':
        if (open) {
          e.preventDefault()
          setActiveIndex(filtered.length - 1)
        }
        break
      case 'Enter':
        if (open && filtered[activeIndex]) {
          e.preventDefault()
          commit(filtered[activeIndex])
        }
        break
      case 'Escape':
        if (open) {
          e.preventDefault()
          close()
        }
        break
      case 'Tab':
        if (open) close()
        break
    }
  }

  // Closed: the input displays the selection. Open: it displays the query.
  const displayValue = open ? query : (selected?.label ?? '')

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>

      <div className="combobox" ref={rootRef} data-open={open}>
        <div className="combobox__control">
          <input
            id={id}
            ref={inputRef}
            className={`input ${optionClassName ?? ''}`}
            type="text"
            role="combobox"
            autoComplete="off"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete={searchable ? 'list' : 'none'}
            aria-activedescendant={
              open && filtered[activeIndex] ? `${id}-opt-${activeIndex}` : undefined
            }
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            disabled={disabled || loading}
            placeholder={loading ? 'Loading…' : placeholder}
            value={displayValue}
            readOnly={!searchable}
            onChange={(e) => {
              if (!searchable) return
              setQuery(e.target.value)
              setActiveIndex(0)
              if (!open) setOpen(true)
            }}
            onKeyDown={onKeyDown}
            onClick={() => !disabled && !loading && setOpen((o) => !o)}
          />
          <span className="combobox__caret" aria-hidden="true">
            <IconChevronDown size={16} />
          </span>
        </div>

        {open && (
          <ul className="combobox__list" id={listId} role="listbox" ref={listRef} aria-label={label}>
            {filtered.length === 0 && (
              <li className="combobox__empty">No match for “{query}”</li>
            )}
            {filtered.map((o, i) => {
              const isSelected = o.value === value
              return (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <li
                  key={o.value}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  data-active={i === activeIndex}
                  className={`combobox__option ${optionClassName ?? ''}`}
                  onPointerMove={() => setActiveIndex(i)}
                  onClick={() => commit(o)}
                >
                  <span>{o.label}</span>
                  {isSelected ? (
                    <IconCheck size={16} aria-hidden="true" />
                  ) : o.sub ? (
                    <span className="combobox__option-sub">{o.sub}</span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {error ? (
        <span className="field__error" id={errorId}>
          {error}
        </span>
      ) : hint ? (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}
