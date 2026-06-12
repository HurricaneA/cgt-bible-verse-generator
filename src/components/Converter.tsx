import { useState } from 'react'
import {
  Stack,
  SegmentedControl,
  SimpleGrid,
  Textarea,
  Text,
  Group,
  CopyButton,
  Button,
  Center,
} from '@mantine/core'
import { IconArrowsExchange, IconCheck, IconCopy } from '@tabler/icons-react'
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

  const output =
    direction === 'u2b' ? unicodeToBamini(input) : baminiToUnicode(input)

  const inputIsUnicode = direction === 'u2b'
  const inputFont = inputIsUnicode ? UNICODE_FONT : BAMINI_FONT
  const outputFont = inputIsUnicode ? BAMINI_FONT : UNICODE_FONT
  const inputLabel = inputIsUnicode ? 'Unicode Tamil' : 'Bamini'
  const outputLabel = inputIsUnicode ? 'Bamini' : 'Unicode Tamil'

  function setDir(d: Direction) {
    setDirection(d)
    setInput('') // clear when switching direction
  }

  function swap() {
    setDir(direction === 'u2b' ? 'b2u' : 'u2b')
  }

  return (
    <Stack w="100%" gap="md">
      <Center>
        <SegmentedControl
          value={direction}
          onChange={(v) => setDir(v as Direction)}
          data={[
            { label: 'Unicode → Bamini', value: 'u2b' },
            { label: 'Bamini → Unicode', value: 'b2u' },
          ]}
        />
      </Center>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Stack gap={4}>
          <Text size="sm" fw={600} c="dimmed">
            {inputLabel}
          </Text>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder={`Paste or type ${inputLabel} text…`}
            autosize
            minRows={6}
            maxRows={16}
            styles={{ input: { fontFamily: inputFont, fontSize: 18, lineHeight: 1.6 } }}
          />
        </Stack>

        <Stack gap={4}>
          <Group justify="space-between" align="center">
            <Text size="sm" fw={600} c="dimmed">
              {outputLabel}
            </Text>
            <CopyButton value={output}>
              {({ copied, copy }) => (
                <Button
                  size="compact-sm"
                  variant="light"
                  color={copied ? 'teal' : 'gray'}
                  leftSection={
                    copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                  }
                  onClick={copy}
                  disabled={!output}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              )}
            </CopyButton>
          </Group>
          <Textarea
            value={output}
            readOnly
            placeholder="Result…"
            autosize
            minRows={6}
            maxRows={16}
            styles={{ input: { fontFamily: outputFont, fontSize: 18, lineHeight: 1.6 } }}
          />
        </Stack>
      </SimpleGrid>

      <Center>
        <Button
          variant="subtle"
          color="teal"
          leftSection={<IconArrowsExchange size={16} />}
          onClick={swap}
        >
          Swap direction
        </Button>
      </Center>
    </Stack>
  )
}
