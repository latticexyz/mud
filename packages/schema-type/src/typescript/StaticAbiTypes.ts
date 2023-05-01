import { AbiTypes } from "./AbiTypes";
import { AbiTypeToSchemaType } from "./AbiTypeToSchemaType";
import { getStaticByteLength } from "./getStaticByteLength";
import { SchemaTypeToAbiType } from "./SchemaTypeToAbiType";
import { StaticSchemaType } from "./StaticSchemaType";

export type StaticAbiType = (typeof SchemaTypeToAbiType)[StaticSchemaType];
export const StaticAbiTypes = AbiTypes.filter(
  (abiType) => getStaticByteLength(AbiTypeToSchemaType[abiType]) > 0
) as StaticAbiType[];
