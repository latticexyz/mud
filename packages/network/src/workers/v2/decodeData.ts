import { DynamicSchemaType, StaticSchemaType, SchemaType, getStaticByteLength } from "@latticexyz/schema-type";
import { hexToArray } from "./hexToArray";
import { TableSchema } from "./schemas";

const unsupportedStaticField = (fieldType: StaticSchemaType): never => {
  throw new Error(`Unsupported static field type: ${SchemaType[fieldType as SchemaType] ?? fieldType}`);
};
const unsupportedDynamicField = (fieldType: DynamicSchemaType): never => {
  throw new Error(`Unsupported dynamic field type: ${SchemaType[fieldType as SchemaType] ?? fieldType}`);
};

// TODO: decode per static field type, so we get better return types for each field type
const decodeStaticField = (
  fieldType: StaticSchemaType,
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
      unsupportedStaticField(fieldType);
      return 0;
  }
};

// TODO: decode per dynamic field type, so we get better return types for each field type
const decodeDynamicField = (fieldType: DynamicSchemaType, data: ArrayBuffer): ArrayBuffer | string => {
  switch (fieldType) {
    case SchemaType.BYTES:
      return data;
    case SchemaType.STRING:
      return new TextDecoder().decode(data);
    // TODO: array types
    default:
      unsupportedDynamicField(fieldType);
      return new ArrayBuffer(0);
  }
};

export const decodeData = (schema: TableSchema, hexData: string): Record<number, any> => {
  const data: Record<number, any> = {};
  const bytes = new DataView(hexToArray(hexData).buffer);

  let bytesOffset = 0;
  schema.staticFields.forEach((fieldType, i) => {
    // TODO: field names
    // TODO: figure out better type approach for static vs dynamic fields
    const value = decodeStaticField(fieldType as StaticSchemaType, bytes, bytesOffset);
    bytesOffset += getStaticByteLength(fieldType);
    data[i] = value;
  });

  // TODO: validate that bytesOffset = staticDataLength?

  if (schema.dynamicFields.length > 0) {
    const dynamicDataLayout = new DataView(bytes.buffer.slice(schema.staticDataLength, schema.staticDataLength + 32));
    bytesOffset += 32;

    const dynamicDataLength = dynamicDataLayout.getUint32(0);

    schema.dynamicFields.forEach((fieldType, i) => {
      const dataLength = dynamicDataLayout.getUint16(4 + i * 2);
      // TODO: field names
      // TODO: figure out better type approach for static vs dynamic fields
      const value = decodeDynamicField(
        fieldType as DynamicSchemaType,
        bytes.buffer.slice(bytesOffset, bytesOffset + dataLength)
      );
      bytesOffset += dataLength;
      data[schema.staticFields.length + i] = value;
    });

    // TODO: validate that dynamicOffset = dynamicDataLength?
  }

  return data;
};

export const decodeField = (schema: TableSchema, schemaIndex: number, hexData: string): Record<number, any> => {
  const data: Record<number, any> = {};
  const bytes = new DataView(hexToArray(hexData).buffer);

  schema.staticFields.forEach((fieldType, index) => {
    if (index === schemaIndex) {
      data[schemaIndex] = decodeStaticField(fieldType as StaticSchemaType, bytes, 0);
    }
  });

  if (schema.dynamicFields.length > 0) {
    schema.dynamicFields.forEach((fieldType, i) => {
      const index = schema.staticFields.length + i;
      if (index === schemaIndex) {
        if (hexData === "0x") console.log("decoding dynamic field");
        data[schemaIndex] = decodeDynamicField(fieldType as DynamicSchemaType, bytes.buffer);
      }
    });
  }

  return data;
};
