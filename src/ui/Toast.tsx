import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { IconCircleCheck, IconAlertCircle, IconX } from '@tabler/icons-react'
import { IconButton } from './Button'

type Tone = 'success' | 'error'

interface Toast {
  id: number
  tone: Tone
  message: string
}

const ToastContext = createContext<((tone: Tone, message: string) => void) | null>(null)

const DURATION_MS = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const show = useCallback(
    (tone: Tone, message: string) => {
      const id = nextId.current++
      setToasts((t) => [...t, { id, tone, message }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION_MS),
      )
    },
    [dismiss],
  )

  // Clear pending timers if the provider unmounts mid-flight.
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* Polite live region: announced without interrupting the current task. */}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            <span className="toast__icon" aria-hidden="true">
              {t.tone === 'success' ? (
                <IconCircleCheck size={18} />
              ) : (
                <IconAlertCircle size={18} />
              )}
            </span>
            <span className="toast__body">{t.message}</span>
            <IconButton label="Dismiss notification" onClick={() => dismiss(t.id)}>
              <IconX size={16} />
            </IconButton>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useToast must be used inside <ToastProvider>')
  return show
}
