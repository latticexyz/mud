import { AbiTypeToPrimitiveType, getAbiTypeDefaultValue } from "@latticexyz/schema-type";
import { AbiType } from "abitype";
import { Hex, hexToBigInt, hexToBool } from "viem";

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

  if (/^u?int\d+$/.test(abiType)) {
    const value = hexToBigInt(data, { signed: /^int/.test(abiType) });
    return (typeof getAbiTypeDefaultValue(abiType) === "number" ? Number(value) : value) as TPrimitiveType;
  }

  throw new Error("not implemented");
}
