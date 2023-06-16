import { AbiTypeToPrimitiveType } from "./AbiTypeToPrimitiveType";
import { SchemaType } from "../SchemaType";
import { SchemaTypeToAbiType } from "./SchemaTypeToAbiType";

export type SchemaTypeToPrimitiveType<S extends SchemaType> = SchemaTypeToPrimitiveTypeLookup[S];

export type SchemaTypeToPrimitiveTypeLookup = {
  [SchemaType in keyof typeof SchemaTypeToAbiType]: AbiTypeToPrimitiveType<(typeof SchemaTypeToAbiType)[SchemaType]>;
};
