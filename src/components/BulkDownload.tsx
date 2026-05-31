import JSZip from 'jszip'
import { Button } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import type { GeneratedPage, BookInfo } from '../types'

interface Props {
  pages: GeneratedPage[]
  bookInfo: BookInfo
}

export default function BulkDownload({ pages, bookInfo }: Props) {
  async function handleDownloadAll() {
    const zip = new JSZip()

    await Promise.all(
      pages.map(
        ({ canvas }, i) =>
          new Promise<void>((resolve) =>
            canvas.toBlob((blob) => {
              zip.file(`image-${i + 1}.png`, blob!)
              resolve()
            }),
          ),
      ),
    )

    const pad = (n: number) => String(n).padStart(2, '0')
    const now = new Date()
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const base = `${bookInfo.englishBook.replace(/ /g, '_')}_${bookInfo.chapter}_${bookInfo.startVerse}-${bookInfo.endVerse}_${ts}`

    const blob = await zip.generateAsync({ type: 'blob' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${base}.zip`
    link.click()
    URL.revokeObjectURL(link.href)

    notifications.show({
      message: `Downloaded ${pages.length} images as ${base}.zip`,
      color: 'teal',
      autoClose: 3500,
    })
  }

  return (
    <Button variant="outline" onClick={handleDownloadAll}>
      Download All ({pages.length} images as ZIP)
    </Button>
  )
}
