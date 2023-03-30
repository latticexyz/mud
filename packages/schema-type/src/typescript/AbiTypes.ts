import { SchemaType } from "./SchemaType.js";
import { SchemaTypeToAbiType } from "./SchemaTypeToAbiType.js";

export type AbiType = (typeof SchemaTypeToAbiType)[SchemaType];
export const AbiTypes = Object.values(SchemaTypeToAbiType);

export const testChange = "hello 489";
