import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import { createI18n } from '@/utils/i18n';

SplashScreen.preventAutoHideAsync();

type Props = {
  children: ReactNode;
};

export function LocalizationProvider({ children }: Props) {
  const [i18n, setI18n] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const instance = await createI18n();
        if (mounted) setI18n(instance);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  if (!i18n) return null;

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
