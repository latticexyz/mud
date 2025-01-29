import { Metadata } from "@latticexyz/recs";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser/internal";
import { Table } from "@latticexyz/config";

export type StoreComponentMetadata = Metadata & {
  componentName: string;
  tableName: string;
  table: Table;
  // TODO: migrate to store's KeySchema/ValueSchema
  /** @deprecated Derive this schema from `component.metadata.table` instead. */
  keySchema: KeySchema;
  /** @deprecated Derive this schema from `component.metadata.table` instead. */
  valueSchema: ValueSchema;
};
