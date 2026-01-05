import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

/* =======================
   Types
======================= */

export type ColorSelectMode = "palette" | "preset";
export type DayTimelineViewMode = "v1" | "v2";

type SettingsContextType = {
  /** Выбор цвета записи */
  colorSelectMode: ColorSelectMode;
  setColorSelectMode: (mode: ColorSelectMode) => void;

  /** Вид отображения дневного таймлайна */
  dayTimelineViewMode: DayTimelineViewMode;
  setDayTimelineViewMode: (mode: DayTimelineViewMode) => void;

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

  const [isLoaded, setIsLoaded] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [storedColorMode, storedTimelineMode] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.COLOR_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.DAY_TIMELINE_VIEW_MODE),
        ]);

        if (storedColorMode === "palette" || storedColorMode === "preset") {
          setColorSelectModeState(storedColorMode);
        }

        if (storedTimelineMode === "v1" || storedTimelineMode === "v2") {
          setDayTimelineViewModeState(storedTimelineMode);
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

  return (
    <SettingsContext.Provider
      value={{
        colorSelectMode,
        setColorSelectMode,
        dayTimelineViewMode,
        setDayTimelineViewMode,
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
