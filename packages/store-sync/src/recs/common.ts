import { Metadata } from "@latticexyz/recs";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser/internal";

export type StoreComponentMetadata = Metadata & {
  componentName: string;
  tableName: string;
  // TODO: migrate to store's KeySchema/ValueSchema
  keySchema: KeySchema;
  valueSchema: ValueSchema;
};
