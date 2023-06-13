import { Hex, hexToNumber, sliceHex } from "viem";
import { Schema } from "./common";
import { StaticAbiType, DynamicAbiType } from "@latticexyz/schema-type";
import { staticAbiTypeToByteLength } from "./staticAbiTypes";
import { schemaAbiTypes } from "../../schema-type/src/typescript/schemaAbiTypes";
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
    throw new SchemaStaticLengthMismatchError(data, staticDataLength, actualStaticDataLength);
  }

  return {
    staticDataLength,
    staticFields,
    dynamicFields,
    isEmpty: data === "0x",
    schemaData: data,
  };
}
