// components/ThemedText.tsx
import { useAppSettings } from '@/hooks/useAppSettings';
import React from 'react';
import { Text, TextProps, useColorScheme } from 'react-native';

export const ThemedText = ({ style, children, ...props }: TextProps) => {
  const { settings } = useAppSettings();
  const systemTheme = useColorScheme();

  let color = '#000000'; // дефолт чёрный

  if (settings.theme === 'dark') {
    color = '#ffffff';
  } else if (settings.theme === 'system') {
    color = systemTheme === 'dark' ? '#ffffff' : '#000000';
  }

  return (
    <Text style={[{ color }, style]} {...props}>
      {children}
    </Text>
  );
};