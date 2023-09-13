import { DynamicAbiType, SchemaAbiType, SchemaAbiTypeToPrimitiveType, StaticAbiType } from "@latticexyz/schema-type";

/** @deprecated use `KeySchema` or `ValueSchema` instead */
export type Schema = {
  readonly staticFields: readonly StaticAbiType[];
  readonly dynamicFields: readonly DynamicAbiType[];
};

/** @deprecated use `KeySchema` and `ValueSchema` instead */
export type TableSchema = {
  readonly keySchema: Schema; // TODO: refine to set dynamicFields to []
  readonly valueSchema: Schema;
};

export type FieldLayout = {
  readonly staticFieldLengths: readonly number[];
  readonly numDynamicFields: number;
};

export type KeySchema = Record<string, StaticAbiType>;
export type ValueSchema = Record<string, SchemaAbiType>;

/** Map a table schema like `{ value: "uint256" }` to its primitive types like `{ value: bigint }` */
export type SchemaToPrimitives<TSchema extends ValueSchema> = {
  [key in keyof TSchema]: SchemaAbiTypeToPrimitiveType<TSchema[key]>;
};

export type TableRecord<TKeySchema extends KeySchema = KeySchema, TValueSchema extends ValueSchema = ValueSchema> = {
  key: SchemaToPrimitives<TKeySchema>;
  value: SchemaToPrimitives<TValueSchema>;
};
