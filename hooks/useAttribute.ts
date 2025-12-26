import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

export interface Attribute {
    Id: number;
    Name: string;
    Color: string;
}

export function useAttribute() {
    const db = useSQLiteContext();
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const loadAttributes = useCallback(async () => {
        try {
            const all = await db.getAllAsync<Attribute>(` SELECT Id, Name, Color FROM Attribute ORDER BY Name ASC; `);
            setAttributes(all);
        } catch (e) {
            console.error("Ошибка при загрузке атрибутов:", e);
        }
    }, [db]);

    useEffect(() => { loadAttributes(); }, [loadAttributes]);


    const addAttribute = async (name: string, color: string = "#888888") => { await db.runAsync(`INSERT INTO Attribute (Name, Color) VALUES (?, ?)`, name, color); };
    const updateAttribute = async (id: number, name: string, color: string = "#888888") => { await db.runAsync(`UPDATE Attribute SET Name = ?, Color = ? WHERE Id = ?`, name, color, id); };
    const deleteAttribute = async (id: number) => { await db.runAsync(`DELETE FROM Attribute WHERE Id = ?`, id); };
    const getAttributesForEntry = useCallback(async (entryId: number): Promise<Attribute[]> => {
        try {
            const rows = await db.getAllAsync<Attribute>(
                `SELECT a.Id AS Id, a.Name AS Name, a.Color AS Color
                    FROM DiaryEntryAttribute dea
                    JOIN Attribute a ON dea.AttributeId = a.Id
                    WHERE dea.DiaryEntryId = ?`,
                entryId
            );
            return rows;
        } catch (e) {
            console.error("Ошибка при получении атрибутов для записи:", e);
            return [];
        }
    }, [db]);
    const setAttributesForEntry = useCallback(async (entryId: number, attributeIds: Attribute[]) => {
        try {
            await db.runAsync("DELETE FROM DiaryEntryAttribute WHERE DiaryEntryId = ?", entryId);
            for (const attribute of attributeIds) {
                await db.runAsync("INSERT INTO DiaryEntryAttribute (DiaryEntryId, AttributeId) VALUES (?, ?)", entryId, attribute.Id);
            }
        } catch (e) {
            console.error("Ошибка при установке атрибутов для записи:", e);
        }
    }, [db]);

    return { attributes, addAttribute, updateAttribute, deleteAttribute, loadAttributes, getAttributesForEntry, setAttributesForEntry };
};