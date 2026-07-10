import type { ReactNode } from 'react'
import { IconCheck } from '@tabler/icons-react'

export type StepState = 'active' | 'done' | 'locked'

interface Props {
  number: number
  title: string
  description: string
  state: StepState
  last?: boolean
  children: ReactNode
}

/**
 * One rung of the flow. The numbering is load-bearing here — this genuinely is
 * an ordered sequence (format, then passage, then export), and the rail is how
 * a first-time volunteer sees where they are.
 */
export default function Step({ number, title, description, state, last, children }: Props) {
  return (
    <section className="step" data-state={state} aria-current={state === 'active' || undefined}>
      <div className="step__rail" aria-hidden="true">
        <span className="step__number">
          {state === 'done' ? <IconCheck size={15} /> : number}
        </span>
        {!last && <span className="step__line" />}
      </div>
      <div className="step__body">
        <h2 className="step__title">{title}</h2>
        <p className="step__desc">{description}</p>
        <div className="step__content">{children}</div>
      </div>
    </section>
  )
}
