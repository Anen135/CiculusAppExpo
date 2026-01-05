import { SQLiteDatabase } from "expo-sqlite";

export async function initAttributesTable(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Attribute (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL UNIQUE,
      Color TEXT DEFAULT '#888888'
    );
  `);
}

export async function initDiaryTable(db: SQLiteDatabase) {
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

export async function initDiaryAttributeTable(db: SQLiteDatabase) {
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

export async function initDatabase(db: SQLiteDatabase) {
    await db.execAsync("PRAGMA foreign_keys = ON;");
    await initAttributesTable(db);
    await initDiaryTable(db);
    await initDiaryAttributeTable(db);
}
