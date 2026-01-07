import i18n from "@/utils/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import React, { createContext, useContext, useEffect, useState } from "react";

/* =======================
   Types
======================= */

export type ColorSelectMode = "palette" | "preset";
export type DayTimelineViewMode = "v1" | "v2";
export type Language = "en" | "ru";

type SettingsContextType = {
  /** Выбор цвета записи */
  colorSelectMode: ColorSelectMode;
  setColorSelectMode: (mode: ColorSelectMode) => void;

  /** Вид отображения дневного таймлайна */
  dayTimelineViewMode: DayTimelineViewMode;
  setDayTimelineViewMode: (mode: DayTimelineViewMode) => void;

  /** Язык */
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;

  /** Флаг загрузки настроек */
  isLoaded: boolean;
};

/* =======================
   Context
======================= */

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

/* =======================
   Storage keys
======================= */

const STORAGE_KEYS = {
  COLOR_MODE: "@settings/colorSelectMode",
  DAY_TIMELINE_VIEW_MODE: "@settings/dayTimelineViewMode",
  LANGUAGE: "@settings/language",
};

/* =======================
   Provider
======================= */

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [colorSelectMode, setColorSelectModeState] =
    useState<ColorSelectMode>("palette");

  const [dayTimelineViewMode, setDayTimelineViewModeState] =
    useState<DayTimelineViewMode>("v1");

  const [language, setLanguageState] = useState<Language>("en");

  const [isLoaded, setIsLoaded] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [storedColorMode, storedTimelineMode, storedLanguage] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.COLOR_MODE),
            AsyncStorage.getItem(STORAGE_KEYS.DAY_TIMELINE_VIEW_MODE),
            AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          ]);

        // Color mode
        if (storedColorMode === "palette" || storedColorMode === "preset") {
          setColorSelectModeState(storedColorMode);
        }

        // Timeline mode
        if (storedTimelineMode === "v1" || storedTimelineMode === "v2") {
          setDayTimelineViewModeState(storedTimelineMode);
        }

        // Language
        if (storedLanguage === "en" || storedLanguage === "ru") {
          i18n.locale = storedLanguage;
          setLanguageState(storedLanguage);
        } else {
          const deviceLocale = getLocales()[0]?.languageCode || "en";
          const lang = deviceLocale.startsWith("ru") ? "ru" : "en";
          i18n.locale = lang;
          setLanguageState(lang);
        }
      } catch (e) {
        console.warn("Failed to load settings", e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  /* ---------- Setters ---------- */

  const setColorSelectMode = async (mode: ColorSelectMode) => {
    try {
      setColorSelectModeState(mode);
      await AsyncStorage.setItem(STORAGE_KEYS.COLOR_MODE, mode);
    } catch (e) {
      console.warn("Failed to save colorSelectMode", e);
    }
  };

  const setDayTimelineViewMode = async (mode: DayTimelineViewMode) => {
    try {
      setDayTimelineViewModeState(mode);
      await AsyncStorage.setItem(
        STORAGE_KEYS.DAY_TIMELINE_VIEW_MODE,
        mode
      );
    } catch (e) {
      console.warn("Failed to save dayTimelineViewMode", e);
    }
  };

  const setLanguage = async (lang: Language) => {
    i18n.locale = lang;
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  return (
    <SettingsContext.Provider
      value={{
        colorSelectMode,
        setColorSelectMode,
        dayTimelineViewMode,
        setDayTimelineViewMode,
        language,
        setLanguage,
        isLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

/* =======================
   Hook
======================= */

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
};
