import { useEffect, useRef } from 'react'
import { Paper, Group, Button, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import type { GeneratedPage } from '../types'

interface Props {
  page: GeneratedPage
  index: number
  total: number
}

export default function ImageCard({ page, index, total }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    el.innerHTML = ''
    const c = page.canvas
    c.style.cssText = 'max-width:100%;height:auto;display:block;border-radius:6px;'
    el.appendChild(c)
  }, [page.canvas])

  async function handleCopy() {
    try {
      const blob = await new Promise<Blob>((res) =>
        page.canvas.toBlob((b) => res(b!)),
      )
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      notifications.show({
        message: 'Image copied to clipboard',
        color: 'teal',
        autoClose: 2500,
      })
    } catch {
      notifications.show({
        message: 'Copy failed — try downloading instead',
        color: 'red',
        autoClose: 3000,
      })
    }
  }

  function handleDownload() {
    const link = document.createElement('a')
    link.download = total > 1 ? `bible-verse-${index + 1}.png` : 'bible-verse.png'
    link.href = page.dataUrl
    link.click()
  }

  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      {total > 1 && (
        <Text size="sm" c="dimmed" mb={8}>
          Image {index + 1} of {total}
        </Text>
      )}
      <div ref={wrapperRef} />
      <Group mt="sm" gap="xs">
        <Button variant="filled" onClick={handleDownload}>
          {total > 1 ? `Download ${index + 1}` : 'Download PNG'}
        </Button>
        <Button variant="light" onClick={handleCopy}>
          Copy to Clipboard
        </Button>
      </Group>
    </Paper>
  )
}
