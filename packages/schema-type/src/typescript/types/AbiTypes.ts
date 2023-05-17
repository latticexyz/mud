import { SchemaType } from "../SchemaType";
import { SchemaTypeToAbiType } from "../mappings/SchemaTypeToAbiType";

export type AbiType = (typeof SchemaTypeToAbiType)[SchemaType];
export const AbiTypes = Object.values(SchemaTypeToAbiType);
