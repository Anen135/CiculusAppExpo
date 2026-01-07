import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/assets/locales/en.json';
import ru from '@/assets/locales/ru.json';

export async function createI18n() {
  const deviceLang =
    Localization.getLocales()[0]?.languageCode ?? 'en';

  // eslint-disable-next-line import/no-named-as-default-member
  await i18n
    .use(initReactI18next)
    .init({
      lng: deviceLang,
      fallbackLng: 'en',
      resources: {
        en: { translation: en },
        ru: { translation: ru },
      },
      interpolation: {
        escapeValue: false,
      },
    });

  return i18n;
}
