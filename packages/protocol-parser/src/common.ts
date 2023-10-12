import { DynamicAbiType, SchemaAbiType, SchemaAbiTypeToPrimitiveType, StaticAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";

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

// TODO: helper to filter user types to StaticAbiType
export type UserTypes = Record<string, { internalType: SchemaAbiType }>;

export type KeySchema<userTypes extends UserTypes | undefined = undefined> = Record<
  string,
  undefined extends userTypes ? StaticAbiType : StaticAbiType | keyof userTypes
>;

export type ValueSchema<userTypes extends UserTypes | undefined = undefined> = Record<
  string,
  undefined extends userTypes ? SchemaAbiType : SchemaAbiType | keyof userTypes
>;

/** Map a table schema like `{ value: "uint256" }` to its primitive types like `{ value: bigint }` */
export type SchemaToPrimitives<
  TSchema extends ValueSchema<TUserTypes>,
  TUserTypes extends UserTypes | undefined = undefined
> = {
  [key in keyof TSchema & string]: TSchema[key] extends SchemaAbiType
    ? SchemaAbiTypeToPrimitiveType<TSchema[key]>
    : TSchema[key] extends keyof UserTypes
    ? SchemaAbiTypeToPrimitiveType<UserTypes[TSchema[key]]["internalType"]>
    : never;
};

export type TableRecord<TKeySchema extends KeySchema = KeySchema, TValueSchema extends ValueSchema = ValueSchema> = {
  key: SchemaToPrimitives<TKeySchema>;
  value: SchemaToPrimitives<TValueSchema>;
};

export type ValueArgs = {
  staticData: Hex;
  encodedLengths: Hex;
  dynamicData: Hex;
};
