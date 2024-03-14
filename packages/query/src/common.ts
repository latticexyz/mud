import { Table, Schema } from "@latticexyz/store/config/v2";

export type schemaAbiTypes<schema extends Schema> = {
  [key in keyof schema]: schema[key]["type"];
};

export type TableRecord<table extends Table = Table> = {
  readonly table: table;
  readonly fields: schemaAbiTypes<table["schema"]>;
};
