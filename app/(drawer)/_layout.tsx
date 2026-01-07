import { LocalizationProvider } from "@/context/LanguageContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useLocalization } from "@/hooks/useLocalization";
import { usePermissions } from "@/hooks/usePermissions";
import { initDatabase } from "@/utils/database";
import { Drawer } from "expo-router/drawer";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

/* ---------- Drawer with theme + localization ---------- */

function ThemedDrawer() {
  const { colors, theme } = useTheme();
  const { t } = useLocalization(); // 👈 новый API

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <Drawer
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
          },
          drawerStyle: {
            backgroundColor: colors.background,
          },
          drawerActiveTintColor: colors.primary || colors.text,
          drawerInactiveTintColor: colors.text + "80",
          drawerLabelStyle: {
            color: colors.text,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{ title: t("main.main") }}
        />
        <Drawer.Screen
          name="settings"
          options={{ title: t("settings.settings") }}
        />
        <Drawer.Screen
          name="attributes"
          options={{ title: t("attributes.attributes") }}
        />
        <Drawer.Screen
          name="search"
          options={{ title: t("search.search") }}
        />
        <Drawer.Screen
          name="entry"
          options={{
            drawerItemStyle: { display: "none" },
            title: t("entry.entry"),
          }}
        />
      </Drawer>
    </>
  );
}

/* ---------- Root layout ---------- */

export default function DrawerLayout() {
  usePermissions();

  return (
    <SQLiteProvider databaseName="diary.db" onInit={initDatabase}>
      <SettingsProvider>
        <LocalizationProvider>
          <ThemeProvider>
            <ThemedDrawer />
          </ThemeProvider>
        </LocalizationProvider>
      </SettingsProvider>
    </SQLiteProvider>
  );
}
