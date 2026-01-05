import { LanguageProvider } from "@/context/LanguageContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/hooks/usePermissions";
import i18n from "@/utils/i18n";
import { initDatabase } from "@/utils/database";
import { Drawer } from "expo-router/drawer";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

function ThemedDrawer() {
  const { colors, theme } = useTheme();

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
        <Drawer.Screen name="index" options={{ title: i18n.t('main.main') }} />
        <Drawer.Screen name="settings" options={{ title: i18n.t('settings.settings') }} />
        <Drawer.Screen name="attributes" options={{ title: i18n.t('attributes.attributes') }} />
        <Drawer.Screen name="search" options={{ title: i18n.t('search.search') }} />
        <Drawer.Screen
          name="entry"
          options={{
            drawerItemStyle: { display: "none" },
            title: i18n.t('entry.entry'),
          }}
        />
      </Drawer>
    </>
  );
}

export default function DrawerLayout() {
  usePermissions();

  return (
      <SQLiteProvider databaseName="diary.db" onInit={initDatabase}>
        <SettingsProvider>
          <LanguageProvider>
          <ThemeProvider><ThemedDrawer/></ThemeProvider>
          </LanguageProvider>
        </SettingsProvider>
      </SQLiteProvider>
  );
}