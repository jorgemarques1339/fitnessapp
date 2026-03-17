export const theme = {
  colors: {
    // Backgrounds
    background: '#040710', // Deepest dark blue/black
    surface: '#0F172A',   // Slightly elevated
    surfaceHighlight: 'rgba(255, 255, 255, 0.05)',
    
    // Accents
    primary: '#00E676',   // Vibrant Green
    secondary: '#38BDF8', // Cyan Blue
    accent: '#FFD700',    // Gold
    danger: '#FF3366',    // Crimson Red
    
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    textMuted: 'rgba(255, 255, 255, 0.4)',
    textInverse: '#000000',

    // Borders & Glass
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.2)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20, // Slightly reduced for mobile breath
    xl: 28, 
    xxl: 36,
    cardPadding: 20, // More balanced for generic mobile screens
  },
  
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2, // Subtler
      shadowRadius: 8,
      elevation: 4,
    },
    premium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    }
  },

  radii: {
    sm: 10,
    md: 18,
    lg: 28, // Smoother corners
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
      xl: 18, // Adjusted
      xxl: 22, // Adjusted
      display: 28, // Scaled down for mobile safety
      displayLarge: 36, // Scaled down
    }
  }
};
