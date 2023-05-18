import { ArraySchemaType } from "./ArraySchemaType";
import { SchemaTypeToAbiType } from "../mappings/SchemaTypeToAbiType";
import { AbiTypes } from "./AbiTypes";

export type ArrayAbiType = (typeof SchemaTypeToAbiType)[ArraySchemaType];

export function isArrayAbiType(type: any): type is ArrayAbiType {
  return AbiTypes.includes(type) && type.endsWith("[]");
}
