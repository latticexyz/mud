import { keccak256 } from "@latticexyz/utils";
import { SchemaType } from "@latticexyz/schema-type";

export const schemaTableId = keccak256("mud.store.table.schema");
export const metadataTableId = keccak256("/store_internals/tables/StoreMetadata");

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
