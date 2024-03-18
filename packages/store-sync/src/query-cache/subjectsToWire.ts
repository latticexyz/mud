import { TableSubject, Tables } from "./common";
import { QuerySubject } from "@latticexyz/query";

// TODO: validate
//       - all subject types match
//       - only keys as subjects for now?

export function subjectsToWire<tables extends Tables>(
  tables: Tables,
  subjects: {
    [tableName in keyof tables]?: TableSubject<tables[tableName]>;
  },
): readonly QuerySubject[] {
  // TODO: validate `tables` contains all tables used `subjects` map
  // TODO: validate that subject field names exist in table schema
  return Object.entries(subjects).map(([tableName, subject]) => ({
    tableId: tables[tableName].tableId,
    subject,
  }));
}
