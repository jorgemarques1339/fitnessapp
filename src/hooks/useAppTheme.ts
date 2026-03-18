import { useMemo } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { themeBase, getThemeColors } from '../theme/theme';

export function useAppTheme() {
  const themeMode = useWorkoutStore(state => state.themeMode);
  
  const colors = useMemo(() => getThemeColors(themeMode), [themeMode]);
  
  return {
    ...themeBase,
    colors,
    isDark: themeMode === 'oled',
  };
}
