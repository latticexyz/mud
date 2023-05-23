import { SchemaType } from "@latticexyz/schema-type";
import { TableId } from "@latticexyz/utils";

export const schemaTableId = new TableId("mudstore", "schema");
export const metadataTableId = new TableId("mudstore", "StoreMetadata");

export const storeEvents = ["StoreSetRecord", "StoreSetField", "StoreDeleteRecord"] as const;
export const ephemeralEvents = ["StoreEphemeralRecord"] as const;

export type StoreEvent = (typeof storeEvents)[number];
export type EphemeralEvent = (typeof ephemeralEvents)[number];

export type TableSchema = { valueSchema: Schema; keySchema: Schema };

export type Schema = Readonly<{
  staticDataLength: number;
  staticFields: SchemaType[];
  dynamicFields: SchemaType[];
  rawSchema: string;
  abi: string;
  isEmpty: boolean;
}>;

export type TableMetadata = Readonly<{
  tableName: string;
  keyNames: string[];
  fieldNames: string[];
}>;
