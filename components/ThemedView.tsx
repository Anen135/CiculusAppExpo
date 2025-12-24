// components/ThemedView.tsx
import { useAppSettings } from '@/hooks/useAppSettings';
import React from 'react';
import { useColorScheme, View, ViewProps } from 'react-native';

interface ThemedViewProps extends ViewProps {
  // Можно добавить children явно, если TS ругается
  children?: React.ReactNode;
}

export const ThemedView = ({ style, children, ...props }: ThemedViewProps) => {
  const { settings } = useAppSettings();
  const systemTheme = useColorScheme(); // 'light' | 'dark'

  let backgroundColor = '#ffffff'; // дефолт светлый

  if (settings.theme === 'dark') {
    backgroundColor = '#000000';
  } else if (settings.theme === 'system') {
    backgroundColor = systemTheme === 'dark' ? '#000000' : '#ffffff';
  }
  // если 'light' — остаётся белый

  return (
    <View style={[{ backgroundColor }, style]} {...props}>
      {children}
    </View>
  );
};