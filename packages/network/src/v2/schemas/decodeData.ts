import { DynamicSchemaType, getStaticByteLength, StaticSchemaType } from "@latticexyz/schema-type";
import { hexToArray } from "@latticexyz/utils";
import { TableSchema } from "../common";
import { decodeStaticField } from "./decodeStaticField";
import { decodeDynamicField } from "./decodeDynamicField";

export const decodeData = (schema: TableSchema, hexData: string): Record<number, any> => {
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
        bytesOffset,
        schema,
        hexData,
      }
    );
  }

  if (schema.dynamicFields.length > 0) {
    const dynamicDataLayout = new DataView(bytes.slice(schema.staticDataLength, schema.staticDataLength + 32).buffer);
    bytesOffset += 32;

    const dynamicDataLength = dynamicDataLayout.getUint32(0);

    schema.dynamicFields.forEach((fieldType, i) => {
      const dataLength = dynamicDataLayout.getUint16(4 + i * 2);
      const value = decodeDynamicField(
        fieldType as DynamicSchemaType,
        bytes.slice(bytesOffset, bytesOffset + dataLength)
      );
      bytesOffset += dataLength;
      data[schema.staticFields.length + i] = value;
    });

    // Warn user if dynamic data length doesn't match the schema, because data corruption might be possible.
    const actualDynamicDataLength = bytesOffset - 32 - actualStaticDataLength;
    if (actualDynamicDataLength !== dynamicDataLength) {
      console.warn(
        "Decoded dynamic data length does not match data layout's expected data length. Data may get corrupted. Did the data layout change?",
        {
          bytesOffset,
          schema,
          hexData,
        }
      );
    }
  }

  return data;
};
