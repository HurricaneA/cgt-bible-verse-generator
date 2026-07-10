import { useState } from 'react'
import JSZip from 'jszip'
import { IconDownload } from '@tabler/icons-react'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { pageFileName } from '../lib/filename'
import type { GeneratedPage, BookInfo } from '../types'

interface Props {
  pages: GeneratedPage[]
  bookInfo: BookInfo
}

/** Timestamp keeps repeated exports of the same passage from colliding. */
function stamp(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  )
}

export default function BulkDownload({ pages, bookInfo }: Props) {
  const [zipping, setZipping] = useState(false)
  const toast = useToast()

  async function handleDownloadAll() {
    setZipping(true)
    try {
      const zip = new JSZip()
      await Promise.all(
        pages.map(
          (page, i) =>
            new Promise<void>((resolve, reject) =>
              page.canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Could not encode an image'))
                zip.file(pageFileName(bookInfo, page, i, pages.length), blob)
                resolve()
              }),
            ),
        ),
      )

      const base =
        `${bookInfo.englishBook.replace(/ /g, '_')}_${bookInfo.chapter}` +
        `_${bookInfo.startVerse}-${bookInfo.endVerse}_${stamp(new Date())}`

      const blob = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${base}.zip`
      link.click()
      URL.revokeObjectURL(link.href)

      toast('success', `Saved ${pages.length} images to ${base}.zip`)
    } catch {
      toast('error', 'Could not build the ZIP. Try downloading images one at a time.')
    } finally {
      setZipping(false)
    }
  }

  return (
    <Button
      variant="primary"
      loading={zipping}
      onClick={handleDownloadAll}
      leftSection={<IconDownload size={16} aria-hidden="true" />}
    >
      {zipping ? 'Preparing ZIP…' : `Download all ${pages.length}`}
    </Button>
  )
}
