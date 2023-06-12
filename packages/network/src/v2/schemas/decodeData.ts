import { DynamicSchemaType, getStaticByteLength, SchemaType, StaticSchemaType } from "@latticexyz/schema-type";
import { hexToArray } from "@latticexyz/utils";
import { Schema } from "../common";
import { decodeStaticField } from "./decodeStaticField";
import { decodeDynamicField } from "./decodeDynamicField";

export const decodeData = (schema: Schema, hexData: string): Record<number, any> => {
  const data: Record<number, any> = {};
  const bytes = hexToArray(hexData);

  let bytesOffset = 0;
  schema.staticFields.forEach((fieldType, i) => {
    const value = decodeStaticField(fieldType as StaticSchemaType, bytes, bytesOffset);
    bytesOffset += getStaticByteLength(fieldType);
    data[i] = value;
  });

  // Warn user if static data length doesn't match the schema, because data corruption might be possible.
  const actualStaticDataLength = bytesOffset;
  if (actualStaticDataLength !== schema.staticDataLength) {
    console.warn(
      "Decoded static data length does not match schema's expected static data length. Data may get corrupted. Is `getStaticByteLength` outdated?",
      {
        expectedLength: schema.staticDataLength,
        actualLength: actualStaticDataLength,
        bytesOffset,
        schema,
        hexData,
      }
    );
  }

  if (schema.dynamicFields.length > 0) {
    const dynamicDataLayout = bytes.slice(schema.staticDataLength, schema.staticDataLength + 32);
    bytesOffset += 32;

    // keep in sync with PackedCounter.sol
    const packedCounterAccumulatorType = SchemaType.UINT56;
    const packedCounterCounterType = SchemaType.UINT40;
    const dynamicDataLength = decodeStaticField(packedCounterAccumulatorType, dynamicDataLayout, 0) as bigint;

    schema.dynamicFields.forEach((fieldType, i) => {
      const dataLength = decodeStaticField(
        packedCounterCounterType,
        dynamicDataLayout,
        getStaticByteLength(packedCounterAccumulatorType) + i * getStaticByteLength(packedCounterCounterType)
      ) as number;
      const value = decodeDynamicField(
        fieldType as DynamicSchemaType,
        bytes.slice(bytesOffset, bytesOffset + dataLength)
      );
      bytesOffset += dataLength;
      data[schema.staticFields.length + i] = value;
    });

    // Warn user if dynamic data length doesn't match the schema, because data corruption might be possible.
    const actualDynamicDataLength = bytesOffset - 32 - actualStaticDataLength;
    // TODO: refactor this so we don't break for bytes offsets >UINT40
    if (BigInt(actualDynamicDataLength) !== dynamicDataLength) {
      console.warn(
        "Decoded dynamic data length does not match data layout's expected data length. Data may get corrupted. Did the data layout change?",
        {
          expectedLength: dynamicDataLength,
          actualLength: actualDynamicDataLength,
          bytesOffset,
          schema,
          hexData,
        }
      );
    }
  }

  return data;
};
