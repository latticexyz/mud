import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type";
import { FieldData, FullSchemaConfig, StoreConfig } from "./config";

export type ConfigFieldTypeToSchemaAbiType<T extends FieldData<string>> = T extends SchemaAbiType
  ? T
  : T extends `${string}[${string}]`
  ? "uint8[]"
  : "uint8";

export type ConfigFieldTypeToPrimitiveType<T extends FieldData<string>> = T extends SchemaAbiType
  ? SchemaAbiTypeToPrimitiveType<T>
  : T extends `${string}[${string}]` // field type might include enums and enum arrays, which are mapped to uint8/uint8[]
  ? number[] // map enum arrays to `number[]`
  : number; // map enums to `number`

/** Map a table schema config like `{ value: "uint256", type: "SomeEnum" }` to its primitive types like `{ value: bigint, type: number }` */
export type SchemaConfigToPrimitives<T extends FullSchemaConfig> = {
  [key in keyof T]: ConfigFieldTypeToPrimitiveType<T[key]>;
};

export type ConfigToTablesPrimitives<C extends StoreConfig> = {
  [key in keyof C["tables"]]: {
    key: SchemaConfigToPrimitives<C["tables"][key]["keySchema"]>;
    value: SchemaConfigToPrimitives<C["tables"][key]["valueSchema"]>;
  };
};

export type ConfigToKeyPrimitives<
  C extends StoreConfig,
  Table extends keyof ConfigToTablesPrimitives<C>
> = ConfigToTablesPrimitives<C>[Table]["key"];

export type ConfigToValuePrimitives<
  C extends StoreConfig,
  Table extends keyof ConfigToTablesPrimitives<C>
> = ConfigToTablesPrimitives<C>[Table]["value"];

export type ConfigToRecordPrimitives<C extends StoreConfig, Table extends keyof ConfigToTablesPrimitives<C>> = {
  key: ConfigToKeyPrimitives<C, Table>;
  value: ConfigToValuePrimitives<C, Table>;
};
