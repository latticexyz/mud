import { StaticArray, StringForUnion } from "@latticexyz/common/type-utils";
import { AbiType } from "@latticexyz/schema-type";

export type FieldData<UserTypes extends StringForUnion = StringForUnion> = AbiType | StaticArray | UserTypes;

type FullSchemaConfig<UserTypes extends StringForUnion = StringForUnion> = Record<string, FieldData<UserTypes>>;

type ShorthandSchemaConfig<UserTypes extends StringForUnion = StringForUnion> = FieldData<UserTypes>;

export type SchemaConfig<UserTypes extends StringForUnion = StringForUnion> =
  | FullSchemaConfig<UserTypes>
  | ShorthandSchemaConfig<UserTypes>;

export type ExpandedSchemaConfig<C extends SchemaConfig> = C extends Record<string, unknown> ? C : { value: C };
