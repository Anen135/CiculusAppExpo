import { Attribute } from "@/hooks/useAttribute";

type FieldType = 'date' | 'text' | 'attribute';

type Operator =
  | 'equals'
  | 'contains'
  | 'before'
  | 'after'
  | 'between'
  | 'in';

type SearchCondition = {
  id: string;
  field: 'date' | 'name' | 'notes' | 'attribute';
  operator: Operator;
  value: any;
};


export function buildSQL(conditions: SearchCondition[]) {
  let sql = `
    SELECT DISTINCT d.*
    FROM DiaryEntry d
    LEFT JOIN DiaryEntryAttribute dea ON dea.DiaryEntryId = d.Id
    LEFT JOIN Attribute a ON a.Id = dea.AttributeId
    WHERE 1 = 1
  `;

  const params: any[] = [];

  conditions.forEach(c => {
    switch (c.field) {
      case 'name':
        if (c.operator === 'contains') {
          sql += ` AND d.Name LIKE ?`;
          params.push(`%${c.value}%`);
        }
        break;

      case 'notes':
        if (c.operator === 'contains') {
          sql += ` AND d.Notes LIKE ?`;
          params.push(`%${c.value}%`);
        }
        break;

      case 'date':
        if (c.operator === 'equals') {
          sql += ` AND d.Date = ?`;
          params.push(c.value);
        }
        if (c.operator === 'between') {
          sql += ` AND d.Date BETWEEN ? AND ?`;
          params.push(c.value.from, c.value.to);
        }
        break;

        case "attribute":
        if (c.value.length > 0) {
            sql += `
            AND d.Id IN (
                SELECT DiaryEntryId
                FROM DiaryEntryAttribute
                WHERE AttributeId IN (${c.value.map(() => "?").join(",")})
            )
            `;
            params.push(...c.value.map((a: Attribute) => a.Id));
        }
       // console.log(c,sql);
        break;

    }
  });

  return { sql, params };
}
