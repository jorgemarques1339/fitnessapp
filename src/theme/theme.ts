const COLORS_OLED = {
  background: '#000000', // Pure OLED Black
  surface: '#0A0A0A',
  surfaceHighlight: 'rgba(255, 255, 255, 0.05)',
  primary: '#00E676',
  secondary: '#38BDF8',
  accent: '#FFD700',
  danger: '#FF3366',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.45)',
  textInverse: '#000000',
  border: 'rgba(255, 255, 255, 0.12)',
  borderLight: 'rgba(255, 255, 255, 0.25)',
};

const COLORS_FROSTED = {
  background: '#F8FAFC', // Crisp light background
  surface: '#FFFFFF',
  surfaceHighlight: 'rgba(0, 0, 0, 0.03)',
  primary: '#059669', // Deeper green for light mode contrast
  secondary: '#0284C7', // Deeper blue
  accent: '#B45309', // Amber/Ochre
  danger: '#DC2626',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.15)',
};

export const themeBase = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 28, 
    xxl: 36,
    cardPadding: 20,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    premium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    }
  },
  radii: {
    sm: 10,
    md: 18,
    lg: 28,
    round: 9999,
  },
  typography: {
    fonts: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      semiBold: 'Inter-SemiBold',
      bold: 'Inter-Bold',
      black: 'Inter-Black',      
      display: 'Outfit-Bold',
      displayBlack: 'Outfit-Black',
    },
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 22,
      display: 28,
      displayLarge: 36,
    }
  }
};

// Default export for backward compatibility and static values
export const theme = {
  ...themeBase,
  colors: COLORS_OLED,
};

export const getThemeColors = (mode: 'oled' | 'frosted') => {
  return mode === 'oled' ? COLORS_OLED : COLORS_FROSTED;
};

