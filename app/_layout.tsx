import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

async function initDiaryTable(db: { execAsync: (arg0: string) => any; }) {
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

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="diary.db" onInit={initDiaryTable}>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Main" }} />
          <Stack.Screen name="EntryPage" options={{ title: "Запись" }} />
        </Stack>
    </SQLiteProvider>
  );
}
