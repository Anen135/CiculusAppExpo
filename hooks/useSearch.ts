import { buildSQL } from "@/utils/buildSql";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";

export type FieldType = 'date' | 'text' | 'attribute';
export type LogicOperator = 'AND' | 'OR';
export type Operator =
    | 'equals'
    | 'contains'
    | 'before'
    | 'after'
    | 'between'
    | 'in';

export type SearchCondition = {
    id: string;
    field: 'date' | 'name' | 'notes' | 'attribute';
    operator: Operator;
    logic?: LogicOperator;
    negate?: boolean;
    value: any;
};


export function useSearch() {
    const db = useSQLiteContext();
    const [conditions, setConditions] = useState<SearchCondition[]>([]);
    const [results, setResults] = useState<any[]>([]);

    const runSearch = async () => {
        const { sql, params } = buildSQL(conditions);
        try {
            const rows = await db.getAllAsync(sql, params);
            setResults(rows);
        } catch (e) {
            console.error("SQL error:", sql, "with", params, ":", e);
        }
    };
    return { conditions, setConditions, results, runSearch };
}