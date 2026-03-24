const COLORS_OLED = {
  background: '#000000', // Pure OLED Black
  surface: '#080808',    // Deep Surface
  surfaceHighlight: 'rgba(255, 255, 255, 0.05)', 
  glassSurface: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  primary: '#00E676',    // Neon Green
  secondary: '#38BDF8',  // Sky Blue
  accent: '#FFD700',     // Gold
  danger: '#FF3366',     // Vibrant Red
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.45)',
  textInverse: '#000000',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  gradients: {
    success: ['#00E676', '#00C853'],
    warning: ['#FFA000', '#FF8F00'],
    danger: ['#FF3366', '#E91E63'],
    vibrant: ['#00E676', '#38BDF8', '#FFD700'],
    premium: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)'],
    liquid: ['#00E676', '#38BDF8'],
    prism: ['#00E676', '#38BDF8', '#8B5CF6', '#FF3366'],
    nebula: ['#6366F1', '#A855F7', '#EC4899'],
    glass: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.02)'],
  }
};

const COLORS_FROSTED = {
  background: '#F9FAFB', // Soft off-white
  surface: '#FFFFFF',
  surfaceHighlight: 'rgba(0, 0, 0, 0.04)',
  glassSurface: 'rgba(0, 0, 0, 0.02)',
  glassBorder: 'rgba(0, 0, 0, 0.05)',
  primary: '#059669', // Emerald Green
  secondary: '#0284C7', // Sky Blue Darker
  accent: '#B45309', // Amber
  danger: '#E11D48', // Rose Red
  textPrimary: '#111827', // Gray 900
  textSecondary: '#4B5563', // Gray 600
  textMuted: '#9CA3AF', // Gray 400
  textInverse: '#FFFFFF',
  border: 'rgba(0, 0, 0, 0.05)',
  borderLight: 'rgba(0, 0, 0, 0.1)',
  gradients: {
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
    danger: ['#F43F5E', '#E11D48'],
    vibrant: ['#10B981', '#0EA5E9', '#F59E0B'],
    premium: ['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.01)'],
    liquid: ['#059669', '#0284C7'],
    prism: ['#10B981', '#0EA5E9', '#8B5CF6', '#F43F5E'],
    nebula: ['#818CF8', '#C084FC', '#F472B6'],
    glass: ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.01)'],
  }
};

export const themeBase = {
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
  },
  layout: {
    maxContentWidth: 1200,
    sidebarWidth: 260,
    tabBarHeight: 85,
  },
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
    },
    glowPrimary: {
      shadowColor: '#00E676',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 10,
    },
    glowSecondary: {
      shadowColor: '#38BDF8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 10,
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

