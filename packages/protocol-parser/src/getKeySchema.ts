import { StaticAbiType, Table } from "@latticexyz/config";

// rename this to `tableToKeySchema`?

export type getKeySchema<table extends Table> = {
  readonly [fieldName in table["key"][number]]: table["schema"][fieldName] & { type: StaticAbiType };
};

export function getKeySchema<table extends Table>(table: table): getKeySchema<table> {
  return Object.fromEntries(table.key.map((fieldName) => [fieldName, table.schema[fieldName]])) as getKeySchema<table>;
}
