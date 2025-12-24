import { I18n } from 'i18n-js';

import en from '@/assets/locales/en.json';
import ru from '@/assets/locales/ru.json';

const i18n = new I18n({
  en,
  ru,
});

//i18n.locale = getLocales()[0]?.languageTag || 'en'; // Автоопределение языка устройства
i18n.enableFallback = true; // Фолбэк на en, если перевод отсутствует

export default i18n;