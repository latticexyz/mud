import { Hex, numberToHex } from "viem";
import { DynamicAbiType, dynamicAbiTypes } from "./dynamicAbiTypes";
import { schemaAbiTypes } from "./schemaAbiTypes";
import { StaticAbiType, staticAbiTypeToByteLength } from "./staticAbiTypes";

export function abiTypesToRawSchema(staticFields: StaticAbiType[], dynamicFields: DynamicAbiType[] = []): Hex {
  const staticDataLength = staticFields.reduce((acc, fieldType) => acc + staticAbiTypeToByteLength[fieldType], 0);
  const numStaticFields = staticFields.length;
  const numDynamicFields = dynamicFields.length;
  const staticSchemaTypes = staticFields.map((abiType) => schemaAbiTypes.indexOf(abiType));
  const dynamicSchemaTypes = dynamicAbiTypes.map((abiType) => schemaAbiTypes.indexOf(abiType));
  return `0x${[
    numberToHex(staticDataLength, { size: 2 }),
    numberToHex(numStaticFields, { size: 1 }),
    numberToHex(numDynamicFields, { size: 1 }),
    ...staticSchemaTypes.map((schemaType) => numberToHex(schemaType, { size: 1 })),
    ...dynamicSchemaTypes.map((schemaType) => numberToHex(schemaType, { size: 1 })),
  ].join("")}`;
}
