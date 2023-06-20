import { Hex, hexToNumber, sliceHex } from "viem";
import { Schema } from "./common";
import { StaticAbiType, StaticPrimitiveType, staticAbiTypeToByteLength } from "./staticAbiTypes";
import { DynamicAbiType, DynamicPrimitiveType } from "./dynamicAbiTypes";
import { schemaAbiTypes } from "./schemaAbiTypes";
import { InvalidHexLengthForSchemaError, SchemaStaticLengthMismatchError } from "./errors";
import { decodeStaticField } from "./decodeStaticField";
import { hexToPackedCounter } from "./hexToPackedCounter";
import { decodeDynamicField } from "./decodeDynamicField";

// TODO: convert schema to class so that we can have static methods for decoding, etc.

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

  function decodeData(data: Hex): (StaticPrimitiveType | DynamicPrimitiveType)[] {
    const values: (StaticPrimitiveType | DynamicPrimitiveType)[] = [];

    let bytesOffset = 0;
    staticFields.forEach((fieldType) => {
      const fieldByteLength = staticAbiTypeToByteLength[fieldType];
      const value = decodeStaticField(fieldType, sliceHex(data, bytesOffset, bytesOffset + fieldByteLength));
      bytesOffset += fieldByteLength;
      values.push(value);
    });

    // Warn user if static data length doesn't match the schema, because data corruption might be possible.
    const actualStaticDataLength = bytesOffset;
    if (actualStaticDataLength !== staticDataLength) {
      console.warn(
        "Decoded static data length does not match schema's expected static data length. Data may get corrupted. Is `getStaticByteLength` outdated?",
        {
          expectedLength: staticDataLength,
          actualLength: actualStaticDataLength,
          bytesOffset,
        }
      );
    }

    if (dynamicFields.length > 0) {
      const dataLayout = hexToPackedCounter(sliceHex(data, bytesOffset, bytesOffset + 32));
      bytesOffset += 32;

      dynamicFields.forEach((fieldType, i) => {
        const dataLength = dataLayout.fieldByteLengths[i];
        const value = decodeDynamicField(fieldType, sliceHex(data, bytesOffset, bytesOffset + dataLength));
        bytesOffset += dataLength;
        values.push(value);
      });

      // Warn user if dynamic data length doesn't match the schema, because data corruption might be possible.
      const actualDynamicDataLength = bytesOffset - 32 - actualStaticDataLength;
      // TODO: refactor this so we don't break for bytes offsets >UINT40
      if (BigInt(actualDynamicDataLength) !== dataLayout.totalByteLength) {
        console.warn(
          "Decoded dynamic data length does not match data layout's expected data length. Data may get corrupted. Did the data layout change?",
          {
            expectedLength: dataLayout.totalByteLength,
            actualLength: actualDynamicDataLength,
            bytesOffset,
          }
        );
      }
    }

    return values;
  }

  return {
    staticDataLength,
    staticFields,
    dynamicFields,
    isEmpty: data === "0x",
    schemaData: data,
    decodeData,
  };
}
