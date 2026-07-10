import { useId, useState } from 'react'
import { IconArrowsExchange, IconCheck, IconCopy } from '@tabler/icons-react'
import { Button } from '../ui/Button'
import { Segmented } from '../ui/controls'
import { unicodeToBamini, baminiToUnicode } from '../lib/tamil-convert'

type Direction = 'u2b' | 'b2u'

const UNICODE_FONT = "'Noto Sans Tamil', sans-serif"
// Bamini is ASCII codes — show them raw (monospace) so the conversion is
// visible, rather than rendering them through Tharmini (which would look like
// Tamil and be indistinguishable from the Unicode side).
const BAMINI_FONT = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"

export default function Converter() {
  const [direction, setDirection] = useState<Direction>('u2b')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const inId = useId()
  const outId = useId()

  const output = direction === 'u2b' ? unicodeToBamini(input) : baminiToUnicode(input)

  const inputIsUnicode = direction === 'u2b'
  const inputLabel = inputIsUnicode ? 'Unicode Tamil' : 'Bamini'
  const outputLabel = inputIsUnicode ? 'Bamini' : 'Unicode Tamil'

  function setDir(d: Direction) {
    setDirection(d)
    setInput('') // the text is meaningless in the other encoding
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the textarea is still selectable */
    }
  }

  return (
    <div className="converter">
      <p className="prose" style={{ textAlign: 'center' }}>
        Convert between Unicode Tamil and the legacy Bamini encoding that older
        presentation software still expects.
      </p>

      <Segmented
        label="Conversion direction"
        value={direction}
        onChange={setDir}
        options={[
          { value: 'u2b', label: 'Unicode → Bamini' },
          { value: 'b2u', label: 'Bamini → Unicode' },
        ]}
      />

      <div className="converter__panes">
        <div className="pane">
          <div className="pane__head">
            <label className="pane__label" htmlFor={inId}>
              {inputLabel}
            </label>
          </div>
          <textarea
            id={inId}
            className="pane__area"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste or type ${inputLabel} text…`}
            spellCheck={false}
            style={{ fontFamily: inputIsUnicode ? UNICODE_FONT : BAMINI_FONT }}
          />
        </div>

        <div className="pane">
          <div className="pane__head">
            <label className="pane__label" htmlFor={outId}>
              {outputLabel}
            </label>
            <Button
              size="sm"
              variant="ghost"
              onClick={copy}
              disabled={!output}
              leftSection={
                copied ? (
                  <IconCheck size={14} aria-hidden="true" />
                ) : (
                  <IconCopy size={14} aria-hidden="true" />
                )
              }
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <textarea
            id={outId}
            className="pane__area"
            value={output}
            readOnly
            placeholder="Result appears here…"
            spellCheck={false}
            style={{ fontFamily: inputIsUnicode ? BAMINI_FONT : UNICODE_FONT }}
          />
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={() => setDir(direction === 'u2b' ? 'b2u' : 'u2b')}
        leftSection={<IconArrowsExchange size={16} aria-hidden="true" />}
      >
        Swap direction
      </Button>
    </div>
  )
}
