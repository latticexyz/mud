import { AbiTypeToPrimitiveType, getAbiTypeDefaultValue } from "@latticexyz/schema-type";
import { AbiType } from "abitype";
import { Hex, getAddress, hexToBigInt, hexToBool, hexToString, trim } from "viem";

// TODO: narrow AbiType to what we support with SchemaType? (e.g. no tuples)

export function decodeValue<TAbiType extends AbiType, TPrimitiveType extends AbiTypeToPrimitiveType<TAbiType>>(
  abiType: AbiType,
  data: Hex
): TPrimitiveType {
  // TODO: decide if we should validate hex is bytes/octets (even number of hexidecimals)
  // TODO: decide if we should only parse packed-length hex (e.g. one byte or two hexidecimals for bool)
  if (abiType === "bool") {
    return hexToBool(data) as TPrimitiveType;
  }

  if (/^bytes(\d+)?$/.test(abiType)) {
    // TODO: decide if we want to enforce bytes length based on type
    return data as TPrimitiveType;
  }

  if (abiType === "string") {
    // TODO: enforce passing in length so we only trim when it's appropriate?
    return hexToString(trim(data, { dir: "right" })) as TPrimitiveType;
  }

  if (abiType === "address") {
    return getAddress(data) as TPrimitiveType;
  }

  if (/^u?int\d+$/.test(abiType)) {
    const value = hexToBigInt(data, { signed: /^int/.test(abiType) });
    return (typeof getAbiTypeDefaultValue(abiType) === "number" ? Number(value) : value) as TPrimitiveType;
  }

  throw new Error("not implemented");
}
