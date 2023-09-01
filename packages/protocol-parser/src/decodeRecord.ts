import {
  StaticPrimitiveType,
  DynamicPrimitiveType,
  staticAbiTypeToByteLength,
  dynamicAbiTypeToDefaultValue,
} from "@latticexyz/schema-type";
import { Hex, sliceHex } from "viem";
import { Schema } from "./common";
import { decodeDynamicField } from "./decodeDynamicField";
import { decodeStaticField } from "./decodeStaticField";
import { hexToPackedCounter } from "./hexToPackedCounter";
import { staticDataLength } from "./staticDataLength";

/** @deprecated use `decodeValue` instead */
export function decodeRecord(schema: Schema, data: Hex): readonly (StaticPrimitiveType | DynamicPrimitiveType)[] {
  const values: (StaticPrimitiveType | DynamicPrimitiveType)[] = [];

  let bytesOffset = 0;
  schema.staticFields.forEach((fieldType) => {
    const fieldByteLength = staticAbiTypeToByteLength[fieldType];
    const value = decodeStaticField(fieldType, sliceHex(data, bytesOffset, bytesOffset + fieldByteLength));
    bytesOffset += fieldByteLength;
    values.push(value);
  });

  // Warn user if static data length doesn't match the schema, because data corruption might be possible.
  const schemaStaticDataLength = staticDataLength(schema.staticFields);
  const actualStaticDataLength = bytesOffset;
  if (actualStaticDataLength !== schemaStaticDataLength) {
    console.warn(
      "Decoded static data length does not match schema's expected static data length. Data may get corrupted. Is `getStaticByteLength` outdated?",
      {
        expectedLength: schemaStaticDataLength,
        actualLength: actualStaticDataLength,
        bytesOffset,
      }
    );
  }

  if (schema.dynamicFields.length > 0) {
    const dataLayout = hexToPackedCounter(sliceHex(data, bytesOffset, bytesOffset + 32));
    bytesOffset += 32;

    schema.dynamicFields.forEach((fieldType, i) => {
      const dataLength = dataLayout.fieldByteLengths[i];
      if (dataLength > 0) {
        const value = decodeDynamicField(fieldType, sliceHex(data, bytesOffset, bytesOffset + dataLength));
        bytesOffset += dataLength;
        values.push(value);
      } else {
        values.push(dynamicAbiTypeToDefaultValue[fieldType]);
      }
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
