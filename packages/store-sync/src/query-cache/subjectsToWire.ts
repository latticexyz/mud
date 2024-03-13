import { TableSubject } from "./common";
import { ResolvedStoreConfig } from "@latticexyz/store/config/v2";
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
export function subjectsToWire<config extends ResolvedStoreConfig>(
  config: config,
  subjects: {
    [tableName in keyof config["tables"]]?: TableSubject<config["tables"][tableName]>;
  },
): readonly WireTableSubject[] {
  return Object.entries(subjects).map(([tableName, subjectFields]): WireTableSubject => {
    const table = config.tables[tableName] as (typeof config)["tables"][string] | undefined;
    if (!table) {
      throw new Error(`Table \`${tableName}\` not found in config.`);
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
