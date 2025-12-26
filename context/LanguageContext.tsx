// context/LanguageContext.tsx
import i18n from '@/utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Загрузка сохранённого языка при старте
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem('appLanguage');
        if (saved === 'en' || saved === 'ru') {
          i18n.locale = saved;
          setLanguageState(saved);
        } else {
          // Если ничего не сохранено — берём язык устройства
          const deviceLocale = getLocales()[0]?.languageCode || 'en';
          const lang = deviceLocale.startsWith('ru') ? 'ru' : 'en';
          i18n.locale = lang;
          setLanguageState(lang);
        }
      } catch (e) {
        i18n.locale = 'en';
        setLanguageState('en');
        console.warn(e);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    i18n.locale = lang;
    setLanguageState(lang);
    await AsyncStorage.setItem('appLanguage', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};