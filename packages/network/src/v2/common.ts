import { SchemaType } from "@latticexyz/schema-type";
import { TableId } from "@latticexyz/utils";

export const schemaTableId = new TableId("mudstore", "schema");
export const metadataTableId = new TableId("mudstore", "StoreMetadata");

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
