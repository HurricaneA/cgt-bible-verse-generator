import {
  Paper,
  Stack,
  Group,
  Text,
  Slider,
  ColorInput,
  Button,
  Divider,
  FileInput,
} from '@mantine/core'
import { IconRestore, IconPhotoUp } from '@tabler/icons-react'
import { LIMITS, type RenderSettings } from '../lib/config'
import type { OutputMode } from '../types'

interface Props {
  settings: RenderSettings
  update: <K extends keyof RenderSettings>(key: K, value: RenderSettings[K]) => void
  reset: () => void
  mode: OutputMode
  frameName: string | null
  onFramePick: (file: File | null) => void
}

function SliderField({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string
  value: number
  unit: string
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <Stack gap={2}>
      <Group justify="space-between" gap={4}>
        <Text size="sm">{label}</Text>
        <Text size="sm" c="dimmed" ff="monospace">
          {format ? format(value) : `${value}${unit}`}
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

export default function RenderControls({
  settings,
  update,
  reset,
  mode,
  frameName,
  onFramePick,
}: Props) {
  const isLowerThird = mode === 'lowerThird'

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

        {isLowerThird ? (
          <>
            <Divider label="Border image" labelPosition="left" />
            <FileInput
              accept="image/*"
              placeholder="Upload an image…"
              leftSection={<IconPhotoUp size={16} />}
              clearable
              onChange={onFramePick}
            />
            {frameName && (
              <Text size="xs" c="dimmed" truncate>
                Using: {frameName}
              </Text>
            )}

            <Divider label="Box" labelPosition="left" />
            <SliderField
              label="Side margin"
              value={settings.ltSideMargin}
              unit="px"
              {...LIMITS.ltSideMargin}
              onChange={(v) => update('ltSideMargin', v)}
            />
            <SliderField
              label="Bottom margin"
              value={settings.ltBottomMargin}
              unit="px"
              {...LIMITS.ltBottomMargin}
              onChange={(v) => update('ltBottomMargin', v)}
            />
            <SliderField
              label="Box height"
              value={settings.ltBoxHeight}
              unit="px"
              {...LIMITS.ltBoxHeight}
              onChange={(v) => update('ltBoxHeight', v)}
            />
            <SliderField
              label="Ring — sides"
              value={settings.ltBorderSide}
              unit="px"
              {...LIMITS.ltBorderSide}
              onChange={(v) => update('ltBorderSide', v)}
            />
            <SliderField
              label="Ring — top"
              value={settings.ltBorderTop}
              unit="px"
              {...LIMITS.ltBorderTop}
              onChange={(v) => update('ltBorderTop', v)}
            />
            <SliderField
              label="Ring — bottom"
              value={settings.ltBorderBottom}
              unit="px"
              {...LIMITS.ltBorderBottom}
              onChange={(v) => update('ltBorderBottom', v)}
            />
            <SliderField
              label="Corner radius"
              value={settings.ltCornerRadius}
              unit="px"
              {...LIMITS.ltCornerRadius}
              onChange={(v) => update('ltCornerRadius', v)}
            />
            <SliderField
              label="Inner padding"
              value={settings.ltPadding}
              unit="px"
              {...LIMITS.ltPadding}
              onChange={(v) => update('ltPadding', v)}
            />
            <SliderField
              label="Inner fill opacity"
              value={settings.ltInnerOpacity}
              unit=""
              {...LIMITS.ltInnerOpacity}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) => update('ltInnerOpacity', Math.round(v * 20) / 20)}
            />
          </>
        ) : (
          <>
            <Divider label="Title" labelPosition="left" />
            <SliderField
              label="Inset (from edges)"
              value={settings.titleInset}
              unit="px"
              {...LIMITS.titleInset}
              onChange={(v) => update('titleInset', v)}
            />
            <SliderField
              label="Font size"
              value={settings.titleFontPt}
              unit="pt"
              {...LIMITS.titleFontPt}
              onChange={(v) => update('titleFontPt', v)}
            />
            <SliderField
              label="Vertical position"
              value={settings.titleY}
              unit="px"
              {...LIMITS.titleY}
              onChange={(v) => update('titleY', v)}
            />
          </>
        )}

        <Divider label="Verses" labelPosition="left" />
        {isLowerThird ? (
          <>
            <SliderField
              label="Font size"
              value={settings.ltVerseFontPt}
              unit="pt"
              {...LIMITS.ltVerseFontPt}
              onChange={(v) => update('ltVerseFontPt', v)}
            />
            <SliderField
              label="Line spacing"
              value={settings.ltLineSpacingPt}
              unit="pt"
              {...LIMITS.ltLineSpacingPt}
              onChange={(v) => update('ltLineSpacingPt', v)}
            />
          </>
        ) : (
          <>
            <SliderField
              label="Font size"
              value={settings.verseFontPt}
              unit="pt"
              {...LIMITS.verseFontPt}
              onChange={(v) => update('verseFontPt', v)}
            />
            <SliderField
              label="Line spacing"
              value={settings.lineSpacingPt}
              unit="pt"
              {...LIMITS.lineSpacingPt}
              onChange={(v) => update('lineSpacingPt', v)}
            />
          </>
        )}

        <Divider label="Colours" labelPosition="left" />
        <ColorInput
          label="Text colour"
          format="hex"
          value={settings.textColor}
          onChange={(v) => update('textColor', v)}
          swatches={['#ffffff', '#000000', '#ffd43b', '#ff6b6b', '#4dabf7', '#69db7c']}
        />
        <ColorInput
          label={isLowerThird ? 'Inner fill colour' : 'Background colour'}
          format="hex"
          value={settings.bgColor}
          onChange={(v) => update('bgColor', v)}
          swatches={['#000000', '#ffffff', '#1a1b1e', '#2b2d42', '#0b3d2e', '#3b0d11']}
        />
      </Stack>
    </Paper>
  )
}
