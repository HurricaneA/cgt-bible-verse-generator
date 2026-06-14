import {
  Paper,
  Stack,
  Group,
  Text,
  Slider,
  ColorInput,
  Button,
  Divider,
} from '@mantine/core'
import { IconRestore } from '@tabler/icons-react'
import { TITLE_LIMITS, type RenderSettings } from '../lib/config'

interface Props {
  settings: RenderSettings
  update: <K extends keyof RenderSettings>(key: K, value: RenderSettings[K]) => void
  reset: () => void
}

function SliderField({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  unit: string
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <Stack gap={2}>
      <Group justify="space-between" gap={4}>
        <Text size="sm">{label}</Text>
        <Text size="sm" c="dimmed" ff="monospace">
          {value}
          {unit}
        </Text>
      </Group>
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        color="teal"
        label={null}
      />
    </Stack>
  )
}

export default function RenderControls({ settings, update, reset }: Props) {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={600}>Customize</Text>
          <Button
            size="compact-xs"
            variant="subtle"
            color="gray"
            leftSection={<IconRestore size={14} />}
            onClick={reset}
          >
            Reset
          </Button>
        </Group>

        <Divider label="Title" labelPosition="left" />

        <SliderField
          label="Inset (from edges)"
          value={settings.titleInset}
          unit="px"
          {...TITLE_LIMITS.titleInset}
          onChange={(v) => update('titleInset', v)}
        />
        <SliderField
          label="Font size"
          value={settings.titleFontPt}
          unit="pt"
          {...TITLE_LIMITS.titleFontPt}
          onChange={(v) => update('titleFontPt', v)}
        />
        <SliderField
          label="Vertical position"
          value={settings.titleY}
          unit="px"
          {...TITLE_LIMITS.titleY}
          onChange={(v) => update('titleY', v)}
        />

        <Divider label="Verses" labelPosition="left" />

        <SliderField
          label="Font size"
          value={settings.verseFontPt}
          unit="pt"
          {...TITLE_LIMITS.verseFontPt}
          onChange={(v) => update('verseFontPt', v)}
        />
        <SliderField
          label="Line spacing"
          value={settings.lineSpacingPt}
          unit="pt"
          {...TITLE_LIMITS.lineSpacingPt}
          onChange={(v) => update('lineSpacingPt', v)}
        />

        <Divider label="Colours" labelPosition="left" />

        <ColorInput
          label="Text colour"
          format="hex"
          value={settings.textColor}
          onChange={(v) => update('textColor', v)}
          swatches={['#ffffff', '#000000', '#ffd43b', '#ff6b6b', '#4dabf7', '#69db7c']}
        />
        <ColorInput
          label="Background colour"
          format="hex"
          value={settings.bgColor}
          onChange={(v) => update('bgColor', v)}
          swatches={['#000000', '#ffffff', '#1a1b1e', '#2b2d42', '#0b3d2e', '#3b0d11']}
        />
      </Stack>
    </Paper>
  )
}
