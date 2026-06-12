import { useEffect } from 'react'
import {
  Container,
  Title,
  Stack,
  Alert,
  Group,
  Grid,
  Loader,
  Text,
  Tabs,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core'
import { IconSun, IconMoon, IconPhoto, IconLanguage } from '@tabler/icons-react'
import { useGenerateImages } from './hooks/useGenerateImages'
import { useRenderSettings } from './hooks/useRenderSettings'
import ReferenceInput from './components/ReferenceInput'
import ImageCard from './components/ImageCard'
import BulkDownload from './components/BulkDownload'
import RenderControls from './components/RenderControls'
import Converter from './components/Converter'

function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme()
  const computed = useComputedColorScheme('light')
  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label="Toggle colour scheme"
      onClick={() => setColorScheme(computed === 'dark' ? 'light' : 'dark')}
    >
      {computed === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  )
}

export default function App() {
  const { state, generate, rerender } = useGenerateImages()
  const { settings, update, reset } = useRenderSettings()
  const isLoading = state.status === 'fetching' || state.status === 'rendering'

  // Live re-render the current image when a setting changes (no re-fetch).
  useEffect(() => {
    if (state.status === 'done') rerender(settings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  return (
    <Container size="lg" py={{ base: 24, sm: 48 }} px={{ base: 16, sm: 24 }}>
      <Stack align="center" gap="xl">
        <Group w="100%" justify="space-between" align="center">
          <Title order={1} c="teal.7" fz={{ base: 'xl', sm: 'h1' }}>
            Tamil Bible Verse Generator
          </Title>
          <ColorSchemeToggle />
        </Group>

        <Tabs defaultValue="generator" w="100%" color="teal">
          <Tabs.List grow mb="lg">
            <Tabs.Tab value="generator" leftSection={<IconPhoto size={16} />}>
              Verse Images
            </Tabs.Tab>
            <Tabs.Tab value="converter" leftSection={<IconLanguage size={16} />}>
              Unicode ↔ Bamini
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="generator">
            <Stack align="center" gap="xl">
              <ReferenceInput
                onGenerate={(ref) => generate(ref, settings)}
                disabled={isLoading}
              />

              {state.status === 'fetching' && (
                <Group gap="sm">
                  <Loader size="sm" color="teal" />
                  <Text c="dimmed">Loading verses…</Text>
                </Group>
              )}

              {state.status === 'rendering' && (
                <Group gap="sm">
                  <Loader size="sm" color="teal" />
                  <Text c="dimmed">Rendering images…</Text>
                </Group>
              )}

              {state.status === 'error' && state.error && (
                <Alert
                  color="red"
                  title="Error"
                  variant="light"
                  w="100%"
                  withCloseButton
                  onClose={() => generate('')}
                >
                  {state.error}
                </Alert>
              )}

              {state.status === 'done' && state.pages.length > 0 && (
                <Grid w="100%" gutter="xl">
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="xl">
                      {state.pages.length > 1 && (
                        <BulkDownload
                          pages={state.pages}
                          bookInfo={state.bookInfo!}
                        />
                      )}
                      {state.pages.map((page, i) => (
                        <ImageCard
                          key={i}
                          page={page}
                          index={i}
                          total={state.pages.length}
                        />
                      ))}
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <div style={{ position: 'sticky', top: 16 }}>
                      <RenderControls
                        settings={settings}
                        update={update}
                        reset={reset}
                      />
                    </div>
                  </Grid.Col>
                </Grid>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="converter">
            <Converter />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
