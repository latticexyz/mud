import { Hex } from "viem";
import { schemaAbiTypes, StaticAbiType, DynamicAbiType, staticAbiTypeToByteLength } from "@latticexyz/schema-type";

export function abiTypesToSchemaData(staticFields: StaticAbiType[], dynamicFields: DynamicAbiType[] = []): Hex {
  const staticDataLength = staticFields.reduce((acc, fieldType) => acc + staticAbiTypeToByteLength[fieldType], 0);
  const numStaticFields = staticFields.length;
  const numDynamicFields = dynamicFields.length;
  const staticSchemaTypes = staticFields.map((abiType) => schemaAbiTypes.indexOf(abiType));
  const dynamicSchemaTypes = dynamicFields.map((abiType) => schemaAbiTypes.indexOf(abiType));
  return `0x${[
    staticDataLength.toString(16).padStart(4, "0"),
    numStaticFields.toString(16).padStart(2, "0"),
    numDynamicFields.toString(16).padStart(2, "0"),
    ...staticSchemaTypes.map((schemaType) => schemaType.toString(16).padStart(2, "0")),
    ...dynamicSchemaTypes.map((schemaType) => schemaType.toString(16).padStart(2, "0")),
  ]
    .join("")
    .padEnd(64, "0")}`;
}
