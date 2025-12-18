import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";

export interface DiaryEntry {
  Id: number;
  Date: string;
  StartTime: string;
  EndTime: string;
  Name: string;
  Notes: string;
  DurationSeconds: number;
  Color?: string;
}

export function useDiary() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    let isMounted = true; // защита от утечки, если компонент размонтирован
    (async () => {
      try {
        const database = await SQLite.openDatabaseAsync("diary.db");

        // Создаем таблицу один раз
        
        await database.execAsync(`
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

        if (!isMounted) return;
        setDb(database);

        // Загружаем записи сразу после создания таблицы
        const all = await database.getAllAsync<DiaryEntry>(`
          SELECT
            Id, Date, StartTime, EndTime, Name, Notes, Color,
            (strftime('%s', '2000-01-01 ' || EndTime) - strftime('%s', '2000-01-01 ' || StartTime)) AS DurationSeconds
          FROM DiaryEntry
          ORDER BY Date DESC, StartTime ASC;
        `);
        if (isMounted) setEntries(all);
      } catch (e) {
        console.error("Ошибка инициализации базы:", e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadEntries = async () => {
    if (!db) return;
    try {
      const all = await db.getAllAsync<DiaryEntry>(`
        SELECT
          Id, Date, StartTime, EndTime, Name, Notes, Color,
          (strftime('%s', '2000-01-01 ' || EndTime) - strftime('%s', '2000-01-01 ' || StartTime)) AS DurationSeconds
        FROM DiaryEntry
        ORDER BY Date DESC, StartTime ASC;
      `);
      setEntries(all);
    } catch (e) {
      console.error("Ошибка при загрузке записей:", e);
    }
  };

  const addEntry = async (
    entry: Partial<Omit<DiaryEntry, "Id" | "DurationSeconds">>
  ) => {
    if (!db) return;
    await db.runAsync(
      `INSERT INTO DiaryEntry (Date, StartTime, EndTime, Name, Notes, Color) VALUES (?, ?, ?, ?, ?, ?)`,
      entry.Date || new Date().toISOString().slice(0, 10),
      entry.StartTime || "00:00:00",
      entry.EndTime || "00:00:00",
      entry.Name || "",
      entry.Notes || "",
      entry.Color || "#4CAF50",
    );
    await loadEntries();
  };

  const updateEntry = async (
    id: number,
    entry: Partial<Omit<DiaryEntry, "Id" | "DurationSeconds">>
  ) => {
    if (!db) return;
    await db.runAsync(
      `UPDATE DiaryEntry 
       SET Date = ?, StartTime = ?, EndTime = ?, Name = ?, Notes = ?, Color = ?
       WHERE Id = ?`,
      entry.Date || new Date().toISOString().slice(0, 10),
      entry.StartTime || "00:00:00",
      entry.EndTime || "00:00:00",
      entry.Name || "",
      entry.Notes || "",
      entry.Color || "#4CAF50",
      id
    );
    await loadEntries();
  };

  const deleteEntry = async (id: number) => {
    if (!db) return;
    await db.runAsync(`DELETE FROM DiaryEntry WHERE Id = ?`, id);
    await loadEntries();
  };

  return { entries, addEntry, updateEntry, deleteEntry, loadEntries };
}
