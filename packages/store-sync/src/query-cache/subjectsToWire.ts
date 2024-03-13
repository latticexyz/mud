import { TableSubject, Tables } from "./common";
import { TableSubject as WireTableSubject } from "@latticexyz/query";
import { SchemaAbiType } from "@latticexyz/schema-type";

// TODO: validate query
//       - one subject per table
//       - underlying subject field types match
//       - only keys as subjects for now?
//       - subjects and conditions all have valid fields
//       - all subjects match
//       - can only compare like types?
//       - `where` tables are in `from`
// TODO: return matching records alongside subjects? because the record subset may be smaller than what querying for records with matching subjects

export function subjectsToWire<tables extends Tables>(
  tables: Tables,
  subjects: {
    [tableName in keyof tables]?: TableSubject<tables[tableName]>;
  },
): readonly WireTableSubject[] {
  return Object.entries(subjects).map(([tableName, subjectFields]): WireTableSubject => {
    const table = tables[tableName] as tables[keyof tables] | undefined;
    if (!table) {
      throw new Error(`Table \`${tableName}\` not found.`);
    }
    const subjectSchema = subjectFields.map((fieldName): SchemaAbiType => {
      const abiType = table.schema[fieldName]?.type as SchemaAbiType | undefined;
      if (!abiType) {
        throw new Error(`Field \`${tableName}.${fieldName}\` not found in table schema.`);
      }
      return abiType;
    });

    return {
      tableId: table.tableId,
      subject: subjectSchema,
    };
  });
}
