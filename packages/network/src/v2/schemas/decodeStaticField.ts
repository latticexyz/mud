import { SchemaType, SchemaTypeToPrimitive } from "@latticexyz/schema-type";
import { arrayToHex } from "@latticexyz/utils";

const unsupportedStaticField = (fieldType: never): never => {
  throw new Error(`Unsupported static field type: ${SchemaType[fieldType] ?? fieldType}`);
};

export const decodeStaticField = <T extends SchemaType>(
  fieldType: T,
  bytes: DataView,
  offset: number
): SchemaTypeToPrimitive[T] => {
  switch (fieldType) {
    case SchemaType.BOOL:
      return bytes.getUint8(offset) === 1;
    case SchemaType.UINT8:
      return bytes.getUint8(offset);
    case SchemaType.UINT16:
      return bytes.getUint16(offset);
    case SchemaType.UINT24:
      return bytes.getUint16(offset) + bytes.getUint8(offset + 16);
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
      return arrayToHex(bytes.buffer.slice(offset, offset + 20));
    default:
      return unsupportedStaticField(fieldType);
  }
};
