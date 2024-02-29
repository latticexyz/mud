import { StaticAbiType, DynamicAbiType, schemaAbiTypes, staticAbiTypeToByteLength } from "@latticexyz/schema-type";
import { Hex, hexToNumber, sliceHex } from "viem";
import { Schema } from "./common";
import { InvalidHexLengthForSchemaError, SchemaStaticLengthMismatchError } from "./errors";

export function hexToSchema(data: Hex): Schema {
  if (data.length !== 66) {
    throw new InvalidHexLengthForSchemaError(data);
  }

  const staticDataLength = hexToNumber(sliceHex(data, 0, 2));
  const numStaticFields = hexToNumber(sliceHex(data, 2, 3));
  const numDynamicFields = hexToNumber(sliceHex(data, 3, 4));
  const staticFields: StaticAbiType[] = [];
  const dynamicFields: DynamicAbiType[] = [];

  for (let i = 4; i < 4 + numStaticFields; i++) {
    const schemaTypeIndex = hexToNumber(sliceHex(data, i, i + 1));
    staticFields.push(schemaAbiTypes[schemaTypeIndex] as StaticAbiType);
  }
  for (let i = 4 + numStaticFields; i < 4 + numStaticFields + numDynamicFields; i++) {
    const schemaTypeIndex = hexToNumber(sliceHex(data, i, i + 1));
    dynamicFields.push(schemaAbiTypes[schemaTypeIndex] as DynamicAbiType);
  }

  // validate static data length
  const actualStaticDataLength = staticFields.reduce((acc, fieldType) => acc + staticAbiTypeToByteLength[fieldType], 0);
  if (actualStaticDataLength !== staticDataLength) {
    console.warn(
      `Schema "${data}" static data length (${staticDataLength}) did not match the summed length of all static fields (${actualStaticDataLength}). ` +
        `Is \`staticAbiTypeToByteLength\` up to date with Solidity schema types?`
    );
    throw new SchemaStaticLengthMismatchError(data, staticDataLength, actualStaticDataLength);
  }

  return { staticFields, dynamicFields };
}
