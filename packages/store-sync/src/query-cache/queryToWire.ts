import { Query } from "./common";
import { ResolvedStoreConfig } from "@latticexyz/store/config/v2";
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

export function queryToWire<config extends ResolvedStoreConfig, query extends Query<config>>(
  config: config,
  query: query,
): WireQuery {
  // TODO: move out validation to its own thing
  // TODO: validate that all query subjects match in underlying abi types
  // TODO: do other validations

  const where = (query.where ?? []).map(([leftTableField, op, right]): WireQueryCondition => {
    // TODO: translate table field
    const left = leftTableField;
    const [tableName, fieldName] = left.split(".");
    const table = config.tables[tableName];
    return { left: { tableId: table.tableId, field: fieldName }, op, right };
  });

  return {
    from: subjectsToWire(config, query.from),
    except: subjectsToWire(config, query.except ?? {}),
    where,
  };
}
