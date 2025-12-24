// hooks/useAppSettings.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en' | 'es';
  notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'ru',
  notificationsEnabled: true,
};

const STORAGE_KEY = '@app_settings';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          const saved = JSON.parse(jsonValue) as Partial<AppSettings>;
          setSettings({ ...DEFAULT_SETTINGS, ...saved });
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  };

  const setTheme = (theme: AppSettings['theme']) => updateSettings({ theme });
  const setLanguage = (language: AppSettings['language']) => updateSettings({ language });
  const toggleNotifications = () =>
    updateSettings({ notificationsEnabled: !settings.notificationsEnabled });

  const resetSettings = async () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Ошибка сброса настроек:', error);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    setTheme,
    setLanguage,
    toggleNotifications,
    resetSettings,
  };
};