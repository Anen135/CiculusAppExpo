import { Attribute } from "@/hooks/useAttribute";
import { SearchCondition } from "@/hooks/useSearch";

export function buildSQL(conditions: SearchCondition[]) {
  let sql = `
    SELECT DISTINCT d.*
    FROM DiaryEntry d
    LEFT JOIN DiaryEntryAttribute dea ON dea.DiaryEntryId = d.Id
    LEFT JOIN Attribute a ON a.Id = dea.AttributeId
  `;

  const params: any[] = [];
  let whereStarted = false;

  conditions.forEach((c, index) => {
    let expr = "";

    switch (c.field) {
      case "name": {
        if (c.operator === "contains") {
          expr = `d.Name LIKE ?`;
          params.push(`%${c.value}%`);
        } else if (c.operator === "equals") {
          expr = `d.Name = ?`;
          params.push(c.value);
        }
        break;
      }

      case "notes": {
        if (c.operator === "contains") {
          expr = `d.Notes LIKE ?`;
          params.push(`%${c.value}%`);
        } else if (c.operator === "equals") {
          expr = `d.Notes = ?`;
          params.push(c.value);
        }
        break;
      }

      case "date": {
        if (c.operator === "equals") {
          expr = `d.Date = ?`;
          params.push(c.value);
        } else if (c.operator === "before") {
          expr = `d.Date < ?`;
          params.push(c.value);
        } else if (c.operator === "after") {
          expr = `d.Date > ?`;
          params.push(c.value);
        } else if (c.operator === "between") {
          if (c.value?.from && c.value?.to) {
            expr = `d.Date BETWEEN ? AND ?`;
            params.push(c.value.from, c.value.to);
          }
        }
        break;
      }

      case "attribute": {
        if (Array.isArray(c.value) && c.value.length > 0) {
          expr = `
            d.Id IN (
              SELECT DiaryEntryId
              FROM DiaryEntryAttribute
              WHERE AttributeId IN (${c.value.map(() => "?").join(",")})
            )
          `;
          params.push(...c.value.map((a: Attribute) => a.Id));
        }
        break;
      }
    }

    if (!expr) return;

    // NOT
    if (c.negate) {
      expr = `NOT (${expr})`;
    } else {
      expr = `(${expr})`;
    }

    // WHERE / AND / OR
    if (!whereStarted) {
      sql += ` WHERE ${expr}`;
      whereStarted = true;
    } else {
      sql += ` ${c.logic ?? "AND"} ${expr}`;
    }
  });

  return { sql, params };
}
