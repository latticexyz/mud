import {
  StaticPrimitiveType,
  DynamicPrimitiveType,
  staticAbiTypeToByteLength,
  dynamicAbiTypeToDefaultValue,
} from "@latticexyz/schema-type";
import { Hex } from "viem";
import { Schema } from "./common";
import { decodeDynamicField } from "./decodeDynamicField";
import { decodeStaticField } from "./decodeStaticField";
import { hexToPackedCounter } from "./hexToPackedCounter";
import { staticDataLength } from "./staticDataLength";
import { readHex } from "@latticexyz/common";

/** @deprecated use `decodeValue` instead */
export function decodeRecord(valueSchema: Schema, data: Hex): readonly (StaticPrimitiveType | DynamicPrimitiveType)[] {
  const values: (StaticPrimitiveType | DynamicPrimitiveType)[] = [];

  let bytesOffset = 0;
  valueSchema.staticFields.forEach((fieldType) => {
    const fieldByteLength = staticAbiTypeToByteLength[fieldType];
    const value = decodeStaticField(fieldType, readHex(data, bytesOffset, bytesOffset + fieldByteLength));
    bytesOffset += fieldByteLength;
    values.push(value);
  });

  // Warn user if static data length doesn't match the value schema, because data corruption might be possible.
  const schemaStaticDataLength = staticDataLength(valueSchema.staticFields);
  const actualStaticDataLength = bytesOffset;
  if (actualStaticDataLength !== schemaStaticDataLength) {
    console.warn(
      "Decoded static data length does not match value schema's expected static data length. Data may get corrupted. Is `getStaticByteLength` outdated?",
      {
        expectedLength: schemaStaticDataLength,
        actualLength: actualStaticDataLength,
        bytesOffset,
      }
    );
  }

  if (valueSchema.dynamicFields.length > 0) {
    const dataLayout = hexToPackedCounter(readHex(data, bytesOffset, bytesOffset + 32));
    bytesOffset += 32;

    valueSchema.dynamicFields.forEach((fieldType, i) => {
      const dataLength = dataLayout.fieldByteLengths[i];
      if (dataLength > 0) {
        const value = decodeDynamicField(fieldType, readHex(data, bytesOffset, bytesOffset + dataLength));
        bytesOffset += dataLength;
        values.push(value);
      } else {
        values.push(dynamicAbiTypeToDefaultValue[fieldType]);
      }
    });

    // Warn user if dynamic data length doesn't match the dynamic data length, because data corruption might be possible.
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
