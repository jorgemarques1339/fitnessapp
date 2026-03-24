import { useMemo } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { themeBase, getThemeColors } from '../theme/theme';

export function useAppTheme() {
  const themeMode = useConfigStore(state => state.themeMode);
  
  const colors = useMemo(() => getThemeColors(themeMode), [themeMode]);
  
  return {
    ...themeBase,
    colors,
    isDark: themeMode === 'oled',
  };
}
