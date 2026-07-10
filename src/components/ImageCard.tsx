import { IconCopy, IconDownload } from '@tabler/icons-react'
import { IconButton } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { pageFileName, pageLabel } from '../lib/filename'
import type { GeneratedPage, BookInfo, Backdrop } from '../types'

interface Props {
  page: GeneratedPage
  bookInfo: BookInfo
  index: number
  total: number
  /** Preview-only backing behind a transparent PNG; `plain` for opaque slides. */
  backdrop: Backdrop | 'plain'
}

export default function ImageCard({ page, bookInfo, index, total, backdrop }: Props) {
  const toast = useToast()
  const fileName = pageFileName(bookInfo, page, index, total)
  const label = pageLabel(bookInfo, page)

  async function handleCopy() {
    try {
      const blob = await new Promise<Blob | null>((res) => page.canvas.toBlob(res))
      if (!blob) throw new Error('Could not read the image')
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      toast('success', `${label} copied to the clipboard`)
    } catch {
      toast('error', 'Your browser blocked the copy. Use Download instead.')
    }
  }

  function handleDownload() {
    const link = document.createElement('a')
    link.download = fileName
    link.href = page.dataUrl
    link.click()
  }

  return (
    <figure className="sheet">
      <figcaption className="sheet__head">
        <span style={{ minWidth: 0 }}>
          <span className="sheet__ref">{label}</span>
          <span className="sheet__file" style={{ display: 'block' }}>
            {fileName}
          </span>
        </span>
        <span className="sheet__actions">
          <IconButton label={`Copy ${label} to clipboard`} onClick={handleCopy}>
            <IconCopy size={17} />
          </IconButton>
          <IconButton label={`Download ${fileName}`} onClick={handleDownload}>
            <IconDownload size={17} />
          </IconButton>
        </span>
      </figcaption>
      {/* Never preview a transparent overlay on the app's own light surface —
          its white text would simply vanish. */}
      <div className="sheet__canvas" data-backdrop={backdrop}>
        <img src={page.dataUrl} alt={`Rendered image of ${label}`} />
      </div>
    </figure>
  )
}
