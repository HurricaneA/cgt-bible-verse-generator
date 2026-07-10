import { useEffect, useState } from 'react'
import { IconArrowRight } from '@tabler/icons-react'
import { Combobox, type Option } from '../ui/Combobox'
import { Button } from '../ui/Button'
import { tamilBookNames } from '../lib/bible-data'
import { getBookChapterNums, getChapterVerseNums } from '../lib/lookup-verses'
import type { PassageSelection } from '../types'

const BOOK_OPTIONS: Option[] = Object.keys(tamilBookNames).map((b) => ({
  value: b,
  label: b,
  sub: tamilBookNames[b],
}))

const numOptions = (nums: string[]): Option[] => nums.map((n) => ({ value: n, label: n }))

interface Props {
  onGenerate: (selection: PassageSelection) => void
  onSelectionChange: (selection: PassageSelection | null) => void
  busy: boolean
}

export default function PassagePicker({ onGenerate, onSelectionChange, busy }: Props) {
  const [book, setBook] = useState<string | null>(null)
  const [chapter, setChapter] = useState<string | null>(null)
  const [startVerse, setStartVerse] = useState<string | null>(null)
  const [endVerse, setEndVerse] = useState<string | null>(null)

  const [chapterNums, setChapterNums] = useState<string[]>([])
  const [verseNums, setVerseNums] = useState<string[]>([])
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [loadingVerses, setLoadingVerses] = useState(false)

  useEffect(() => {
    setChapter(null)
    setStartVerse(null)
    setEndVerse(null)
    setChapterNums([])
    setVerseNums([])
    if (!book) return

    let cancelled = false
    setLoadingChapters(true)
    getBookChapterNums(book)
      .then((nums) => !cancelled && setChapterNums(nums.map(String)))
      .finally(() => !cancelled && setLoadingChapters(false))
    return () => {
      cancelled = true
    }
  }, [book])

  useEffect(() => {
    setStartVerse(null)
    setEndVerse(null)
    setVerseNums([])
    if (!book || !chapter) return

    let cancelled = false
    setLoadingVerses(true)
    getChapterVerseNums(book, chapter)
      .then((nums) => !cancelled && setVerseNums(nums.map(String)))
      .finally(() => !cancelled && setLoadingVerses(false))
    return () => {
      cancelled = true
    }
  }, [book, chapter])

  const selection: PassageSelection | null =
    book && chapter && startVerse
      ? {
          englishBook: book,
          chapter,
          startVerse: Number(startVerse),
          endVerse: Number(endVerse ?? startVerse),
        }
      : null

  // Report upward so the shell can gate the export step and preview filenames.
  useEffect(() => {
    onSelectionChange(selection)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, startVerse, endVerse])

  // "To verse" can never precede "From verse", so the impossible options are
  // simply absent rather than selectable-then-rejected.
  const endVerseOptions = startVerse
    ? verseNums.filter((n) => Number(n) >= Number(startVerse))
    : verseNums

  const verseCount = selection ? selection.endVerse - selection.startVerse + 1 : 0

  return (
    <>
      <div className="passage-grid">
        <Combobox
          label="Book"
          placeholder="Search 66 books…"
          searchable
          options={BOOK_OPTIONS}
          value={book}
          onChange={setBook}
          disabled={busy}
        />
        <Combobox
          label="Chapter"
          placeholder="—"
          options={numOptions(chapterNums)}
          value={chapter}
          onChange={setChapter}
          disabled={busy || !book}
          loading={loadingChapters}
        />
        <Combobox
          label="From verse"
          placeholder="—"
          options={numOptions(verseNums)}
          value={startVerse}
          onChange={(v) => {
            setStartVerse(v)
            if (endVerse && Number(endVerse) < Number(v)) setEndVerse(null)
          }}
          disabled={busy || !chapter}
          loading={loadingVerses}
        />
        <Combobox
          label="To verse"
          placeholder="Same"
          hint="Optional"
          options={numOptions(endVerseOptions)}
          value={endVerse}
          onChange={setEndVerse}
          disabled={busy || !startVerse}
        />
      </div>

      <div className="passage-actions">
        <Button
          variant="primary"
          disabled={!selection || busy}
          loading={busy}
          onClick={() => selection && onGenerate(selection)}
        >
          Generate images
          {!busy && <IconArrowRight size={16} aria-hidden="true" />}
        </Button>

        {selection && !busy && (
          <p className="passage-summary">
            <strong>
              {selection.englishBook} {selection.chapter}:{selection.startVerse}
              {verseCount > 1 && `–${selection.endVerse}`}
            </strong>{' '}
            · {verseCount} {verseCount === 1 ? 'verse' : 'verses'}
          </p>
        )}
      </div>
    </>
  )
}
