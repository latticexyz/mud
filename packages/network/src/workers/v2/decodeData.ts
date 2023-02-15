import { DynamicLengthFields, SchemaType, StaticLengthFields } from "./SchemaType";
import { hexToArray } from "./hexToArray";
import { Schema } from "./schemas";
import { staticFieldLengths } from "./staticFieldLengths";

const invalidStaticField = (fieldType: StaticLengthFields): never => {
  throw new Error(`Invalid static field type: ${fieldType}`);
};
const invalidDynamicField = (fieldType: DynamicLengthFields): never => {
  throw new Error(`Invalid dynamic field type: ${fieldType}`);
};

// TODO: decode per static field type, so we get better return types for each field type
const decodeStaticField = (
  fieldType: StaticLengthFields,
  bytes: DataView,
  offset: number
): number | bigint | ArrayBuffer => {
  switch (fieldType) {
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
      invalidStaticField(fieldType);
      return 0;
  }
};

// TODO: decode per dynamic field type, so we get better return types for each field type
const decodeDynamicField = (fieldType: DynamicLengthFields, data: ArrayBuffer): ArrayBuffer | string => {
  switch (fieldType) {
    case SchemaType.BYTES:
      return data;
    case SchemaType.STRING:
      return new TextDecoder().decode(data);
    // TODO: array types
    default:
      invalidDynamicField(fieldType);
      return new ArrayBuffer(0);
  }
};

export const decodeData = (schema: Schema, hexData: string): Record<number, any> => {
  const data: Record<number, any> = {};
  const bytes = new DataView(hexToArray(hexData).buffer);

  let bytesOffset = 0;
  schema.staticFields.forEach((fieldType, i) => {
    // TODO: field names
    // TODO: figure out better type approach for static vs dynamic fields
    const value = decodeStaticField(fieldType as StaticLengthFields, bytes, bytesOffset);
    bytesOffset += staticFieldLengths[fieldType as StaticLengthFields];
    data[i] = value;
  });

  // TODO: validate that bytesOffset = staticDataLenght?

  if (schema.dynamicFields.length > 0) {
    const dynamicDataLayout = new DataView(bytes.buffer.slice(schema.staticDataLength, schema.staticDataLength + 32));
    bytesOffset += 32;

    const dynamicDataLength = dynamicDataLayout.getUint32(0);

    schema.dynamicFields.forEach((fieldType, i) => {
      const dataLength = dynamicDataLayout.getUint16(4 + i * 2);
      // TODO: field names
      // TODO: figure out better type approach for static vs dynamic fields
      const value = decodeDynamicField(
        fieldType as DynamicLengthFields,
        bytes.buffer.slice(bytesOffset, bytesOffset + dataLength)
      );
      bytesOffset += dataLength;
      data[schema.staticFields.length + i] = value;
    });

    // TODO: validate that dynamicOffset = dynamicDataLength?
  }

  return data;
};
