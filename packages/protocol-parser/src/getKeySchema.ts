import { StaticAbiType, Table } from "@latticexyz/config";

type PartialTable = Pick<Table, "schema" | "key">;

export type ResolvedKeySchema = {
  readonly [fieldName: string]: {
    /** the Solidity primitive ABI type */
    readonly type: StaticAbiType;
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: string;
  };
};

export type getKeySchema<table extends PartialTable> = PartialTable extends table
  ? ResolvedKeySchema
  : {
      readonly [fieldName in Extract<keyof table["schema"], table["key"][number]>]: table["schema"][fieldName] & {
        readonly type: StaticAbiType;
      };
    };

export function getKeySchema<table extends PartialTable>(table: table): getKeySchema<table> {
  return Object.fromEntries(table.key.map((fieldName) => [fieldName, table.schema[fieldName]])) as getKeySchema<table>;
}
