import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'
import { IconButton } from '../ui/Button'
import { useColorScheme, type ColorScheme } from '../theme/ColorScheme'

const NEXT: Record<ColorScheme, ColorScheme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
}

const LABEL: Record<ColorScheme, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'Matching your system theme',
}

export default function ThemeToggle() {
  const { scheme, setScheme } = useColorScheme()

  return (
    <IconButton
      label={`${LABEL[scheme]}. Switch to ${LABEL[NEXT[scheme]].toLowerCase()}`}
      onClick={() => setScheme(NEXT[scheme])}
    >
      {scheme === 'light' ? (
        <IconSun size={18} />
      ) : scheme === 'dark' ? (
        <IconMoon size={18} />
      ) : (
        <IconDeviceDesktop size={18} />
      )}
    </IconButton>
  )
}
