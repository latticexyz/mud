import { SchemaType } from "@latticexyz/schema-type";
import { toTableId } from "./utils/tableId";

export const schemaTableId = toTableId("mudstore", "schema");
export const metadataTableId = toTableId("mudstore", "StoreMetadata");

export const storeEvents = ["StoreSetRecord", "StoreSetField", "StoreDeleteRecord"] as const;

export type TableSchema = {
  staticDataLength: number;
  staticFields: SchemaType[];
  dynamicFields: SchemaType[];
  rawSchema: string;
  abi: string;
};

export type TableMetadata = {
  tableName: string;
  fieldNames: string[];
};
