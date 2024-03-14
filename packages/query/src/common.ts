import { SchemaAbiType } from "@latticexyz/schema-type";
import { ResolvedTableConfig } from "@latticexyz/store/config/v2";

export type Schema = { readonly [key: string]: { readonly type: SchemaAbiType } };

export type schemaAbiTypes<schema extends Schema> = {
  [key in keyof schema]: schema[key]["type"];
};

export type TableRecord<table extends ResolvedTableConfig = ResolvedTableConfig> = {
  readonly table: table;
  readonly fields: schemaAbiTypes<table["schema"]>;
};
