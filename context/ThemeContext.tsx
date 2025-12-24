// context/ThemeContext.tsx
import { useAppSettings } from '@/hooks/useAppSettings';
import { themes } from '@/theme/colors';
import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;                    // текущая активная тема (light или dark)
  colors: typeof themes.light;
  appThemeSetting: 'light' | 'dark' | 'system'; // что выбрал пользователь
  setAppTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, loading, setTheme: setAppThemeSetting } = useAppSettings();
  const systemTheme = useColorScheme() as ThemeType | null;

  // Определяем реальную текущую тему
  const getCurrentTheme = (): ThemeType => {
    if (settings.theme === 'light') return 'light';
    if (settings.theme === 'dark') return 'dark';
    return systemTheme ?? 'light'; // fallback на light, если systemTheme null
  };

  const currentTheme = getCurrentTheme();
  const colors = themes[currentTheme];

  // Подписываемся на изменения системной темы (если выбран 'system')
  useEffect(() => {
    if (settings.theme === 'system') {
      // При изменении системной темы — перерендерим
      // useColorScheme уже реактивен, но для уверенности можно добавить listener
    }
  }, [systemTheme, settings.theme]);

  // Пока настройки загружаются — можно показать сплеш или ничего не рендерить
  if (loading) {
    return null; // или <SplashScreen />
  }

  const value: ThemeContextType = {
    theme: currentTheme,
    colors,
    appThemeSetting: settings.theme,
    setAppTheme: setAppThemeSetting,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};