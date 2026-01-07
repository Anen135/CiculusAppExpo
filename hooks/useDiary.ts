import { getLocalDateStr } from "@/utils/dateUtil";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

export interface DiaryEntry {
  Id: number;
  Date: string;
  StartTime: string;
  EndTime: string;
  Name: string;
  Notes: string;
  DurationSeconds: number;
  Color?: string;
  Tags?: string;
}

export function useDiary() {
  const db = useSQLiteContext();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const loadEntries = useCallback(async () => {
    try {
      const all = await db.getAllAsync<DiaryEntry>(`
        SELECT
          Id, Date, StartTime, EndTime, Name, Notes, Color, Tags,
          (strftime('%s', '2000-01-01 ' || EndTime) - strftime('%s', '2000-01-01 ' || StartTime)) AS DurationSeconds
        FROM DiaryEntry
        ORDER BY Date DESC, StartTime ASC;
      `);
      setEntries(all);
    } catch (e) {
      console.error("Ошибка при загрузке записей:", e);
    }
  }, [db]);
  useEffect(() => {
      loadEntries();
  }, [loadEntries]);


  const addEntry = async ( entry: Partial<Omit<DiaryEntry, "Id" | "DurationSeconds">> ) => {
    return await db.runAsync(
      `INSERT INTO DiaryEntry (Date, StartTime, EndTime, Name, Notes, Color) VALUES (?, ?, ?, ?, ?, ?)`,
      entry.Date || getLocalDateStr(new Date()),
      entry.StartTime || "00:00:00",
      entry.EndTime || "00:00:00",
      entry.Name || "",
      entry.Notes || "",
      entry.Color || "#4CAF50"
    );
  };

  const updateEntry = async (
    id: number,
    entry: Partial<Omit<DiaryEntry, "Id" | "DurationSeconds">>
  ) => {
    await db.runAsync(
      `UPDATE DiaryEntry
       SET Date = ?, StartTime = ?, EndTime = ?, Name = ?, Notes = ?, Color = ?
       WHERE Id = ?`,
      entry.Date || getLocalDateStr(new Date()),
      entry.StartTime || "00:00:00",
      entry.EndTime || "00:00:00",
      entry.Name || "",
      entry.Notes || "",
      entry.Color || "#4CAF50",
      id
    );
  };


  const deleteEntry = async (id: number) => {
    await db.runAsync(`DELETE FROM DiaryEntry WHERE Id = ?`, id);
  };

  const getLatestEndTime = useCallback(async (date: Date | null = null): Promise<string> => {
    try {
      const today = getLocalDateStr(date ?? new Date());
      const result = await db.getFirstAsync<{ max_end_time: string }>( `SELECT MAX(EndTime) AS max_end_time FROM DiaryEntry WHERE Date = ?`, today );
      return result?.max_end_time || "00:00:00";
    } catch (e) {
      console.error("Ошибка при получении последнего EndTime:", e);
      return "00:00:00";
    }
  }, [db] );

  const last_insert_id = async (): Promise<number> => {
    try {
      const result = await db.getFirstAsync<{ last_id: number }>(`SELECT last_insert_rowid() AS last_id;`);
      return result?.last_id || 0;
    } catch (e) {
      console.error("Ошибка при получении last_insert_id:", e);
      return 0;
    }
  };



  return { entries, addEntry, updateEntry, deleteEntry, loadEntries, getLatestEndTime, last_insert_id};
}
