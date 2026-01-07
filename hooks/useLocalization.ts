import { useTranslation } from "react-i18next";

export function useLocalization() {
  const { t, i18n } = useTranslation();

  if (!i18n) {
    throw new Error("useLocalization must be used inside LocalizationProvider");
  }

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
  };

  return {
    t,
    language: i18n.language,
    changeLanguage,
  };
}
