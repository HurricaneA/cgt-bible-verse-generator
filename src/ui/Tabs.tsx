import { useRef } from 'react'
import type { ReactNode } from 'react'

export interface TabDef<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface Props<T extends string> {
  label: string
  value: T
  onChange: (v: T) => void
  tabs: TabDef<T>[]
  /** Owned by the parent so <TabPanel> can point back at the right tab. */
  id: string
}

/** ARIA tablist with manual activation and roving tabindex. */
export function TabList<T extends string>({ label, value, onChange, tabs, id }: Props<T>) {
  const refs = useRef(new Map<T, HTMLButtonElement>())

  function onKeyDown(e: React.KeyboardEvent) {
    const i = tabs.findIndex((t) => t.value === value)
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next < 0) return
    e.preventDefault()
    const t = tabs[next]
    onChange(t.value)
    refs.current.get(t.value)?.focus()
  }

  return (
    <div className="tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((t) => {
        const selected = t.value === value
        return (
          <button
            key={t.value}
            ref={(el) => {
              if (el) refs.current.set(t.value, el)
              else refs.current.delete(t.value)
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${t.value}`}
            className="tab"
            aria-selected={selected}
            aria-controls={`${id}-panel-${t.value}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.value)}
          >
            {t.icon}
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({
  id,
  value,
  children,
}: {
  id: string
  value: string
  children: ReactNode
}) {
  return (
    <div role="tabpanel" id={`${id}-panel-${value}`} aria-labelledby={`${id}-tab-${value}`}>
      {children}
    </div>
  )
}
