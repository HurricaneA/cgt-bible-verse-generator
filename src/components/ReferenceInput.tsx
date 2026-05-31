import { useState, useEffect } from 'react'
import { Group, Select, Button, Loader } from '@mantine/core'
import { tamilBookNames } from '../lib/bible-data'
import { getBookChapterNums, getChapterVerseNums } from '../lib/lookup-verses'

const BOOK_OPTIONS = Object.keys(tamilBookNames).map((b) => ({
  value: b,
  label: `${tamilBookNames[b]} - ${b}`,
}))

interface Props {
  onGenerate: (input: string) => void
  disabled: boolean
}

export default function ReferenceInput({ onGenerate, disabled }: Props) {
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

    setLoadingChapters(true)
    getBookChapterNums(book)
      .then((nums) => setChapterNums(nums.map(String)))
      .finally(() => setLoadingChapters(false))
  }, [book])

  useEffect(() => {
    setStartVerse(null)
    setEndVerse(null)
    setVerseNums([])
    if (!book || !chapter) return

    setLoadingVerses(true)
    getChapterVerseNums(book, chapter)
      .then((nums) => setVerseNums(nums.map(String)))
      .finally(() => setLoadingVerses(false))
  }, [book, chapter])

  function handleGenerate() {
    if (!book || !chapter || !startVerse) return
    const end = endVerse ?? startVerse
    const ref =
      startVerse === end
        ? `${book} ${chapter}:${startVerse}`
        : `${book} ${chapter}:${startVerse}-${end}`
    onGenerate(ref)
  }

  const canGenerate = !!book && !!chapter && !!startVerse && !disabled

  const endVerseOptions = startVerse
    ? verseNums.filter((n) => parseInt(n) >= parseInt(startVerse))
    : verseNums

  const endVerseError =
    endVerse && startVerse && parseInt(endVerse) < parseInt(startVerse)
      ? 'Must be ≥ From verse'
      : null

  return (
    <Group align="flex-end" gap="sm" wrap="wrap" justify="center">
      <Select
        label="Book"
        placeholder="Select book"
        data={BOOK_OPTIONS}
        searchable
        value={book}
        onChange={(val) => {
          setBook(val)
        }}
        disabled={disabled}
        w={200}
      />
      <Select
        label="Chapter"
        placeholder={loadingChapters ? 'Loading…' : 'Select'}
        data={chapterNums}
        value={chapter}
        onChange={(val) => {
          setChapter(val)
        }}
        disabled={disabled || chapterNums.length === 0}
        rightSection={loadingChapters ? <Loader size="xs" /> : undefined}
        w={120}
      />
      <Select
        label="From verse"
        placeholder={loadingVerses ? 'Loading…' : 'Select'}
        data={verseNums}
        value={startVerse}
        onChange={(v) => {
          setStartVerse(v)
          if (endVerse && v && parseInt(endVerse) < parseInt(v)) setEndVerse(null)
        }}
        disabled={disabled || verseNums.length === 0}
        rightSection={loadingVerses ? <Loader size="xs" /> : undefined}
        w={130}
      />
      <Select
        label="To verse"
        placeholder="optional"
        data={endVerseOptions}
        value={endVerse}
        onChange={setEndVerse}
        disabled={disabled || !startVerse}
        error={endVerseError}
        clearable
        w={130}
      />
      <Button
        onClick={handleGenerate}
        disabled={!canGenerate}
        loading={disabled}
        size="md"
      >
        Generate
      </Button>
    </Group>
  )
}
