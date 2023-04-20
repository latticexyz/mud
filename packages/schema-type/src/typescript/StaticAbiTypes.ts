import { AbiTypes } from "./AbiTypes.js";
import { AbiTypeToSchemaType } from "./AbiTypeToSchemaType.js";
import { getStaticByteLength } from "./getStaticByteLength.js";
import { SchemaTypeToAbiType } from "./SchemaTypeToAbiType.js";
import { StaticSchemaType } from "./StaticSchemaType.js";

export type StaticAbiType = (typeof SchemaTypeToAbiType)[StaticSchemaType];
export const StaticAbiTypes = AbiTypes.filter(
  (abiType) => getStaticByteLength(AbiTypeToSchemaType[abiType]) > 0
) as StaticAbiType[];
