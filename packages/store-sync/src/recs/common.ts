import { Metadata } from "@latticexyz/recs";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser/internal";
import { Table } from "@latticexyz/config";

export type StoreComponentMetadata = Metadata & {
  componentName: string;
  tableName: string;
  table: Table;
  // TODO: migrate to store's KeySchema/ValueSchema
  keySchema: KeySchema;
  valueSchema: ValueSchema;
};
