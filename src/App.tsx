import {
  Container,
  Title,
  Stack,
  Alert,
  Group,
  Loader,
  Text,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons-react'
import { useGenerateImages } from './hooks/useGenerateImages'
import ReferenceInput from './components/ReferenceInput'
import ImageCard from './components/ImageCard'
import BulkDownload from './components/BulkDownload'

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
  const { state, generate } = useGenerateImages()
  const isLoading = state.status === 'fetching' || state.status === 'rendering'

  return (
    <Container size="lg" py={{ base: 24, sm: 48 }} px={{ base: 16, sm: 24 }}>
      <Stack align="center" gap="xl">
        <Group w="100%" justify="space-between" align="center">
          <Title order={1} c="teal.7" fz={{ base: 'xl', sm: 'h1' }}>
            Tamil Bible Verse Generator
          </Title>
          <ColorSchemeToggle />
        </Group>

        <ReferenceInput onGenerate={generate} disabled={isLoading} />

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
          <>
            {state.pages.length > 1 && (
              <BulkDownload pages={state.pages} bookInfo={state.bookInfo!} />
            )}
            <Stack w="100%" gap="xl">
              {state.pages.map((page, i) => (
                <ImageCard
                  key={i}
                  page={page}
                  index={i}
                  total={state.pages.length}
                />
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Container>
  )
}
