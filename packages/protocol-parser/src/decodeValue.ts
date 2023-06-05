import { AbiTypeToPrimitiveType } from "@latticexyz/schema-type";
import { AbiType } from "abitype";
import { Hex, hexToBool } from "viem";

// TODO: narrow AbiType to what we support with SchemaType?

export function decodeValue<TAbiType extends AbiType, TPrimitiveType extends AbiTypeToPrimitiveType<TAbiType>>(
  abiType: AbiType,
  data: Hex
): TPrimitiveType {
  // TODO: decide if we should validate hex is bytes/octets (even number of hexidecimals)
  // TODO: decide if we should only parse packed-length hex (e.g. one byte or two hexidecimals for bool)

  if (abiType === "bool") {
    return hexToBool(data) as TPrimitiveType;
  }

  throw new Error("not implemented");
}
