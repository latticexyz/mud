import { AbiTypes } from "./AbiTypes";
import { SchemaTypeToAbiType } from "../mappings/SchemaTypeToAbiType";
import { DynamicSchemaType } from "./DynamicSchemaType";
import { getAbiByteLength } from "../utils/getAbiByteLength";

export type DynamicAbiType = (typeof SchemaTypeToAbiType)[DynamicSchemaType];

export const DynamicAbiTypes = AbiTypes.filter((abiType) => getAbiByteLength(abiType) > 0) as DynamicAbiType[];
