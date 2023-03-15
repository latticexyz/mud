import { getStaticByteLength, SchemaType, StaticSchemaType } from "@latticexyz/schema-type";
import { arrayToHex } from "@latticexyz/utils";

const unsupportedStaticField = (fieldType: never): never => {
  throw new Error(`Unsupported static field type: ${SchemaType[fieldType] ?? fieldType}`);
};

const uintToNumber = (bytes: DataView, offset: number, length: number) => {
  if (length > 6) {
    throw new Error("uintToNumber: number can only fit 6 bytes");
  }
  let num = 0;
  for (let i = 0; i < length; i++) {
    num += bytes.getUint8(offset + i);
  }
  return num;
};

const intToNumber = (bytes: DataView, offset: number, length: number) => {
  if (length > 6) {
    throw new Error("uintToNumber: number can only fit 6 bytes");
  }
  let num = 0;
  for (let i = 0; i < length; i++) {
    num += bytes.getInt8(offset + i);
  }
  return num;
};

const uintToBigInt = (bytes: DataView, offset: number, length: number) => {
  let num = 0n;
  for (let i = 0; i < length; i++) {
    num += BigInt(bytes.getUint8(offset + i));
  }
  return num;
};

const intToBigInt = (bytes: DataView, offset: number, length: number) => {
  let num = 0n;
  for (let i = 0; i < length; i++) {
    num += BigInt(bytes.getInt8(offset + i));
  }
  return num;
};

// TODO: figure out how to use with SchemaTypeToPrimitive<T> return type to ensure correctness here
export const decodeStaticField = <T extends StaticSchemaType>(fieldType: T, bytes: DataView, offset: number) => {
  switch (fieldType) {
    case SchemaType.BOOL:
      return uintToNumber(bytes, offset, 1) === 1;
    case SchemaType.UINT8:
    case SchemaType.UINT16:
    case SchemaType.UINT24:
    case SchemaType.UINT32:
    case SchemaType.UINT40:
    case SchemaType.UINT48:
      return uintToNumber(bytes, offset, getStaticByteLength(fieldType));
    case SchemaType.UINT56:
    case SchemaType.UINT64:
    case SchemaType.UINT72:
    case SchemaType.UINT80:
    case SchemaType.UINT88:
    case SchemaType.UINT96:
    case SchemaType.UINT104:
    case SchemaType.UINT112:
    case SchemaType.UINT120:
    case SchemaType.UINT128:
    case SchemaType.UINT136:
    case SchemaType.UINT144:
    case SchemaType.UINT152:
    case SchemaType.UINT160:
    case SchemaType.UINT168:
    case SchemaType.UINT176:
    case SchemaType.UINT184:
    case SchemaType.UINT192:
    case SchemaType.UINT200:
    case SchemaType.UINT208:
    case SchemaType.UINT216:
    case SchemaType.UINT224:
    case SchemaType.UINT232:
    case SchemaType.UINT240:
    case SchemaType.UINT248:
    case SchemaType.UINT256:
      return uintToBigInt(bytes, offset, getStaticByteLength(fieldType));
    case SchemaType.INT8:
    case SchemaType.INT16:
    case SchemaType.INT24:
    case SchemaType.INT32:
    case SchemaType.INT40:
    case SchemaType.INT48:
      return intToNumber(bytes, offset, getStaticByteLength(fieldType));
    case SchemaType.INT56:
    case SchemaType.INT64:
    case SchemaType.INT72:
    case SchemaType.INT80:
    case SchemaType.INT88:
    case SchemaType.INT96:
    case SchemaType.INT104:
    case SchemaType.INT112:
    case SchemaType.INT120:
    case SchemaType.INT128:
    case SchemaType.INT136:
    case SchemaType.INT144:
    case SchemaType.INT152:
    case SchemaType.INT160:
    case SchemaType.INT168:
    case SchemaType.INT176:
    case SchemaType.INT184:
    case SchemaType.INT192:
    case SchemaType.INT200:
    case SchemaType.INT208:
    case SchemaType.INT216:
    case SchemaType.INT224:
    case SchemaType.INT232:
    case SchemaType.INT240:
    case SchemaType.INT248:
    case SchemaType.INT256:
      return intToBigInt(bytes, offset, getStaticByteLength(fieldType as SchemaType));
    case SchemaType.BYTES1:
    case SchemaType.BYTES2:
    case SchemaType.BYTES3:
    case SchemaType.BYTES4:
    case SchemaType.BYTES5:
    case SchemaType.BYTES6:
    case SchemaType.BYTES7:
    case SchemaType.BYTES8:
    case SchemaType.BYTES9:
    case SchemaType.BYTES10:
    case SchemaType.BYTES11:
    case SchemaType.BYTES12:
    case SchemaType.BYTES13:
    case SchemaType.BYTES14:
    case SchemaType.BYTES15:
    case SchemaType.BYTES16:
    case SchemaType.BYTES17:
    case SchemaType.BYTES18:
    case SchemaType.BYTES19:
    case SchemaType.BYTES20:
    case SchemaType.BYTES21:
    case SchemaType.BYTES22:
    case SchemaType.BYTES23:
    case SchemaType.BYTES24:
    case SchemaType.BYTES25:
    case SchemaType.BYTES26:
    case SchemaType.BYTES27:
    case SchemaType.BYTES28:
    case SchemaType.BYTES29:
    case SchemaType.BYTES30:
    case SchemaType.BYTES31:
    case SchemaType.BYTES32:
    case SchemaType.ADDRESS:
      return arrayToHex(bytes.buffer.slice(offset, offset + getStaticByteLength(fieldType as SchemaType)));
    default:
      return unsupportedStaticField(fieldType);
  }
};
