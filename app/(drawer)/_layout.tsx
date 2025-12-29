import { LanguageProvider } from "@/context/LanguageContext";
import { SettingsProvider } from "@/context/SettingsСontext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { requestPermissionsAsync, showNotification } from "@/hooks/useNotification";
import i18n from "@/utils/i18n";
import { Drawer } from "expo-router/drawer";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

async function initAttributesTable(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Attribute (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL UNIQUE,
      Color TEXT DEFAULT '#888888'
    );
  `);
}

async function initDiaryTable(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS DiaryEntry (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Date TEXT NOT NULL DEFAULT (DATE('now')),
      StartTime TEXT NOT NULL DEFAULT '00:00:00',
      EndTime TEXT NOT NULL DEFAULT '00:00:00',
      Name TEXT NOT NULL DEFAULT '',
      Tags TEXT NOT NULL DEFAULT '',
      Notes TEXT NOT NULL DEFAULT '',
      Color TEXT DEFAULT '#4CAF50'
    );
  `);
}

async function initDiaryAttributeTable(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS DiaryEntryAttribute (
      DiaryEntryId INTEGER NOT NULL REFERENCES DiaryEntry(Id) ON DELETE CASCADE,
      AttributeId INTEGER NOT NULL REFERENCES Attribute(Id) ON DELETE CASCADE,
      PRIMARY KEY (DiaryEntryId, AttributeId)
    );
  `);
  await db.execAsync(` CREATE INDEX IF NOT EXISTS idx_diaryentryattribute_attributeid ON DiaryEntryAttribute(AttributeId); `);
  await db.execAsync(` CREATE INDEX IF NOT EXISTS idx_diaryentryattribute_diaryentryid ON DiaryEntryAttribute(DiaryEntryId); `);
}


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
 useEffect(() => {
    async function askPermissions() {
      try {
        const granted = await requestPermissionsAsync();
        if (!granted) { console.warn("Notifications permission not granted"); }
        else { console.log("Notifications permission granted"); }
      } catch (err) { console.error("Error requesting notifications permission:", err); }
    }

    showNotification("Welcome", "Welcome to Ciculus App");
    console.log("DrawerLayout");
    askPermissions();
  }, []);
  return (
      <SQLiteProvider databaseName="diary.db" onInit={async (db: any) => {
        await db.execAsync("PRAGMA foreign_keys = ON;");
        await initAttributesTable(db);
        await initDiaryTable(db);
        await initDiaryAttributeTable(db);
      }}>
        <SettingsProvider>
          <LanguageProvider>
          <ThemeProvider><ThemedDrawer/></ThemeProvider>
          </LanguageProvider>
        </SettingsProvider>
      </SQLiteProvider>
  );
}