import { LanguageProvider } from "@/context/LanguageContext";
import { SettingsProvider } from "@/context/SettingsСontext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import i18n from "@/utils/i18n";
import { Drawer } from "expo-router/drawer";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

async function initDiaryTable(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS DiaryEntry (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Date TEXT NOT NULL DEFAULT (DATE('now')),
      StartTime TEXT NOT NULL DEFAULT '00:00:00',
      EndTime TEXT NOT NULL DEFAULT '00:00:00',
      Name TEXT NOT NULL DEFAULT '',
      Notes TEXT NOT NULL DEFAULT '',
      Color TEXT DEFAULT '#4CAF50'
    );
  `);
}

// Этот компонент ДОЛЖЕН быть внутри ThemeProvider
function ThemedDrawer() {
  const { colors, theme } = useTheme(); // Теперь безопасно

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
  return (
      <SQLiteProvider databaseName="diary.db" onInit={initDiaryTable}>
        <SettingsProvider>
          <LanguageProvider>
          <ThemeProvider><ThemedDrawer/></ThemeProvider>
          </LanguageProvider>
        </SettingsProvider>
      </SQLiteProvider>
  );
}