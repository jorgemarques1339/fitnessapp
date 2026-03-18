import React from 'react';
import { View, StyleSheet, useWindowDimensions, ViewProps } from 'react-native';
import { themeBase } from '../../theme/theme';

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
  maxWidth?: number;
  center?: boolean;
}

export default function ResponsiveContainer({ 
  children, 
  maxWidth = themeBase.layout.maxContentWidth, 
  center = true,
  style,
  ...rest 
}: ResponsiveContainerProps) {
  const { width } = useWindowDimensions();
  
  const isLargeScreen = width >= themeBase.breakpoints.tablet;

  return (
    <View 
      style={[
        styles.container,
        { maxWidth: isLargeScreen ? maxWidth : '100%' },
        center && styles.centered,
        style
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  centered: {
    alignSelf: 'center',
  },
});
