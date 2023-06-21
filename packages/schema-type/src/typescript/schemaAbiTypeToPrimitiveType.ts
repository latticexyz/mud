import { Hex } from "viem";
import { schemaAbiTypeToDefaultValue } from "./schemaAbiTypeToDefaultValue";
import { SchemaAbiType } from "./schemaAbiTypes";

type LiteralToBroad<T> = T extends number
  ? number
  : T extends bigint
  ? bigint
  : T extends Hex
  ? Hex
  : T extends boolean
  ? boolean
  : T extends string
  ? string
  : never;

export type SchemaAbiTypeToPrimitiveType<T extends SchemaAbiType> = LiteralToBroad<
  (typeof schemaAbiTypeToDefaultValue)[T]
>;
