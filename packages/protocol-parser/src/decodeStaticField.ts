import { Hex, getAddress, hexToBigInt, hexToBool } from "viem";
import { StaticAbiType, StaticAbiTypeToPrimitiveType, staticAbiTypeToDefaultValue } from "./staticAbiTypes";

// TODO: narrow AbiType to what we support with SchemaType? (e.g. no tuples)

export function decodeStaticField<
  TAbiType extends StaticAbiType,
  TPrimitiveType extends StaticAbiTypeToPrimitiveType<TAbiType>
>(abiType: TAbiType, data: Hex): TPrimitiveType {
  if (/^u?int\d+$/.test(abiType)) {
    const value = hexToBigInt(data, { signed: /^int/.test(abiType) });
    const defaultValue = typeof staticAbiTypeToDefaultValue[abiType];
    if (typeof defaultValue === "number") {
      return Number(value) as TPrimitiveType;
    }
    if (typeof defaultValue === "bigint") {
      return value as TPrimitiveType;
    }
    // TODO: better error
    throw new Error("not implemented");
  }

  if (/^bytes(\d+)?$/.test(abiType)) {
    // TODO: decide if we want to enforce bytes length based on type
    return data as TPrimitiveType;
  }

  // TODO: decide if we should validate hex is bytes/octets (even number of hexidecimals)
  // TODO: decide if we should only parse packed-length hex (e.g. one byte or two hexidecimals for bool)
  if (abiType === "bool") {
    return hexToBool(data) as TPrimitiveType;
  }

  // TODO: decide if we want to enforce bytes length based on type
  if (abiType === "address") {
    return getAddress(data) as TPrimitiveType;
  }

  // TODO: throw better error
  throw new Error("not implemented");
}
