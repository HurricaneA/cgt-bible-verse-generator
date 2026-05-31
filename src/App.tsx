import { Container, Title, Stack, Alert, Group, Loader, Text } from '@mantine/core'
import { useGenerateImages } from './hooks/useGenerateImages'
import ReferenceInput from './components/ReferenceInput'
import ImageCard from './components/ImageCard'
import BulkDownload from './components/BulkDownload'

export default function App() {
  const { state, generate } = useGenerateImages()
  const isLoading = state.status === 'fetching' || state.status === 'rendering'

  return (
    <Container size="lg" py={48}>
      <Stack align="center" gap="xl">
        <Title order={1} c="teal.8">
          Tamil Bible Verse Image Generator
        </Title>

        <ReferenceInput onGenerate={generate} disabled={isLoading} />

        {state.status === 'fetching' && (
          <Group gap="sm">
            <Loader size="sm" color="teal" />
            <Text c="dimmed">Fetching verses from tamilbible.org…</Text>
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
            maw={560}
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
