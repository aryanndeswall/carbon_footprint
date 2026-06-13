import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { colors } from '../styles/colors';
import { spacing, roundness } from '../styles/spacing';
import { fontStyles } from '../styles/typography';

export const useTheme = () => {
  const systemScheme = useColorScheme();
  const themeMode = useThemeStore((state) => state.themeMode);

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const activeColors = isDark ? colors.dark : colors.light;

  return {
    isDark,
    colors: activeColors,
    spacing,
    roundness,
    typography: fontStyles,
  };
};
