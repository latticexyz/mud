import { Hex, hexToNumber, sliceHex } from "viem";
import { Schema, TableSchema } from "./common";
import { StaticAbiType, staticAbiTypeToByteLength } from "./staticAbiTypes";
import { DynamicAbiType } from "./dynamicAbiTypes";
import { schemaAbiTypes } from "./schemaAbiTypes";

export function decodeTableSchema(data: Hex): TableSchema {
  const valueSchema = decodeSchema(sliceHex(data, 0, 32));
  const keySchema = decodeSchema(sliceHex(data, 32, 64));
  return {
    keySchema,
    valueSchema,
    isEmpty: data === "0x",
    rawSchema: data,
  };
}

function decodeSchema(data: Hex): Schema {
  if (data.length !== 66) {
    // TODO: better error
    throw new Error("wrong length");
  }

  const staticDataLength = hexToNumber(sliceHex(data, 0, 2));
  const numStaticFields = hexToNumber(sliceHex(data, 2, 1));
  const numDynamicFields = hexToNumber(sliceHex(data, 3, 1));
  const staticFields: StaticAbiType[] = [];
  const dynamicFields: DynamicAbiType[] = [];

  for (let i = 4; i < 4 + numStaticFields; i++) {
    const schemaTypeIndex = hexToNumber(sliceHex(data, i, 1));
    staticFields.push(schemaAbiTypes[schemaTypeIndex] as StaticAbiType);
  }
  for (let i = 4 + numStaticFields; i < 4 + numStaticFields + numDynamicFields; i++) {
    const schemaTypeIndex = hexToNumber(sliceHex(data, i, 1));
    dynamicFields.push(schemaAbiTypes[schemaTypeIndex] as DynamicAbiType);
  }

  // validate static data length
  const actualStaticDataLength = staticFields.reduce((acc, fieldType) => acc + staticAbiTypeToByteLength[fieldType], 0);
  if (actualStaticDataLength !== staticDataLength) {
    console.error("Schema static data length mismatch! Is `staticAbiTypeToByteLength` outdated?", {
      schemaStaticDataLength: staticDataLength,
      actualStaticDataLength,
      data,
    });
    throw new Error("Schema static data length mismatch! Is `staticAbiTypeToByteLength` outdated?");
  }

  const abiTypes = [...staticFields, ...dynamicFields];
  const abi = `(${abiTypes.join(",")})`;

  return {
    staticDataLength,
    staticFields,
    dynamicFields,
    abi,
    isEmpty: data === "0x",
    rawSchema: data,
  };
}
