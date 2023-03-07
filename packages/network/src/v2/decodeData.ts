import { SchemaType, getStaticByteLength } from "@latticexyz/schema-type";
import { hexToArray } from "./utils/hexToArray";
import { TableSchema } from "./constants";

const unsupportedStaticField = (fieldType: SchemaType): never => {
  throw new Error(`Unsupported static field type: ${SchemaType[fieldType] ?? fieldType}`);
};
const unsupportedDynamicField = (fieldType: SchemaType): never => {
  throw new Error(`Unsupported dynamic field type: ${SchemaType[fieldType] ?? fieldType}`);
};

// TODO: decode per static field type, so we get better return types for each field type
const decodeStaticField = (
  fieldType: SchemaType,
  bytes: DataView,
  offset: number
): boolean | number | bigint | ArrayBuffer => {
  switch (fieldType) {
    case SchemaType.BOOL:
      return bytes.getUint8(offset) === 1;
    case SchemaType.UINT8:
      return bytes.getUint8(offset);
    case SchemaType.UINT16:
      return bytes.getUint16(offset);
    case SchemaType.UINT32:
      return bytes.getUint32(offset);
    case SchemaType.UINT128:
      return bytes.getBigUint64(offset) + bytes.getBigUint64(offset + 8);
    case SchemaType.UINT256:
      return (
        bytes.getBigUint64(offset) +
        bytes.getBigUint64(offset + 8) +
        bytes.getBigUint64(offset + 16) +
        bytes.getBigUint64(offset + 24)
      );
    case SchemaType.BYTES4:
      return bytes.buffer.slice(offset, offset + 4);
    case SchemaType.BYTES32:
      return bytes.buffer.slice(offset, offset + 32);
    case SchemaType.ADDRESS:
      // TODO: convert to string?
      return bytes.buffer.slice(offset, offset + 20);
    default:
      return unsupportedStaticField(fieldType);
  }
};

// TODO: decode per dynamic field type, so we get better return types for each field type
const decodeDynamicField = (fieldType: SchemaType, data: ArrayBuffer): ArrayBuffer | string => {
  switch (fieldType) {
    case SchemaType.BYTES:
      return data;
    case SchemaType.STRING:
      return new TextDecoder().decode(data);
    // TODO: array types
    default:
      return unsupportedDynamicField(fieldType);
  }
};

export const decodeData = (schema: TableSchema, hexData: string): Record<number, any> => {
  const data: Record<number, any> = {};
  const bytes = new DataView(hexToArray(hexData).buffer);

  let bytesOffset = 0;
  schema.staticFields.forEach((fieldType, i) => {
    const value = decodeStaticField(fieldType, bytes, bytesOffset);
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
    const dynamicDataLayout = new DataView(bytes.buffer.slice(schema.staticDataLength, schema.staticDataLength + 32));
    bytesOffset += 32;

    const dynamicDataLength = dynamicDataLayout.getUint32(0);

    schema.dynamicFields.forEach((fieldType, i) => {
      const dataLength = dynamicDataLayout.getUint16(4 + i * 2);
      const value = decodeDynamicField(fieldType, bytes.buffer.slice(bytesOffset, bytesOffset + dataLength));
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

export const decodeField = (schema: TableSchema, schemaIndex: number, hexData: string): Record<number, any> => {
  const data: Record<number, any> = {};
  const bytes = new DataView(hexToArray(hexData).buffer);

  schema.staticFields.forEach((fieldType, index) => {
    if (index === schemaIndex) {
      data[schemaIndex] = decodeStaticField(fieldType, bytes, 0);
    }
  });

  if (schema.dynamicFields.length > 0) {
    schema.dynamicFields.forEach((fieldType, i) => {
      const index = schema.staticFields.length + i;
      if (index === schemaIndex) {
        // if (hexData === "0x") console.log("decoding dynamic field");
        data[schemaIndex] = decodeDynamicField(fieldType, bytes.buffer);
      }
    });
  }

  return data;
};
