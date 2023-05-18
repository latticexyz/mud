import { AbiTypes } from "./AbiTypes";
import { SchemaTypeToAbiType } from "../mappings/SchemaTypeToAbiType";
import { StaticSchemaType } from "./StaticSchemaType";
import { getAbiByteLength } from "../utils/getAbiByteLength";

export type StaticAbiType = (typeof SchemaTypeToAbiType)[StaticSchemaType];

export const StaticAbiTypes = AbiTypes.filter((abiType) => getAbiByteLength(abiType) > 0) as StaticAbiType[];
