import { Query, Tables } from "./common";
import { QueryCondition as WireQueryCondition, Query as WireQuery } from "@latticexyz/query";
import { subjectsToWire } from "./subjectsToWire";

// TODO: validate query
//       - one subject per table
//       - underlying subject field types match
//       - only keys as subjects for now?
//       - subjects and conditions all have valid fields
//       - all subjects match
//       - can only compare like types?
//       - `where` tables are in `from`

export function queryToWire<tables extends Tables, query extends Query<tables>>(
  tables: tables,
  query: query,
): WireQuery {
  // TODO: move out validation to its own thing
  // TODO: validate that all query subjects match in underlying abi types
  // TODO: do other validations

  const where = (query.where ?? []).map(([leftTableField, op, right]): WireQueryCondition => {
    // TODO: translate table field
    const left = leftTableField;
    const [tableName, fieldName] = left.split(".");
    const table = tables[tableName];
    if (op === "in") {
      return { left: { tableId: table.tableId, field: fieldName }, op, right };
    }
    return { left: { tableId: table.tableId, field: fieldName }, op, right };
  });

  return {
    from: subjectsToWire(tables, query.from),
    except: subjectsToWire(tables, query.except ?? {}),
    where,
  };
}
