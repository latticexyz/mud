import { AbiTypes } from "./AbiTypes";
import { AbiTypeToSchemaType } from "../mappings/AbiTypeToSchemaType";
import { getStaticByteLength } from "../utils/getStaticByteLength";
import { SchemaTypeToAbiType } from "../mappings/SchemaTypeToAbiType";
import { StaticSchemaType } from "./StaticSchemaType";

export type StaticAbiType = (typeof SchemaTypeToAbiType)[StaticSchemaType];
export const StaticAbiTypes = AbiTypes.filter(
  (abiType) => getStaticByteLength(AbiTypeToSchemaType[abiType]) > 0
) as StaticAbiType[];
